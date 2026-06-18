<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

// Include Core Helpers
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/JWT.php';
require_once __DIR__ . '/../helper/cache.php';
require_once __DIR__ . '/../helper/filtration.php';
require_once __DIR__ . '/../helper/pagination.php';

// Include All Controllers
require_once __DIR__ . '/../Controllers/AuthController.php';
require_once __DIR__ . '/../Controllers/DoctorController.php';
require_once __DIR__ . '/../Controllers/AppointmentController.php';
require_once __DIR__ . '/../Controllers/PatientController.php';
require_once __DIR__ . '/../Controllers/SpecialityController.php';
require_once __DIR__ . '/../Controllers/SubServiceController.php';

header("Content-Type: application/json");

// Global exception handler — catches unhandled PDOExceptions and other errors
set_exception_handler(function (Throwable $e) {
    error_log("Unhandled exception: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    response(HttpStatus('INTERNAL_SERVER_ERROR'), "Internal Server Error — Something went wrong on our side.");
});

// ==============================================================================
// 1. URL PARSER & ROUTING ENGINE
// ==============================================================================
$method = $_SERVER["REQUEST_METHOD"];

/* 
 * HOW IT WORKS:
 * We use a hybrid routing model:
 * 1. Paths are used for Actions: /api.php/auth/login
 * 2. Query Params are used for IDs & Filters: /api.php/doctors?id=5&gender=female
 * 
 * Step A: Get the path after 'api.php'
 *   - $_SERVER['PATH_INFO'] naturally holds this (e.g., "/auth/login").
 *   - Fallback: Some servers (Nginx/strict XAMPP) don't set PATH_INFO. We calculate it manually.
 */
$path = $_SERVER['PATH_INFO'] ?? str_replace($_SERVER['SCRIPT_NAME'], '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

/*
 * Step B: Slice the path into usable variables
 *   - "/auth/login" becomes  $module = 'auth',    $action = 'login'
 *   - "/doctors"    becomes  $module = 'doctors', $action = ''
 * 
 * Note: IDs are intentionally NOT parsed from the path. 
 * They are handled safely via standard PHP $_GET['id'] in the Controllers.
 */
$path = trim($path, '/');
$segments = explode('/', $path);

$module = strtolower($segments[0] ?? '');
$action = strtolower($segments[1] ?? '');
// ==============================================================================


// 2. Master Router
switch ($module) {

    // ---------------------------------------------------------
    // AUTHENTICATION MODULE
    // ---------------------------------------------------------
    case 'auth':
        if ($method !== 'POST') methodNotAllowed();
        
        switch ($action) {
            case 'login':           handleLogin($conn); break;
            case 'register':        handleRegister($conn); break;
            case 'forgot-password': handleForgotPassword($conn); break;
            case 'reset-password':  handleResetPassword($conn); break;
            default:                response(HttpStatus('NOT_FOUND'), "Auth Endpoint Not Found");
        }
        break;

    // ---------------------------------------------------------
    // DOCTORS MODULE
    // ---------------------------------------------------------
    case 'doctors':
    case 'doctor':
        switch ($method) {
            case 'GET':     isset($_GET['id']) ? handleGetDoctorById($conn) : handleGetAllDoctors($conn); break;
            case 'POST':    handleCreateDoctor($conn); break;
            case 'PUT':
            case 'PATCH':   handleUpdateDoctor($conn); break;
            case 'DELETE':  handleDeleteDoctor($conn); break;
            default:        methodNotAllowed();
        }
        break;

    // ---------------------------------------------------------
    // APPOINTMENTS MODULE
    // ---------------------------------------------------------
    case 'appointments':
    case 'appointment':
        switch ($method) {
            case 'GET':     isset($_GET['id']) ? handleGetAppointmentById($conn) : handleGetAllAppointments($conn); break;
            case 'POST':    handleCreateAppointment($conn); break;
            case 'PUT':
            case 'PATCH':   handleUpdateAppointment($conn); break;
            default:        methodNotAllowed();
        }
        break;

    // ---------------------------------------------------------
    // PATIENTS MODULE
    // ---------------------------------------------------------
    case 'patients':
    case 'patient':
        switch ($method) {
            case 'GET':     isset($_GET['id']) ? handleGetPatientById($conn) : handleGetAllPatients($conn); break;
            case 'PUT':
            case 'PATCH':   handleUpdatePatient($conn); break;
            case 'DELETE':  handleDeletePatient($conn); break;
            default:        methodNotAllowed();
        }
        break;

    // ---------------------------------------------------------
    // SPECIALITIES MODULE
    // ---------------------------------------------------------
    case 'specialities':
    case 'speciality':
        switch ($method) {
            case 'GET':     isset($_GET['id']) ? handleGetSpecialityById($conn) : handleGetAllSpecialities($conn); break;
            case 'POST':    handleCreateSpeciality($conn); break;
            case 'PUT':
            case 'PATCH':   handleUpdateSpeciality($conn); break;
            case 'DELETE':  handleDeleteSpeciality($conn); break;
            default:        methodNotAllowed();
        }
        break;

    // ---------------------------------------------------------
    // SUBSERVICES MODULE
    // ---------------------------------------------------------
    case 'subservices':
    case 'subservice':
    case 'sub-services':
        switch ($method) {
            case 'GET':     isset($_GET['id']) ? handleGetSubServiceById($conn) : handleGetAllSubServices($conn); break;
            case 'POST':    handleCreateSubService($conn); break;
            case 'PUT':
            case 'PATCH':   handleUpdateSubService($conn); break;
            case 'DELETE':  handleDeleteSubService($conn); break;
            default:        methodNotAllowed();
        }
        break;

    // ---------------------------------------------------------
    // 404 FALLBACK
    // ---------------------------------------------------------
    default:
        response(HttpStatus('NOT_FOUND'), "API Module Not Found");
        break;
}
