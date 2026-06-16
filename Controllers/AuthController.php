<?php
require_once __DIR__ .'/../config/database.php';
require_once __DIR__ .'/../repos/AuthRepo.php';
require_once __DIR__ .'/../helper/JWT.php';
require_once __DIR__ .'/../helper/response.php';

//1. repo which has function of getting user by email is done
//then check mail,pass
function login($data){
    $email=$data['email'] ??'';
    $pass=$data['password']?? '';
    //make sure of email format:
    if(!filter_var($email,FILTER_VALIDATE_EMAIL)){
        response(400,"Invalid Email Format, Please enter a valid one");
        exit;
    }
    //otherwise, mail is correct, so get all mails
    $userdata=getuserbyemail($email);
    //now, having all mails, check if mail i in database
    if(!$userdata){
        response(404,"User not Found, Please Register !");
        exit;
    }
    //if pass != database pass
    if(!password_verify($pass, $userdata['password'])){
        response(401,"Wrong Password !");
        exit;
    }
    $token=GenerateToken($userdata);
    response(200, "Logged in Successfully, Welcome !", ["token"=>$token]);
    exit;
}
//name, email ,password, gender,phone , role

    function register($data){
        $data['gender']=strtolower($data['gender'] ?? '');
        $data['role']=strtolower($data['role'] ?? '');
        $name=$data['name'] ??'';
        $email=$data['email'] ?? '';
        $pass=$data['password'] ?? '';
        $age=$data['age'] ?? '';
        $gender=$data['gender'] ?? '';
        $phone=$data['phone'] ?? '';
        $role=$data['role'] ?? '';
     //if data empty: message you should insert data
     if(empty($name) || empty($email) || empty($pass) || empty($age) ||empty($gender)|| empty($phone) || empty($role)){
        response(400,"Please, Fill in all required fields !");
     }
     if(!filter_var($email,FILTER_VALIDATE_EMAIL)){
        response(400,"Invalid email format !");
        exit;
     }
    $checkuser=getuserbyemail($email);
        if($checkuser){
            response(409,"Email Already Exists !");
            exit;
        }
     if($role!=='user'){
        response(403,"You should be a user to register !");
     }
     $data['password']=password_hash($pass,PASSWORD_DEFAULT);
     createuser($data);
     response(201,"User registered successfully !");
     exit;
    }
    
?>
