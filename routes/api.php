<?php
require_once __DIR__ . '/../vendor/autoload.php';


header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);


if (strpos($requestUri, '/doctorna') === 0) {
    $requestUri = substr($requestUri, strlen('/doctorna'));
}
$requestUri = rtrim($requestUri, '/');
if (empty($requestUri)) {
    $requestUri = '/';
}


if (strpos($requestUri, '/sub-services') === 0) {
    require_once __DIR__ . '/SubServiceRoute.php';
} else {
    require_once __DIR__ . '/../helper/response.php';
    response(404, "Endpoint not found");
}
