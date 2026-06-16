<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../Controllers/DoctorController.php';

$path = $_SERVER["PATH_INFO"] ?? "/";
$method = $_SERVER["REQUEST_METHOD"];

if ($path === "/doctors") {
    switch ($method) {
        case "GET":
            if (isset($_GET['id'])) {
                handleGetDoctorById($conn);
            } else {
                handleGetAllDoctors($conn);
            }
            break;
        case "POST":
            handleCreateDoctor($conn);
            break;
        case "PUT":
            handleUpdateDoctor($conn);
            break;
        case "PATCH":
            handlePatchDoctor($conn);
            break;
        case "DELETE":
            handleDeleteDoctor($conn);
            break;
        default:
            methodNotAllowed();
            break;
    }
} else {
    response(HttpStatus('NOT_FOUND'), "API Endpoint Not Found");
}
