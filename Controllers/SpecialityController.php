<?php

require_once __DIR__ . '/../repos/SpecialityRepo.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/cache.php';
require_once __DIR__ . '/../helper/JWT.php';

// ==========================================
// VALIDATION HELPERS
// ==========================================
function validateSpecialityData($conn, $name, $currentName = null) {
    if (trim($name) === '') {
        response(HttpStatus('BAD_REQUEST'), "Speciality name cannot be empty");
    }

    // Check for duplicate name if it's a new name
    if ($currentName === null || strtolower($name) !== strtolower($currentName)) {
        $existing = getSpecialityByName($conn, $name);
        if ($existing) {
            response(HttpStatus('CONFLICT'), "Speciality with this name already exists");
        }
    }
}

function getSpeciality($conn, $id) {
    // Check if include_doctors query param is present and truthy
    $includeCount = isset($_GET['include_doctors']) && $_GET['include_doctors'] == '1';
    
    $speciality = getSpecialityById($conn, $id, $includeCount);
    
    if (!$speciality) {
        response(HttpStatus('NOT_FOUND'), "Speciality not found");
    }
    return $speciality;
}

function clearSpecialityCache($id = null) {
    global $redis;
    $keysToDelete = $redis->keys('specialities:*');
    if ($id) {
        $keysToDelete[] = 'speciality:' . $id;
        $keysToDelete[] = 'speciality:' . $id . ':with_doctors';
    }
    if (!empty($keysToDelete)) {
        deleteFromCache($keysToDelete);
    }
}

function handleGetAllSpecialities($conn) {
    // Build dynamic, sorted cache key automatically
    $cacheKey = generateFilteredCacheKey('specialities', ['name']);

    serveFromCacheIfAvailable($cacheKey, "Specialities fetched successfully");

    $specialities = getAllSpecialities($conn);
    saveToCache($cacheKey, $specialities);

    response(HttpStatus('OK'), "Specialities fetched successfully", [
        'source' => 'database',
        'data' => $specialities
    ]);
}

function handleGetSpecialityById($conn) {
    $id = getRequiredId();
    $cacheKey = "speciality:" . $id;
    if (isset($_GET['include_doctors']) && $_GET['include_doctors'] == '1') {
        $cacheKey .= ":with_doctors";
    }

    serveFromCacheIfAvailable($cacheKey, "Speciality fetched successfully");

    $speciality = getSpeciality($conn, $id);
    saveToCache($cacheKey, $speciality);

    response(HttpStatus('OK'), "Speciality fetched successfully", [
        'source' => 'database',
        'data' => $speciality
    ]);
}

function handleCreateSpeciality($conn) {
    checkAdminPrivileges();
    
    $data = getJsonInput(['name', 'description']);
    
    validateSpecialityData($conn, $data['name']);

    $newSpeciality = createSpeciality($conn, $data);
    
    clearSpecialityCache();
    response(HttpStatus('CREATED'), "Speciality created successfully", $newSpeciality);
}

function handleUpdateSpeciality($conn) {
    checkAdminPrivileges();

    $id = getRequiredId();
    $speciality = getSpeciality($conn, $id);

    $data = getJsonInput();
    if (empty($data)) {
        response(HttpStatus('BAD_REQUEST'), "No fields provided for update");
    }

    $updateData = [
        'name' => $data['name'] ?? $speciality['name'],
        'description' => $data['description'] ?? $speciality['description']
    ];

    if (isset($data['name'])) {
        validateSpecialityData($conn, $data['name'], $speciality['name']);
    }

    $updatedSpeciality = updateSpeciality($conn, $id, $updateData);
    
    clearSpecialityCache($id);
    response(HttpStatus('OK'), "Speciality updated successfully", $updatedSpeciality);
}

function handleDeleteSpeciality($conn) {
    checkAdminPrivileges();

    $id = getRequiredId();
    getSpeciality($conn, $id);

    softDeleteSpeciality($conn, $id);
    
    clearSpecialityCache($id);
    response(HttpStatus('OK'), "Speciality deleted successfully");
}
