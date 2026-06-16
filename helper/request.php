<?php

require_once __DIR__ . "/status.php";
require_once __DIR__ . "/response.php";

function getJsonInput(array $requiredFields = []) {
    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === "")) {
            response(HttpStatus('UNPROCESSABLE_ENTITY'), "Please provide the '$field' field. It is required to proceed.");
        }
    }
    
    return $data;
}

function getRequiredId(): int {
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        response(HttpStatus('BAD_REQUEST'), "ID parameter is required and must be numeric");
    }
    return (int)$_GET['id'];
}
