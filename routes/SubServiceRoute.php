<?php

require __DIR__ . "/../config/database.php";
require __DIR__ . "/../Controllers/SubServiceController.php";

$path = $_SERVER["PATH_INFO"] ?? '';
$method = $_SERVER["REQUEST_METHOD"];

if (empty($path)) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (strpos($path, '/doctorna') === 0) {
        $path = substr($path, strlen('/doctorna'));
    }
    $path = rtrim($path, '/');
}

if ($method == "GET" && $path == "/sub-services" && isset($_GET["id"])) {
    getSubServiceByIdHandler($conn, $_GET["id"]);
} elseif ($method == "GET" && $path == "/sub-services") {
    getAllSubServicesHandler($conn);
} elseif ($method == "POST" && $path == "/sub-services") {
    createSubServiceHandler($conn);
} else {
    require_once __DIR__ . '/../helper/response.php';
    response(404, "Endpoint not found");
}