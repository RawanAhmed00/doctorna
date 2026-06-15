<?php

require_once __DIR__ . '/../Controllers/SubServiceController.php';

use App\Controllers\SubServiceController;

$controller = new SubServiceController();
$requestMethod = $_SERVER['REQUEST_METHOD'];


$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);


if (strpos($requestUri, '/doctorna') === 0) {
    $requestUri = substr($requestUri, strlen('/doctorna'));
}
$requestUri = rtrim($requestUri, '/');
if (empty($requestUri)) {
    $requestUri = '/';
}


if ($requestUri === '/sub-services') {
    if ($requestMethod === 'GET') {
        $controller->getAll();
    } elseif ($requestMethod === 'POST') {
        $controller->create();
    } else {
        require_once __DIR__ . '/../helper/response.php';
        methodNotAllowed();
    }
} elseif (preg_match('#^/sub-services/(\d+)$#', $requestUri, $matches)) {
    $id = (int)$matches[1];
    if ($requestMethod === 'GET') {
        $controller->getById($id);
    } else {
        require_once __DIR__ . '/../helper/response.php';
        methodNotAllowed();
    }
} else {
    require_once __DIR__ . '/../helper/response.php';
    response(404, "Endpoint not found");
}
