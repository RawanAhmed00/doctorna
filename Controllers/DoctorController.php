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
    //MAKING SURE ADMIN ENTERS A VALID RANK
    if (isset($data['rank']) && !in_array(strtolower($data['rank']), ['intern', 'resident', 'specialist', 'senior specialist', 'consultant'])) {
        response(HttpStatus('BAD_REQUEST'), "Invalid rank. Allowed values: intern, resident, specialist, senior specialist, consultant");
    }
    //MAKING SURE ADMIN ENTERS A VALID GENDER 
    if (isset($data['gender']) && !in_array(strtolower($data['gender']), ['male', 'female'])) {
        response(HttpStatus('BAD_REQUEST'), "Gender must be either 'male' or 'female'");
    }
    //MAKING SURE ADMIN ENTERS A VALID AVAILABILITY
    if (isset($data['is_available']) && !in_array($data['is_available'], [0, 1, '0', '1', true, false], true)) {
        response(HttpStatus('BAD_REQUEST'), "is_available must be 0 or 1");
    }
    //MAKING SURE ADMIN ENTERS A NUMERIC SPECIALITY ID
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

    serveFromCacheIfAvailable($cacheKey, "Doctor fetched successfully");

    $doctor = getDoctor($conn, $id);
    saveToCache($cacheKey, $doctor);

    response(HttpStatus('OK'), "Doctor fetched successfully", [
        'source' => 'database',
        'data' => $doctor
    ]);
}

function handleCreateDoctor($conn) {
    //TO MAKE SURE WHO IS PERFORMING THIS ACTION IS THE ADMIN
    checkAdminPrivileges();

    // Require all fields for creation
    $data = getJsonInput(['name', 'email', 'rank', 'gender', 'spec_id']);
    //MAKING SURE ENTERED DATA FOR DOCTOR IS CORRECT 
    validateDoctorData($data);
    //PERFORM CREATION
    $newDoctor = createDoctor($conn, $data);
    //CLEARING PREVIOUS CACHE FOR DOCTORS, SO THE NEW INSRETED DDOCTOR WILL APPEAR
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
    //LIKE clearDoctorCache() BUT FOCUSING ON SPECEFIC DOCTOR WITH $id
    clearDoctorCache($id);

    response(HttpStatus('OK'), "Doctor updated successfully", $updatedDoctor);
}
//PATCH -> UPDATE A SPECEFIC FIELD
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
    // IF WE DID NOT APPLY clearDoctorCache($id), OLD STATUS OF DOCTORS TABLE WILL REMAIN WHICH IS WRONG
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
