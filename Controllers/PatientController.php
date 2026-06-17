<?php

require_once __DIR__ . '/../repos/PatientRepo.php';
require_once __DIR__ . '/../helper/response.php';
require_once __DIR__ . '/../helper/status.php';
require_once __DIR__ . '/../helper/request.php';
require_once __DIR__ . '/../helper/cache.php';
require_once __DIR__ . '/../helper/JWT.php';

function getPatient($conn, $id) {
    $patient = getPatientById($conn, $id);
    if (!$patient) {
        response(HttpStatus('NOT_FOUND'), "Patient not found");
    }
    return $patient;
}

function handleGetAllPatients($conn) {
    $token = VerifyToken();
    require_admin($token);

    $cacheKey = "patients:all";
    serveFromCacheIfAvailable($cacheKey, "Patients fetched successfully");

    $patients = getAllPatients($conn);
    saveToCache($cacheKey, $patients);

    response(HttpStatus('OK'), "Patients fetched successfully", [
        'source' => 'database',
        'data' => $patients
    ]);
}

function handleGetPatientById($conn) {
    $token = VerifyToken();
    require_admin($token);

    $id = getRequiredId();
    $cacheKey = "patient:" . $id;

    serveFromCacheIfAvailable($cacheKey, "Patient fetched successfully");

    $patient = getPatient($conn, $id);
    saveToCache($cacheKey, $patient);

    response(HttpStatus('OK'), "Patient fetched successfully", [
        'source' => 'database',
        'data' => $patient
    ]);
}
