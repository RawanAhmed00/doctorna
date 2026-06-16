<?php

require_once __DIR__ . '/../helper/db.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/jwt.php';
require_once __DIR__ . '/../helper/cache.php';
require_once __DIR__ . '/../repos/DoctorRepo.php';

// --- Local Helpers for DRY Code ---

function getDoctor($conn, $id) {
    $doctor = getDoctorById($conn, $id);
    if (!$doctor) {
        response(HttpStatus('NOT_FOUND'), "Doctor not found");
    }
    return $doctor;
}

function clearDoctorCache($id = null) {
    global $redis;
    try {
        $redis->del('doctors:all');
        if ($id) {
            $redis->del('doctor:' . $id);
        }
    } catch (\Exception $e) {
        // Redis is down, fail gracefully
    }
}

// --- Controller Logic ---

function handleGetAllDoctors($conn) {
    $cacheKey = 'doctors:all';
    serveFromCacheIfAvailable($cacheKey, "Doctors fetched successfully");

    $doctors = getAllDoctors($conn);
    saveToCache($cacheKey, $doctors);

    response(HttpStatus('OK'), "Doctors fetched successfully", [
        'source' => 'database',
        'data' => $doctors
    ]);
}

function handleGetDoctorById($conn) {
    $id = getRequiredId();
    $cacheKey = 'doctor:' . $id;

    serveFromCacheIfAvailable($cacheKey, "Doctor fetched successfully");

    $doctor = getDoctor($conn, $id);
    saveToCache($cacheKey, $doctor);

    response(HttpStatus('OK'), "Doctor fetched successfully", [
        'source' => 'database',
        'data' => $doctor
    ]);
}

function handleCreateDoctor($conn) {
    checkAdminPrivileges();

    // Require all fields for creation
    $data = getJsonInput(['name', 'email', 'rank', 'gender', 'spec_id']);

    $newDoctor = createDoctor($conn, $data);

    clearDoctorCache();

    response(HttpStatus('CREATED'), "Doctor created successfully", $newDoctor);
}

function handleUpdateDoctor($conn) {
    checkAdminPrivileges();

    $id = getRequiredId();
    getDoctor($conn, $id);

    // Require all fields for full PUT update
    $data = getJsonInput(['name', 'email', 'rank', 'gender', 'is_available', 'spec_id']);

    $updatedDoctor = updateDoctor($conn, $id, $data);

    clearDoctorCache($id);

    response(HttpStatus('OK'), "Doctor updated successfully", $updatedDoctor);
}

function handlePatchDoctor($conn) {
    checkAdminPrivileges();

    $id = getRequiredId();
    getDoctor($conn, $id);

    // Don't require specific fields for PATCH, just take what is sent
    $data = getJsonInput();
    
    if (empty($data)) {
        response(HttpStatus('BAD_REQUEST'), "No fields provided for update");
    }

    $updatedDoctor = null;
    $allowed = ['name', 'email', 'rank', 'gender', 'is_available', 'spec_id'];
    
    // Call the repo function for each valid field sent
    foreach ($data as $key => $value) {
        if (in_array($key, $allowed)) {
            $updatedDoctor = patchDoctor($conn, $id, $key, $value);
        }
    }

    if (!$updatedDoctor) {
        response(HttpStatus('BAD_REQUEST'), "Invalid fields provided");
    }

    clearDoctorCache($id);

    response(HttpStatus('OK'), "Doctor patched successfully", $updatedDoctor);
}

function handleDeleteDoctor($conn) {
    checkAdminPrivileges();

    $id = getRequiredId();
    getDoctor($conn, $id);

    deleteDoctor($conn, $id);

    clearDoctorCache($id);

    response(HttpStatus('OK'), "Doctor deleted successfully");
}
