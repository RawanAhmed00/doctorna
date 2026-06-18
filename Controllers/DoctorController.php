<?php

require_once __DIR__ . '/../helper/db.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/jwt.php';
require_once __DIR__ . '/../helper/cache.php';
require_once __DIR__ . '/../repos/DoctorRepo.php';


function validateDoctorData($data) {
    if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        response(HttpStatus('BAD_REQUEST'), "Invalid email format");
    }
    
    if (isset($data['rank']) && !in_array(strtolower($data['rank']), ['intern', 'resident', 'specialist', 'senior specialist', 'consultant'])) {
        response(HttpStatus('BAD_REQUEST'), "Invalid rank. Allowed values: intern, resident, specialist, senior specialist, consultant");
    }

    if (isset($data['gender']) && !in_array(strtolower($data['gender']), ['male', 'female'])) {
        response(HttpStatus('BAD_REQUEST'), "Gender must be either 'male' or 'female'");
    }

    if (isset($data['is_available']) && !in_array($data['is_available'], [0, 1, '0', '1', true, false], true)) {
        response(HttpStatus('BAD_REQUEST'), "is_available must be 0 or 1");
    }

    if (isset($data['spec_id']) && !is_numeric($data['spec_id'])) {
        response(HttpStatus('BAD_REQUEST'), "spec_id must be a numeric ID");
    }
}

function getDoctor($conn, $id) {
    $doctor = getDoctorById($conn, $id);
    if (!$doctor) {
        response(HttpStatus('NOT_FOUND'), "Doctor not found");
    }
    return $doctor;
}

function clearDoctorCache($id = null) {
    global $redis;
    
    // Find all list/filter cache keys
    $keysToDelete = $redis->keys('doctors:*');
    
    if ($id) {
        $keysToDelete[] = 'doctor:' . $id;
    }
    
    if (!empty($keysToDelete)) {
        deleteFromCache($keysToDelete);
    }
}

function handleGetAllDoctors($conn) {
    // Validate filter values if they are provided by reusing the core validation guard
    validateDoctorData($_GET);

    // Build dynamic, sorted cache key automatically
    $cacheKey = generateFilteredCacheKey('doctors', ['gender', 'rank', 'is_available', 'name', 'page', 'limit']);

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

    $includeSubservices = isset($_GET['include_subservices']) && $_GET['include_subservices'] == '1';
    $includeAll = isset($_GET['include_all']) && $_GET['include_all'] == '1';

    if ($includeSubservices) $cacheKey .= ':with_subservices';
    if ($includeAll) $cacheKey .= ':with_all';

    serveFromCacheIfAvailable($cacheKey, "Doctor fetched successfully");

    if ($includeAll) {
        $doctor = getDoctorWithAllRelations($conn, $id);
        if (!$doctor) response(HttpStatus('NOT_FOUND'), "Doctor not found");
        $doctor['subservices'] = getDoctorSubServices($conn, $id);
    } else {
        $doctor = getDoctor($conn, $id);
        if ($includeSubservices) {
            $doctor['subservices'] = getDoctorSubServices($conn, $id);
        }
    }

    saveToCache($cacheKey, $doctor);

    response(HttpStatus('OK'), "Doctor fetched successfully", [
        'source' => 'database',
        'data' => $doctor
    ]);
}

function handleAssignSubService($conn) {
    checkAdminPrivileges();
    
    $data = getJsonInput(['doctor_id', 'subservice_id']);
    
    if (!is_numeric($data['doctor_id']) || !is_numeric($data['subservice_id'])) {
        response(HttpStatus('BAD_REQUEST'), "doctor_id and subservice_id must be numeric");
    }
    
    // Verify entities exist
    getDoctor($conn, $data['doctor_id']);
    
    // Verify subservice exists (we need to require SubServiceRepo here or just use a raw query, 
    // but cleaner to just let the DB foreign key constraint handle it or do a manual check)
    // Actually, let's just attempt to assign it. If FK fails, PDO will throw an exception 
    // which our global exception handler will catch and return 500.
    
    assignSubServiceToDoctor($conn, $data['doctor_id'], $data['subservice_id']);
    
    // Invalidate caches
    clearDoctorCache($data['doctor_id']);
    // We also need to clear subservice cache since the relationship goes both ways
    global $redis;
    try {
        $keys = $redis->keys('subservices:*');
        $keys[] = 'subservice:' . $data['subservice_id'];
        if (!empty($keys)) {
            foreach ($keys as $key) $redis->del($key);
        }
    } catch (Exception $e) {}
    
    response(HttpStatus('CREATED'), "SubService assigned to doctor successfully");
}

function handleCreateDoctor($conn) {
    checkAdminPrivileges();

    // Require all fields for creation
    $data = getJsonInput(['name', 'email', 'rank', 'gender', 'spec_id']);

    validateDoctorData($data);

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

    validateDoctorData($data);

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

    validateDoctorData($data);

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
