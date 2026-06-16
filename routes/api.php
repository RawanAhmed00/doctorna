<?php
require_once __DIR__ . '/../vendor/autoload.php';
// API Routes matching Task-05 style

use App\Http\Controllers\PatientController;

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';

// POST - Create Patient
if ($method == "POST" && $path == "/patient") {
    require_once _DIR_ . "/../controllers/PatientController.php";
    createPatient($conn);
}

// PUT - Update Patient
elseif ($method == "PUT" && $path == "/patient" && isset($_GET['id'])) {
    require_once _DIR_ . "/../controllers/PatientController.php";
    updatePatient($conn, $_GET['id']);
}

// DELETE - Delete Patient
elseif ($method == "DELETE" && $path == "/patient" && isset($_GET['id'])) {
    require_once _DIR_ . "/../controllers/PatientController.php";
    deletePatient($conn, $_GET['id']);
}
