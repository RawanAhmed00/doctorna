<?php

require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/JWT.php';
require_once __DIR__ . '/../helper/cache.php';
require_once __DIR__ . '/../repos/SubServiceRepo.php';


function getAllSubServicesHandler($conn) {
    VerifyToken();

    $cacheKey = 'subservices:all';

    serveFromCacheIfAvailable($cacheKey, "Sub services fetched successfully");

    $data = getAllSubServices($conn);

    saveToCache($cacheKey, $data);

    response(200, "Sub services fetched successfully", [
        'source' => 'database',
        'data' => $data
    ]);
}


function getSubServiceByIdHandler($conn, $id) {
    VerifyToken();

    $cacheKey = "subservices:$id";

    serveFromCacheIfAvailable($cacheKey, "Sub service fetched successfully");

    $data = getSubServiceById($conn, $id);

    if (!$data) {
        response(404, "Sub service not found");
    }

    saveToCache($cacheKey, $data);

    response(200, "Sub service fetched successfully", [
        'source' => 'database',
        'data' => $data
    ]);
}


function createSubServiceHandler($conn) {
    $verifiedToken = VerifyToken();
    require_admin($verifiedToken);

    $data = getJsonInput(['name', 'fees', 'description']);

    if (strlen($data['name']) > 15) {
        response(400, "Name must not exceed 15 characters");
    }

    if (!is_numeric($data['fees']) || $data['fees'] < 0) {
        response(400, "Invalid fees value");
    }

    $new = createSubService($conn, $data);

    deleteFromCache('subservices:all');

    response(201, "Sub service created successfully", $new);
}