<?php
require_once __DIR__ .'/../config/database.php';
require_once __DIR__ .'/../repos/AuthRepo.php';
require_once __DIR__ .'/../Controllers/AuthController.php';


$slug=basename(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$method=$_SERVER['REQUEST_METHOD'];
$data=json_decode((file_get_contents('php://input')), true);

if($_SERVER['REQUEST_METHOD'] =='POST' && $slug =='login'){
    login($data);
}
elseif($_SERVER['REQUEST_METHOD']=='POST' && $slug=='register'){
   register($data);
}
else{
    response(404,"Wrong Route!");
}



?>