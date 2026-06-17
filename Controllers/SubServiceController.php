<?php

require_once __DIR__ . '/../repos/SubServiceRepo.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/JWT.php';
require_once __DIR__ . '/../helper/cache.php';

function getSubService($conn, $id) {
    $subService = getSubServiceById($conn, $id);
    if (!$subService) {
        response(HttpStatus('NOT_FOUND'), "SubService not found");
    }
    return $subService;
}

function clearSubServiceCache($id = null) {
    global $redis;
    $keysToDelete = $redis->keys('subservices:*');
    if ($id) {
        $keysToDelete[] = 'subservice:' . $id;
    }
    if (!empty($keysToDelete)) {
        deleteFromCache($keysToDelete);
    }
}

function handleGetAllSubServices($conn) {
    $cacheKey = "subservices:all";
    if (isset($_GET['name'])) {
        $cacheKey = "subservices:filter:name=" . urlencode($_GET['name']);
    }

    serveFromCacheIfAvailable($cacheKey, "SubServices fetched successfully");
    $data = getAllSubServices($conn);
    saveToCache($cacheKey, $data);

    response(HttpStatus('OK'), "SubServices fetched successfully", [
        'source' => 'database',
        'data' => $data
    ]);
}

function handleGetSubServiceById($conn) {
    $id = getRequiredId();
    $cacheKey = "subservice:" . $id;

    serveFromCacheIfAvailable($cacheKey, "SubService fetched successfully");
    $data = getSubService($conn, $id);
    saveToCache($cacheKey, $data);

    response(HttpStatus('OK'), "SubService fetched successfully", [
        'source' => 'database',
        'data' => $data
    ]);
}

function handleCreateSubService($conn) {
    checkAdminPrivileges();
    
    $data = getJsonInput(['name', 'fees', 'description']);
    if (strlen($data['name']) > 15) {
        response(HttpStatus('BAD_REQUEST'), "Name must not exceed 15 characters");
    }
    if (!is_numeric($data['fees']) || $data['fees'] < 0) {
        response(HttpStatus('BAD_REQUEST'), "Invalid fees value");
    }

    $new = createSubService($conn, $data);
    clearSubServiceCache();
    response(HttpStatus('CREATED'), "SubService created successfully", $new);
}

function handleUpdateSubService($conn) {
    checkAdminPrivileges();

    $id = getRequiredId();
    $subService = getSubService($conn, $id);

    $data = getJsonInput();
    if (empty($data)) {
        response(HttpStatus('BAD_REQUEST'), "No fields provided for update");
    }

    $updateData = [
        'name' => $data['name'] ?? $subService['name'],
        'fees' => $data['fees'] ?? $subService['fees'],
        'description' => $data['description'] ?? $subService['description']
    ];

    if (strlen($updateData['name']) > 15) {
        response(HttpStatus('BAD_REQUEST'), "Name must not exceed 15 characters");
    }
    if (!is_numeric($updateData['fees']) || $updateData['fees'] < 0) {
        response(HttpStatus('BAD_REQUEST'), "Invalid fees value");
    }

    $updated = updateSubService($conn, $id, $updateData);
    clearSubServiceCache($id);
    response(HttpStatus('OK'), "SubService updated successfully", $updated);
}

function handleDeleteSubService($conn) {
    checkAdminPrivileges();

    $id = getRequiredId();
    getSubService($conn, $id);

    softDeleteSubService($conn, $id);
    clearSubServiceCache($id);
    response(HttpStatus('OK'), "SubService deleted successfully");
}
