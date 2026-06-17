<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../Controllers/SpecialityController.php';
require_once __DIR__ . '/../helper/pagination.php';

$module = basename(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH));
$method = $_SERVER["REQUEST_METHOD"];

if (strtolower($module) === "specialities" || strtolower($module) === "speciality") {
    switch ($method) {
        case "GET":
            if (isset($_GET['id'])) {
                handleGetSpecialityById($conn);
           }
            //Pagination case:
            elseif (isset($_GET['page'])){
                $paginatedData = paginateTable($conn, 'speciality', 10);
                if (empty($paginatedData['list'])) {
                    response(HttpStatus('NOT_FOUND'), "No specialities found", $paginatedData);
                    return;
                }
           
                response(HttpStatus('OK'), "Specialities fetched successfully", $paginatedData);
            }
            else{
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


//pagination:
// if ($resource === 'specialities') {
    
//     // GET /specialities -> 🎯 نداء الـ Pagination الديناميكي وقت الحاجة
//     if ($method === 'GET' && $id === null) {
        
//         // ندهنا الدالة وبعتنا لها اسم الجدول الحقيقي في الداتابيز 'speciality'
//         $paginatedData = paginateTable($conn, 'speciality', 10);
        
//         if (empty($paginatedData['list'])) {
//             response(HttpStatus('NOT_FOUND'), "No specialities found", $paginatedData);
//             return;
//         }

//         response(HttpStatus('OK'), "Specialities retrieved successfully", $paginatedData);
//         return; // اخرج فوراً، مش محتاجين نروح للكنترولر في الـ GET All خلاص!
//     }}
