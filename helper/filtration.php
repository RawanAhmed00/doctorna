<?php
require __DIR__ ."/../config/database.php";
require __DIR__ ."/../controllers/AppointmentController.php";

// Filtration 

function GetFilter ($conn){

$query ="select * from Appointments where 1=1";
$bindings =[];

if (!empty ($_GET["status"])){
    $query.="And status =:status";
    $bindings[":status"] =$_GET["status"];
}

if (!empty ($_GET ["date_time"])){
    $query.="And date_time =:date_time";
    $bindings [":date_time"] =$_GET ["date_time"];
}
}