<?php

require_once __DIR__ . '/../repos/PatientRepo.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/cache.php';
require_once __DIR__ . '/../helper/JWT.php';

// ==========================================
// VALIDATION HELPERS
// ==========================================
function validatePatientData($data) {
    if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        response(HttpStatus('BAD_REQUEST'), "Invalid email format");
    }
    if (isset($data['age']) && (!is_numeric($data['age']) || $data['age'] <= 0 || $data['age'] > 120)) {
        response(HttpStatus('BAD_REQUEST'), "Age must be a valid positive number between 1 and 120");
    }
    if (isset($data['gender']) && !in_array(strtolower($data['gender']), ['male', 'female'])) {
        response(HttpStatus('BAD_REQUEST'), "Gender must be either 'male' or 'female'");
    }
}

function getPatient($conn, $id) {
    $patient = getPatientById($conn, $id);
    if (!$patient) {
        response(HttpStatus('NOT_FOUND'), "Patient not found");
    }
    return $patient;
}

function clearPatientCache($id = null) {
    global $redis;
    $keysToDelete = $redis->keys('patients:*');
    if ($id) {
        $keysToDelete[] = 'patient:' . $id;
    }
    if (!empty($keysToDelete)) {
        deleteFromCache($keysToDelete);
    }
}

function handleGetAllPatients($conn) {
    checkAdminPrivileges();
    
    // Reuse validation guard for filter parameters
    validatePatientData($_GET);

    // Build dynamic, sorted cache key automatically
    $cacheKey = generateFilteredCacheKey('patients', ['gender', 'age', 'name', 'page', 'limit']);

    serveFromCacheIfAvailable($cacheKey, "Patients fetched successfully");

    $patients = getAllPatients($conn);
    saveToCache($cacheKey, $patients);

    response(HttpStatus('OK'), "Patients fetched successfully", [
        'source' => 'database',
        'data' => $patients
    ]);
}

function handleGetPatientById($conn) {
    checkAdminPrivileges();

    $id = getRequiredId();
    $cacheKey = "patient:" . $id;

    serveFromCacheIfAvailable($cacheKey, "Patient fetched successfully");

    $patient = getPatient($conn, $id);
    saveToCache($cacheKey, $patient);

    response(HttpStatus('OK'), "Patient fetched successfully", [
        'source' => 'database',
        'data' => $patient
    ]);
}

function handleUpdatePatient($conn) {
    checkAdminPrivileges();

    $id = getRequiredId();
    $patient = getPatient($conn, $id);

    $data = getJsonInput();
    if (empty($data)) {
        response(HttpStatus('BAD_REQUEST'), "No fields provided for update");
    }

    validatePatientData($data);

    $updateData = [
        'name' => $data['name'] ?? $patient['name'],
        'email' => $data['email'] ?? $patient['email'],
        'age' => $data['age'] ?? $patient['age'],
        'gender' => $data['gender'] ?? $patient['gender'],
        'phone' => $data['phone'] ?? $patient['phone']
    ];

    $updatedPatient = updatePatient($conn, $id, $updateData);
    
    clearPatientCache($id);
    response(HttpStatus('OK'), "Patient updated successfully", $updatedPatient);
}

function handleDeletePatient($conn) {
    checkAdminPrivileges();

    $id = getRequiredId();
    getPatient($conn, $id);

    softDeletePatient($conn, $id);
    
    clearPatientCache($id);
    response(HttpStatus('OK'), "Patient deleted successfully");
}
