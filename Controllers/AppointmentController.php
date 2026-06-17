<?php

require_once __DIR__ . '/../repos/AppointmentRepo.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/JWT.php';
require_once __DIR__ . '/../helper/pagination.php';

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

    // Validate incoming filter values if they exist
    if (isset($_GET['status'])) {
        $status = strtolower($_GET['status']);
        $acceptedStatus = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!in_array($status, $acceptedStatus, true)) {
            response(HttpStatus('BAD_REQUEST'), "Invalid status filter. Allowed: pending, confirmed, cancelled, completed");
        }
    }
    if (isset($_GET['date_time'])) {
        $dt = $_GET['date_time'];
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dt) && !preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $dt)) {
            response(HttpStatus('BAD_REQUEST'), "Invalid date_time filter format. Format: YYYY-MM-DD or YYYY-MM-DD HH:MM:SS");
        }
    }
    if (isset($_GET['doc_id']) && !is_numeric($_GET['doc_id'])) {
        response(HttpStatus('BAD_REQUEST'), "Invalid doc_id filter. Must be numeric.");
    }
    if (isset($_GET['user_id']) && !is_numeric($_GET['user_id'])) {
        response(HttpStatus('BAD_REQUEST'), "Invalid user_id filter. Must be numeric.");
    }

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
    
    $status = strtolower($data['status']);
    $acceptedStatus = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!in_array($status, $acceptedStatus, true)) {
        response(HttpStatus('BAD_REQUEST'), "Invalid status. Allowed: pending, confirmed, cancelled, completed");
    }

    $data['status'] = $status;
    $data['user_id'] = $token->user_id; // Securely take from token

    $newAppointment = createAppointment($conn, $data);
    response(HttpStatus('CREATED'), "Appointment booked successfully", $newAppointment);
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
        'doc_id' => $data['doc_id'] ?? $appointment['doc_id']
    ];

    if (isset($data['status'])) {
        $status = strtolower($data['status']);
        $acceptedStatus = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!in_array($status, $acceptedStatus, true)) {
            response(HttpStatus('BAD_REQUEST'), "Invalid status. Allowed: pending, confirmed, cancelled, completed");
        }
        $updateData['status'] = $status;
    }

    $updatedAppointment = updateAppointment($conn, $id, $updateData);
    response(HttpStatus('OK'), "Appointment updated successfully", $updatedAppointment);
}

function getAllSpecialitiesController($conn) {


    $result = paginateTable($conn, 'appointments', 10);

    if (empty($result['list'])) {
        response(HttpStatus('NOT_FOUND'), "No appointments found", $result);
        return;
    }

    response(HttpStatus('OK'), "Appointment retrieved successfully", $result);
}
