<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../Controllers/SpecialityController.php';

$module = basename(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH));
$method = $_SERVER["REQUEST_METHOD"];

if (strtolower($module) === "specialities" || strtolower($module) === "speciality") {
    switch ($method) {
        case "GET":
            if (isset($_GET['id'])) {
                handleGetSpecialityById($conn);
            } else {
                handleGetAllSpecialities($conn);
            }
            break;
        case "POST":
            handleCreateSpeciality($conn);
            break;
        case "PUT":
        case "PATCH":
            handleUpdateSpeciality($conn);
            break;
        case "DELETE":
            handleDeleteSpeciality($conn);
            break;
        default:
            methodNotAllowed();
            break;
    }
} else {
    response(HttpStatus('NOT_FOUND'), "API Endpoint Not Found");
}
