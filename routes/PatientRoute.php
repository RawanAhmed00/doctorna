<?php

require __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../controllers/PatientController.php";

$method = $_SERVER["REQUEST_METHOD"];

if($method == "GET")
{
    if(isset($_GET["id"]))
    {
        GetUserById();
    }
    else
    {
        echo json_encode(1);
        GetUsers();
    }
}
