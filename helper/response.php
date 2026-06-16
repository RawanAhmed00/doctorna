<?php
function response($code, $message, $data = null) {
    header("Content-Type: application/json");
    http_response_code($code);
    $response = ["message" => $message];
    if ($data !== null) {
        $response["data"] = $data;
    }
    echo json_encode($response);
    exit;
}