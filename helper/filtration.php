<?php
require_once __DIR__ . "/../config/database.php";
//require __DIR__ . "/../controllers/AppointmentController.php";
require_once __DIR__. "/status.php";

// Filtration 
function GetFilter($conn) {

    $query = "SELECT * FROM appointments WHERE 1=1";
    $bindings = [];

    if (!empty($_GET["status"])) {
       
        $query .= " AND status = :status"; 
        $bindings[":status"] = $_GET["status"];
    }

    if (!empty($_GET["date_time"])) {
        $query .= " AND date_time = :date_time"; 
        $bindings[":date_time"] = $_GET["date_time"];
    }

    
    $stmt = $conn->prepare($query);
    
    $stmt->execute($bindings);
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
} 
$res=GetFilter($conn);
header("Content-Type: application/json");
echo json_encode([
    "status_code" => 200,
    "message" => "Filtered appointments successfully",
    "data" => $res
]);
exit;