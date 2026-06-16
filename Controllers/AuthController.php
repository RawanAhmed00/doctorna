<?php
require_once __DIR__ .'/../config/database.php';
require_once __DIR__ .'/../repos/AuthRepo.php';
require_once __DIR__ .'/../helper/jwt.php';
require_once __DIR__ .'/../helper/response.php';
require_once __DIR__ .'/../helper/status.php';
require_once __DIR__ .'/../helper/request.php';
require_once __DIR__ .'/../helper/mailer.php';
require_once __DIR__ .'/../helper/cache.php';

//1. repo which has function of getting user by email is done
//then check mail,pass
function handleLogin($conn){
    $data = getJsonInput(['email', 'password']);
    $email = $data['email'];
    $pass = $data['password'];
    
    //make sure of email format:
    if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
        response(HttpStatus('BAD_REQUEST'), "Invalid Email Format, Please enter a valid one");
    }
    
    //8er kda:el mail sa7 so: get all mails from the function that gets all mails
    $user = getUserByEmail($conn, $email);
    
    //kda b2a 3andy kil el mails:h ihave to make sure mail is in db
    if(!$user){
        response(HttpStatus('NOT_FOUND'), "User not Found, Please Register !");
    }
    
    //password turn:if pass != database pass
    if(!password_verify($pass, $user['password'])){
        response(HttpStatus('UNAUTHORIZED'), "Wrong Password !");
    }
    
    $token = GenerateToken($user);
    response(HttpStatus('OK'), "Logged in Successfully, Welcome !", ["token" => $token]);
}

//name, email ,password, gender, role
function handleRegister($conn){
    $data = getJsonInput(['name', 'email', 'password', 'age', 'gender', 'phone', 'role']);
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
    
    $existingUser = getUserByEmail($conn, $email);
    if($existingUser){
        response(HttpStatus('CONFLICT'), "Email Already Exists !");
    }
    
    if($role !== 'user'){
        response(HttpStatus('FORBIDDEN'), "You should be a user to register !");
    }
    
    $data['password'] = password_hash($pass, PASSWORD_DEFAULT);
    createUser($conn, $data);
    
    response(HttpStatus('CREATED'), "User registered successfully !");
}

function handleForgotPassword($conn){
    $data = getJsonInput(['email']);
    $email = $data['email'] ?? '';

    if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
        response(HttpStatus('BAD_REQUEST'), "Invalid email format !");
    }

    $user = getUserByEmail($conn, $email);
    if(!$user){
        response(HttpStatus('OK'), "If this email is registered, a reset token has been sent.");
    }

    $token = bin2hex(random_bytes(32));
    storeResetToken($email, $token);

    try {
        sendResetEmail($email, $token);
    } catch (Exception $e) {
        response(HttpStatus('INTERNAL_SERVER_ERROR'), "Failed to send reset email.");
    }

    response(HttpStatus('OK'), "If this email is registered, a reset token has been sent.");
}

function handleResetPassword($conn){
    $data = getJsonInput(['email', 'token', 'new_password']);
    $email = $data['email'] ?? '';
    $token = $data['token'] ?? '';
    $new_password = $data['new_password'] ?? '';

    if(empty($email) || empty($token) || empty($new_password)){
        response(HttpStatus('BAD_REQUEST'), "Email, token, and new_password are required.");
    }

    $storedToken = getStoredResetToken($email);

    if(!$storedToken){
        response(HttpStatus('GONE'), "Token expired or invalid.");
    }

    if($storedToken !== $token){
        response(HttpStatus('UNAUTHORIZED'), "Invalid token.");
    }

    if (!preg_match("/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/", $new_password)) {
        response(HttpStatus('BAD_REQUEST'), "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
    }

    $hashedPassword = password_hash($new_password, PASSWORD_DEFAULT);
    updateUserPassword($conn, $email, $hashedPassword);
    deleteResetToken($email);

    response(HttpStatus('OK'), "Password reset successfully.");
}
?>