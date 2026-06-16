<?php

require __DIR__ . "/../connection.php";
require __DIR__ ."/../Controllers/AppointmentController.php";

$path=$_SERVER["PATH_INFO"];
$method=$_SERVER["REQUEST_METHOD"];

if($method=="GET"&& $path =="/Appointment"&& isset ($_GET["id"])){
    GetById($connection,$id );
}elseif ($method=="GET" && $path== "/Appointment")
{
    GetALL ($connection );
}elseif ($method =="PATCH" && $path == "/Appointment")
{
    UpdateAppointment($connection);
}