<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../Controllers/PatientController.php';
require_once __DIR__ . '/../helper/pagination.php';

$module = basename(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH));
$method = $_SERVER["REQUEST_METHOD"];

if (strtolower($module) === "patients" || strtolower($module) === "patient") {
    switch ($method) {
        case "GET":
            if (isset($_GET['id'])) {
                handleGetPatientById($conn);
            } 
            elseif (isset($_GET['page'])){
                $paginatedData = paginateTable($conn, 'users', 10);
                if (empty($paginatedData['list'])) {
                    response(HttpStatus('NOT_FOUND'), "No users found", $paginatedData);
                    return;
                }
           
                response(HttpStatus('OK'), "Users fetched successfully", $paginatedData);
            }
            else{
                handleGetAllPatients($conn);
            }
            break;
        default:
            methodNotAllowed();
            break;
    }
} else {
    response(HttpStatus('NOT_FOUND'), "API Endpoint Not Found");
}
// //elseif (isset($_GET['page'])){
//                 $paginatedData = paginateTable($conn, 'speciality', 10);
//                 if (empty($paginatedData['list'])) {
//                     response(HttpStatus('NOT_FOUND'), "No specialities found", $paginatedData);
//                     return;
//                 }
           
//                 response(HttpStatus('OK'), "Specialities fetched successfully", $paginatedData);
//             }
