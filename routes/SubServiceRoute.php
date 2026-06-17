<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../Controllers/SubServiceController.php';

$module = basename(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH));
$method = $_SERVER["REQUEST_METHOD"];

if (strtolower($module) === "subservices" || strtolower($module) === "subservice" || strtolower($module) === "sub-services") {
    switch ($method) {
        case "GET":
            if (isset($_GET['id'])) {
                handleGetSubServiceById($conn);
            } else {
                handleGetAllSubServices($conn);
            }
            break;
        case "POST":
            handleCreateSubService($conn);
            break;
        case "PUT":
        case "PATCH":
            handleUpdateSubService($conn);
            break;
        case "DELETE":
            handleDeleteSubService($conn);
            break;
        default:
            methodNotAllowed();
            break;
    }
} else {
    response(HttpStatus('NOT_FOUND'), "API Endpoint Not Found");
}
