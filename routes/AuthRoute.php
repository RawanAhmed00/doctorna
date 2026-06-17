<?php
require_once __DIR__ .'/../config/database.php';
require_once __DIR__ .'/../repos/AuthRepo.php';
require_once __DIR__ .'/../helper/request.php';
require_once __DIR__ .'/../helper/status.php';
require_once __DIR__ .'/../helper/response.php';
require_once __DIR__ .'/../Controllers/AuthController.php';

$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$action = basename($uri);               
$module = basename(dirname($uri));      

$method = $_SERVER["REQUEST_METHOD"];
//NO GET HERE, MAIN USER IS PATIENT, SO CAN NOT GET, ONLY LOGIN, REGISTER
if ($module === 'auth') {
    if ($method !== 'POST') {
        methodNotAllowed();
    }

    switch ($action) {
        case 'login':
            handleLogin($conn);
            break;
        case 'register':
            handleRegister($conn);
            break;
        case 'forgot-password':
            handleForgotPassword($conn);
            break;
        case 'reset-password':
            handleResetPassword($conn);
            break;
        default:
            response(HttpStatus('NOT_FOUND'), "API Endpoint Not Found");
            break;
    }
} else {
    response(HttpStatus('NOT_FOUND'), "API Module Not Found");
}
