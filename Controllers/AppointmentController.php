<?php

require_once __DIR__ . '/../repos/AppointmentRepo.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/JWT.php';
require_once __DIR__ . '/../helper/pagination.php';

// ==========================================
// VALIDATION HELPERS
// ==========================================
function validateAppointmentData(&$data) {
    if (isset($data['status'])) {
        $data['status'] = strtolower($data['status']);
        $acceptedStatus = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!in_array($data['status'], $acceptedStatus, true)) {
            response(HttpStatus('BAD_REQUEST'), "Invalid status. Allowed: pending, confirmed, cancelled, completed");
        }
    }
    
    if (isset($data['date_time'])) {
        $dt = $data['date_time'];
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dt) && !preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $dt)) {
            response(HttpStatus('BAD_REQUEST'), "Invalid date_time format. Format: YYYY-MM-DD or YYYY-MM-DD HH:MM:SS");
        }
    }

    if (isset($data['doc_id']) && !is_numeric($data['doc_id'])) {
        response(HttpStatus('BAD_REQUEST'), "Invalid doc_id. Must be numeric.");
    }

    if (isset($data['user_id']) && !is_numeric($data['user_id'])) {
        response(HttpStatus('BAD_REQUEST'), "Invalid user_id. Must be numeric.");
    }

    if (isset($data['spec_id']) && $data['spec_id'] !== null && !is_numeric($data['spec_id'])) {
        response(HttpStatus('BAD_REQUEST'), "Invalid spec_id. Must be numeric.");
    }

    if (isset($data['type'])) {
        $data['type'] = strtolower($data['type']);
        if (!in_array($data['type'], ['consultation', 'procedure'], true)) {
            response(HttpStatus('BAD_REQUEST'), "Invalid type. Allowed: consultation, procedure");
        }
    }

    if (isset($data['parent_id']) && $data['parent_id'] !== null && !is_numeric($data['parent_id'])) {
        response(HttpStatus('BAD_REQUEST'), "Invalid parent_id. Must be numeric.");
    }
}

function getAppointment($conn, $id) {
    $appointment = getAppointmentById($conn, $id);
    if (!$appointment) {
        response(HttpStatus('NOT_FOUND'), "Appointment not found");
    }
    return $appointment;
}

function handleGetAppointmentById($conn) {
    $token = VerifyToken();
    require_admin($token);

    $id = getRequiredId();
    $appointment = getAppointment($conn, $id);

    response(HttpStatus('OK'), "Appointment fetched successfully", $appointment);
}

function handleGetAllAppointments($conn) {
    $token = VerifyToken();

    // Reuse validation guard for filter parameters
    validateAppointmentData($_GET);

    if ($token->role === "user") {
        $appointments = getAppointmentsByUserId($conn, $token->user_id);
        response(HttpStatus('OK'), "Your appointments fetched successfully", $appointments);
    } else {
        require_admin($token);
        $appointments = getAllAppointments($conn);
        response(HttpStatus('OK'), "All appointments fetched successfully", $appointments);
    }
}

function handleCreateAppointment($conn) {
    $token = VerifyToken();
    
    // Only users book appointments
    if ($token->role !== "user") {
        response(HttpStatus('FORBIDDEN'), "Only users can book appointments");
    }

    $data = getJsonInput(['status', 'date_time', 'doc_id']);
    $rawBody = json_decode(file_get_contents("php://input"), true) ?? [];
    
    $data['type'] = isset($rawBody['type']) ? strtolower($rawBody['type']) : 'consultation';
    $data['parent_id'] = $rawBody['parent_id'] ?? null;
    
    require_once __DIR__ . '/../repos/DoctorRepo.php';

    if ($data['type'] === 'procedure') {
        // Procedure: requires parent consultation + subservices
        if (empty($data['parent_id'])) {
            response(HttpStatus('BAD_REQUEST'), "Procedure appointments require a parent_id linking to a consultation");
        }
        
        // Validate parent exists and is a consultation
        $parent = getAppointmentById($conn, $data['parent_id']);
        if (!$parent) {
            response(HttpStatus('BAD_REQUEST'), "Parent appointment not found");
        }
        if ($parent['type'] !== 'consultation') {
            response(HttpStatus('BAD_REQUEST'), "Parent appointment must be a consultation (type=consultation)");
        }
        
        // Inherit spec_id from parent consultation if not explicitly set
        if (!isset($rawBody['spec_id'])) {
            $data['spec_id'] = $parent['spec_id'];
        }
        
        // Procedure requires at least one subservice
        if (!isset($rawBody['subservice_ids']) || !is_array($rawBody['subservice_ids']) || empty($rawBody['subservice_ids'])) {
            response(HttpStatus('BAD_REQUEST'), "Procedure appointments require at least one subservice_id");
        }
        $data['subservice_ids'] = $rawBody['subservice_ids'];
        
        // Validate all subservices are offered by this doctor
        $doctorOffers = getDoctorSubServices($conn, $data['doc_id']);
        $offeredIds = array_column($doctorOffers, 'id');
        foreach ($data['subservice_ids'] as $requested_id) {
            if (!in_array($requested_id, $offeredIds)) {
                response(HttpStatus('BAD_REQUEST'), "The selected doctor does not offer subservice ID: $requested_id");
            }
        }
    } else {
        // Consultation: subservice_ids optional, parent_id not allowed
        if ($data['parent_id']) {
            response(HttpStatus('BAD_REQUEST'), "Consultation appointments cannot have a parent_id");
        }
        $data['parent_id'] = null;
        
        // Auto-populate spec_id from doctor
        if (!isset($rawBody['spec_id'])) {
            $doctor = getDoctorById($conn, $data['doc_id']);
            $data['spec_id'] = $doctor ? $doctor['spec_id'] : null;
        }
        
        // Optional subservice_ids
        if (isset($rawBody['subservice_ids'])) {
            if (!is_array($rawBody['subservice_ids'])) {
                response(HttpStatus('BAD_REQUEST'), "subservice_ids must be an array");
            }
            $data['subservice_ids'] = $rawBody['subservice_ids'];
            $doctorOffers = getDoctorSubServices($conn, $data['doc_id']);
            $offeredIds = array_column($doctorOffers, 'id');
            foreach ($data['subservice_ids'] as $requested_id) {
                if (!in_array($requested_id, $offeredIds)) {
                    response(HttpStatus('BAD_REQUEST'), "The selected doctor does not offer subservice ID: $requested_id");
                }
            }
        }
    }
    
    validateAppointmentData($data);
    $data['user_id'] = $token->user_id;

    $newAppointment = createAppointment($conn, $data);
    
    // Clear caches
    global $redis;
    try {
        $keys = $redis->keys('appointments:*');
        if (!empty($keys)) {
            foreach ($keys as $key) $redis->del($key);
        }
    } catch (Exception $e) {}
    
    $msg = $data['type'] === 'procedure' ? "Procedure booked successfully" : "Appointment booked successfully";
    response(HttpStatus('CREATED'), $msg, $newAppointment);
}

function handleUpdateAppointment($conn) {
    $token = VerifyToken();
    require_admin($token);

    $id = getRequiredId();
    $appointment = getAppointment($conn, $id);

    // PATCH partial update logic
    $data = getJsonInput();
    if (empty($data)) {
        response(HttpStatus('BAD_REQUEST'), "No fields provided for update");
    }

    // Merge existing with new
    $updateData = [
        'status' => $data['status'] ?? $appointment['status'],
        'date_time' => $data['date_time'] ?? $appointment['date_time'],
        'user_id' => $data['user_id'] ?? $appointment['user_id'],
        'doc_id' => $data['doc_id'] ?? $appointment['doc_id'],
        'spec_id' => array_key_exists('spec_id', $data) ? $data['spec_id'] : $appointment['spec_id'],
        'type' => array_key_exists('type', $data) ? $data['type'] : $appointment['type'],
        'parent_id' => array_key_exists('parent_id', $data) ? $data['parent_id'] : $appointment['parent_id']
    ];

    validateAppointmentData($updateData);

    $updatedAppointment = updateAppointment($conn, $id, $updateData);
    response(HttpStatus('OK'), "Appointment updated successfully", $updatedAppointment);
}


