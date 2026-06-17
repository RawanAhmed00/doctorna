<?php
// routes/api.php

// Include config files
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../Controllers/SpecialityController.php';
require_once __DIR__ .'/../helper/JWT.php';
require_once __DIR__ .'/../vendor/predis/src/autoload.php';

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
//     http_response_code(200);
//     exit;
// }

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];

// Get path from PATH_INFO or REQUEST_URI
if (isset($_SERVER['PATH_INFO'])) {
    $path = $_SERVER['PATH_INFO'];
} else {
    $uri = $_SERVER['REQUEST_URI'];
    $scriptName = $_SERVER['SCRIPT_NAME'];
    $path = str_replace($scriptName, '', $uri);
    $path = strtok($path, '?');
}

// Parse path
$pathParts = explode('/', trim($path, '/'));
$resource = $pathParts[0] ?? '';
$id = $pathParts[1] ?? null;

// Router for Speciality endpoints
if ($resource === 'specialities') {
    
    // GET /specialities
    if ($method === 'GET' && $id === null) {
        getAllSpecialitiesController($conn);
    }
    
    // GET /specialities/{id}
    elseif ($method === 'GET' && $id !== null) {
        getSpecialityByIdController($conn, $id);
    }
    
    // POST /specialities
    elseif ($method === 'POST' && $id === null) {
        createSpecialityController($conn);
    }
    
    // PUT /specialities/{id}
    elseif ($method === 'PUT' && $id !== null) {
        updateSpecialityController($conn, $id);
    }
    
    // DELETE /specialities/{id}
    elseif ($method === 'DELETE' && $id !== null) {
        deleteSpecialityController($conn, $id);
    }
    
    else {
        response(405, "Method not allowed");
    }
    
} else {
    response(404, "Resource not found. Available: /specialities");
}
?>