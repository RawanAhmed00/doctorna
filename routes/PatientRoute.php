<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../Controllers/PatientController.php';

$module = basename(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH));
$method = $_SERVER["REQUEST_METHOD"];

if (strtolower($module) === "patients" || strtolower($module) === "patient") {
    switch ($method) {
        case "GET":
            if (isset($_GET['id'])) {
                handleGetPatientById($conn);
            } else {
                handleGetAllPatients($conn);
            }
            break;
        case "PUT":
        case "PATCH":
            handleUpdatePatient($conn);
            break;
        case "DELETE":
            handleDeletePatient($conn);
            break;
        default:
            methodNotAllowed();
            break;
    }
} else {
    response(HttpStatus('NOT_FOUND'), "API Endpoint Not Found");
}
