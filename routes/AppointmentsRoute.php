<?php

require __DIR__ . "/../config/database.php";
require __DIR__ ."/../Controllers/AppointmentController.php";

$path=$_SERVER["PATH_INFO"];
$method=$_SERVER["REQUEST_METHOD"];

if($method=="GET"&& $path =="/Appointment"&& isset ($_GET["id"])){
    GetById($conn,$id );
}elseif ($method=="GET" && $path== "/Appointment")
{
    GetALL ($conn );
}elseif ($method =="PATCH" && $path == "/Appointment")
{
    PostAppointment ($conn);
}elseif ($method=="GET" && $path =="/Appointment")
 {
    GetFilter($conn);
}