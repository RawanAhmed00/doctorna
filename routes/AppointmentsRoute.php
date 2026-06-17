<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../Controllers/AppointmentController.php';

$module = basename(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH));
$method = $_SERVER["REQUEST_METHOD"];

if (strtolower($module) === "appointments" || strtolower($module) === "appointment") {
    switch ($method) {
        case "GET":
            if (isset($_GET['id'])) {
                handleGetAppointmentById($conn);
            }elseif (isset($_GET['page'])){
                $paginatedData = paginateTable($conn, 'appointments', 10);
                if (empty($paginatedData['list'])) {
                    response(HttpStatus('NOT_FOUND'), "No Appointments found", $paginatedData);
                    return;
                }
           
                response(HttpStatus('OK'), "Appointments fetched successfully", $paginatedData);
            }
            else {
                handleGetAllAppointments($conn);
            }
            break;
        case "POST":
            handleCreateAppointment($conn);
            break;
        case "PATCH":
            handleUpdateAppointment($conn);
            break;
        default:
            methodNotAllowed();
            break;
    }
} else {
    response(HttpStatus('NOT_FOUND'), "API Endpoint Not Found");
}
