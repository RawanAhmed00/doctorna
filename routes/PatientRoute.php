<?php
require_once __DIR__ . '/../vendor/autoload.php';
// API Routes matching Task-05 style

use App\Http\Controllers\PatientController;

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';

if ($method == "PUT" && $path == "/patient" && isset($_GET['id'])) {
    require_once _DIR_ . "/../controllers/PatientController.php";
    updatePatient($conn, $_GET['id']);
}


elseif ($method == "DELETE" && $path == "/patient" && isset($_GET['id'])) {
    require_once _DIR_ . "/../controllers/PatientController.php";
    deletePatient($conn, $_GET['id']);
}
    



