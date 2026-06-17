<?php

require_once __DIR__ . '/../repos/SpecialityRepo.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/cache.php';
require_once __DIR__ . '/../helper/JWT.php';

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
    $cacheKey = "specialities:all";
    // If filtering by name
    if (isset($_GET['name'])) {
        $cacheKey = "specialities:filter:name=" . urlencode($_GET['name']);
    }

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
    
    // Check duplicate
    $existing = getSpecialityByName($conn, $data['name']);
    if ($existing) {
        response(HttpStatus('CONFLICT'), "Speciality with this name already exists");
    }

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

    // Check duplicate name on update
    if (isset($data['name']) && strtolower($data['name']) !== strtolower($speciality['name'])) {
        $existing = getSpecialityByName($conn, $data['name']);
        if ($existing) {
            response(HttpStatus('CONFLICT'), "Speciality with this name already exists");
        }
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
