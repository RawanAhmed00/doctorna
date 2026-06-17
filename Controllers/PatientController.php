<?php
require_once _DIR_ . "/../repositories/PatientRepository.php";
require_once _DIR_ . "/../helpers/response.php";

// function createPatient($conn) {
//     $data = json_decode(file_get_contents("php://input"), true);
    
    
//     if (!isset($data['name']) || !isset($data['email']) || !isset($data['phone'])) {
//         response(400, "Missing required fields: name, email, phone");
//         return;
//     }
    
//     $result = createPatientRepo($conn, $data);
//     if ($result) {
//         response(201, "Patient created successfully", $result);
//     } else {
//         response(500, "Failed to create patient");
//     }
// }

function updatePatient($conn, $id) {
    //user logs in, checking role
    $verifiedToken=VerifyToken();
    require_admin($verifiedToken);
    //if admin, allow to take data
    $data = json_decode(file_get_contents("php://input"), true);
    

    // Check if user exists
    $existing = getPatientByIdRepo($conn, $id);
    if (!$existing) {
        response(404, "Patient not found");
        return;
    }
    
    $result = updatePatientRepo($conn, $id, $data);
    if ($result) {
        response(200, "Patient updated successfully", $result);
    } else {
        response(500, "Failed to update patient");
    }
}

function deletePatient($conn, $id) {
    //user logs in, checking role
    $verifiedToken=VerifyToken();
    require_admin($verifiedToken);
    //if admin, allow to take data
    // Check if user exists
    $existing = getPatientByIdRepo($conn, $id);
    if (!$existing) {
        response(404, "Patient not found");
        return;
    }
    
    $result = deletePatientRepo($conn, $id);
    if ($result) {
        response(200, "Patient deleted successfully");
    } else {
        response(500, "Failed to delete patient");
    }
}