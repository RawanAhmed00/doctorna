<?php
require_once __DIR__ . '/env.php';
// var_dump(env('JWT_SECRET'));
// die();
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/status.php';
require_once __DIR__ . '/response.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function getJwtSecret(): string {
    $secret = env('JWT_SECRET');
    if (empty($secret)) {
        response(HttpStatus('INTERNAL_SERVER_ERROR'), "Server configuration error: JWT_SECRET is not set.");
    }
    return $secret;
}

function GenerateToken($user){
    
$payload=[
"iat" => time(),
"exp" => time()+3600,
"user_id" => $user['id'],
"role" => $user['role']
];

$secret = getJwtSecret();
return JWT::encode($payload, $secret, "HS256");

}

function VerifyToken(){

$headers = getallheaders();
$token = $headers['Authorization']??'';

if(!$token){
 response(HttpStatus('UNAUTHORIZED'), "token is requird ");
}
$token = str_replace("Bearer " ,"",$token);

try{
$secret = getJwtSecret();
$decoded = JWT::decode($token , new key($secret , "HS256"));

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