<?php
require_once __DIR__ .'/../config/database.php';
require_once __DIR__ .'/../repos/AuthRepo.php';
require_once __DIR__ .'/../helper/request.php';
require_once __DIR__ .'/../helper/status.php';
require_once __DIR__ .'/../Controllers/AuthController.php';

$path = $_SERVER["PATH_INFO"] ?? "/";
$method = $_SERVER["REQUEST_METHOD"];

if ($method === 'POST' && $path === '/auth/login') {
    $data = getJsonInput(['email', 'password']);
    login($data);
} elseif ($method === 'POST' && $path === '/auth/register') {
    $data = getJsonInput(['name', 'email', 'password', 'age', 'gender', 'phone', 'role']);
    register($data);
} else {
    response(HttpStatus('NOT_FOUND'), "Wrong Route!");
}
