<?php
require_once __DIR__ .'/../config/database.php';
require_once __DIR__ .'/../repos/AuthRepo.php';
require_once __DIR__ .'/../helper/jwt.php';
require_once __DIR__ .'/../helper/response.php';
require_once __DIR__ .'/../helper/status.php';
require_once __DIR__ .'/../helper/request.php';

//1. repo which has function of getting user by email is done
//then check mail,pass
function login($data){
    $email = $data['email'];
    $pass = $data['password'];
    
    //make sure of email format:
    if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
        response(HttpStatus('BAD_REQUEST'), "Invalid Email Format, Please enter a valid one");
    }
    
    //8er kda:el mail sa7 so: get all mails from the function that gets all mails
    $userdata = getuserbyemail($email);
    
    //kda b2a 3andy kil el mails:h ihave to make sure mail is in db
    if(!$userdata){
        response(HttpStatus('NOT_FOUND'), "User not Found, Please Register !");
    }
    
    //password turn:if pass != database pass
    if(!password_verify($pass, $userdata['password'])){
        response(HttpStatus('UNAUTHORIZED'), "Wrong Password !");
    }
    
    $token = GenerateToken($userdata);
    response(HttpStatus('OK'), "Logged in Successfully, Welcome !", ["token" => $token]);
}

//name, email ,password, gender, role
function register($data){
    $data['gender'] = strtolower($data['gender'] ?? '');
    $data['role'] = strtolower($data['role'] ?? '');
    
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $pass = $data['password'] ?? '';
    $age = $data['age'] ?? '';
    $gender = $data['gender'] ?? '';
    $phone = $data['phone'] ?? '';
    $role = $data['role'] ?? '';
    

    //if data empty: message you should insert data
     if(empty($name) || empty($email) || empty($pass) || empty($age) ||empty($gender) || empty($phone) || empty($role)){
        response(HttpStatus('BAD_REQUEST'),"Please, Fill in all required fields !");
     }
        
    //make sure of email format:
    if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
        response(HttpStatus('BAD_REQUEST'), "Invalid email format !");
    }

    if (!is_numeric($age) || $age <= 0 || $age > 120) {
        response(HttpStatus('BAD_REQUEST'), "Age must be a valid positive number !");
    }

    if (!preg_match("/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/", $pass)) {
        response(HttpStatus('BAD_REQUEST'), "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
    }

    if (!in_array($gender, ['male', 'female'])) {
        response(HttpStatus('BAD_REQUEST'), "Gender must be either 'male' or 'female' !");
    }
    
    $checkuser = getuserbyemail($email);
    if($checkuser){
        response(HttpStatus('CONFLICT'), "Email Already Exists !");
    }
    
    if($role !== 'user'){
        response(HttpStatus('FORBIDDEN'), "You should be a user to register !");
    }
    
    $data['password'] = password_hash($pass, PASSWORD_DEFAULT);
    createuser($data);
    
    response(HttpStatus('CREATED'), "User registered successfully !");
}
?>