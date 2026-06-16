<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/status.php';
require_once __DIR__ . '/response.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function GenerateToken($user){
   
$payload=[
"iat" => time(),
"exp" => time()+3600,
"user_id" => $user['id'],
"role" => $user['role']
];

return JWT::encode($payload,"B0RN0Jx6muUoyGJGmahlRiQJ6mpNXEDQShyHT8bCbYp","HS256");

}

function VerifyToken(){

$headers = getallheaders();
$token = $headers['Authorization']??'';

if(!$token){
 response(HttpStatus('UNAUTHORIZED'), "token is requird ");
}
$token = str_replace("Bearer " ,"",$token);

try{
$decoded = JWT::decode($token , new key("B0RN0Jx6muUoyGJGmahlRiQJ6mpNXEDQShyHT8bCbYp" , "HS256"));

return $decoded;
}catch(Exception $e){
    response(HttpStatus('UNAUTHORIZED') , "invalid token");
}
}

function require_admin($verifiedToken){
    if($verifiedToken->role !== "admin"){
        response(HttpStatus('FORBIDDEN'), "access denied admin");
    }
}

function checkAdminPrivileges() {
    $token = VerifyToken();
    require_admin($token);
}
