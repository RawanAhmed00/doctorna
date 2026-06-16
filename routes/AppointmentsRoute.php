<?php

require __DIR__ . "/../config/database.php";
require __DIR__ ."/../Controllers/AppointmentController.php";

$path=$_SERVER["PATH_INFO"] ?? '';
$method=$_SERVER["REQUEST_METHOD"];

if($method=="GET" && $path =="/appointment" && isset ($_GET["id"])){
   getappointmentbyid($conn,$_GET["id"]);
}
elseif($method=="GET" && $path== "/appointment")
{
  getallappointments($conn);
}
elseif($method =="POST" && $path == "/appointment")
{
    postappointment($conn);
}
