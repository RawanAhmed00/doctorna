<?php

require_once __DIR__ . '/../repos/SubServiceRepo.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/JWT.php';
require_once __DIR__ . '/../helper/cache.php';

// ==========================================
// VALIDATION HELPERS
// ==========================================
function validateSubServiceData($data) {
    if (isset($data['name']) && strlen($data['name']) > 15) {
        response(HttpStatus('BAD_REQUEST'), "Name must not exceed 15 characters");
    }
    if (isset($data['fees']) && (!is_numeric($data['fees']) || $data['fees'] < 0)) {
        response(HttpStatus('BAD_REQUEST'), "Invalid fees value");
    }
}

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
    // Reuse validation guard for filter parameters
    validateSubServiceData($_GET);

    // Build dynamic, sorted cache key automatically
    $cacheKey = generateFilteredCacheKey('subservices', ['name', 'min_fees', 'max_fees', 'page', 'limit']);

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
    validateSubServiceData($data);

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

    validateSubServiceData($updateData);

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
