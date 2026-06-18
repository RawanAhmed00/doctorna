<?php
require_once __DIR__ .'/../config/database.php';
require_once __DIR__ .'/../repos/AuthRepo.php';
require_once __DIR__ .'/../helper/jwt.php';
require_once __DIR__ .'/../helper/response.php';
require_once __DIR__ .'/../helper/status.php';
require_once __DIR__ .'/../helper/request.php';
require_once __DIR__ .'/../helper/mailer.php';
require_once __DIR__ .'/../helper/cache.php';

// ==========================================
// VALIDATION HELPERS
// ==========================================
function validateAuthEmail($email) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        response(HttpStatus('BAD_REQUEST'), "Invalid email format. Please enter a valid one.");
    }
}

function validatePasswordStrength($pass) {
    if (!preg_match("/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/", $pass)) {
        response(HttpStatus('BAD_REQUEST'), "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
    }
}

//1. repo which has function of getting user by email is done
//then check mail,pass
//LOGIN:
function handleLogin($conn){
    //GET USER EMAIL AND PASSWORD THEN STORE THEM
    $data = getJsonInput(['email', 'password']);
    $email = $data['email'];
    $pass = $data['password'];

    //VALIDATE EMAIL AND PASSWORD ENTERED:
    //1.MAIL VALIDATION
    validateAuthEmail($email);
    
    //CHECKING IF EMAIL EXISTS IN DATABASE: BY CALLING THE FUNCTION THAT GETS ALL MAILS
    $user = getUserByEmail($conn, $email);
    
    // IF MAIL DOES NOT EXIST: USER NOT FOUND IN DATABASE!
    if(!$user){
        response(HttpStatus('NOT_FOUND'), "User not Found, Please Register !");
    }

    //IF PASSWORD IS NOT CORRECT COMPARED TO PASSWORD IN DATABASE: WRONG PASSWORD
    if(!password_verify($pass, $user['password'])){
        response(HttpStatus('UNAUTHORIZED'), "Wrong Password !");
    }
    
    //GENERATING A TOKEN FOR THE USER:
    $token = GenerateToken($user);
    response(HttpStatus('OK'), "Logged in Successfully, Welcome !", ["token" => $token]);
}
//REGISTER FUNCTION:
//NOTE: REGISTER FUNCTION IS APPLIED FOR USER ONLY! ADMIN IS NOT ALLOWED TO REGISTE
function handleRegister($conn){
    $data = getJsonInput(['name', 'email', 'password', 'age', 'gender', 'phone', 'role']);
    //USING strtolower(): TO MAKE SURE THE INPUT DATA WILL BE AS IN DATABASE TO BE ABLE TO BE STORE
    $data['gender'] = strtolower($data['gender'] ?? '');
    $data['role'] = strtolower($data['role'] ?? '');
    
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $pass = $data['password'] ?? '';
    $age = $data['age'] ?? '';
    $gender = $data['gender'] ?? '';
    $phone = $data['phone'] ?? '';
    $role = $data['role'] ?? '';
    

    //IF ANY FIELD OF DATA IS EMPTY, FILL IN ALL REQUIRED FIELDS
     if(empty($name) || empty($email) || empty($pass) || empty($age) ||empty($gender) || empty($phone) || empty($role)){
        response(HttpStatus('BAD_REQUEST'),"Please, Fill in all required fields !");
     }
    // THEN VALIDATE EMAIL, PASSWORD REGISTERED BY USER
    validateAuthEmail($email);
    validatePasswordStrength($pass);

    //AGE CONDITIONS
    if (!is_numeric($age) || $age <= 0 || $age > 120) {
        response(HttpStatus('BAD_REQUEST'), "Age must be a valid positive number between 1 and 120 !");
    }

    if (!in_array($gender, ['male', 'female'])) {
        response(HttpStatus('BAD_REQUEST'), "Gender must be either 'male' or 'female' !");
    }

    //MAKING SURE THAT AN EXISTING USER DOES NOT SIGN UP BY
    // SEARCHING FOR 2 THINGS: EMAIL, PHONE NUMBER

    $existingUser = getUserByEmail($conn, $email);
    if($existingUser){
        response(HttpStatus('CONFLICT'), "Email Already Exists !");
    }

    $existingPhone = getUserByPhone($conn, $phone);
    if ($existingPhone) {
        response(HttpStatus('CONFLICT'), "Phone number already exists. Please use a different one.");
    }
    // AGAIN: USER IS ONLY ONE ALLOWED TO REGISTER OM THE SYSTEM
    if($role !== 'user'){
        response(HttpStatus('FORBIDDEN'), "You should be a user to register !");
    }
    //HASHING PASSWORD ENTERED BY USER
    $data['password'] = password_hash($pass, PASSWORD_DEFAULT);
    //APPLYING THE REPO FUNCTION OF CREATING USER
    createUser($conn, $data);
    
    // Automatically log the user in by generating a token after registration
    $newUser = getUserByEmail($conn, $email);
    $token = GenerateToken($newUser);
    
    response(HttpStatus('CREATED'), "User registered successfully !", ["token" => $token]);
}

function handleForgotPassword($conn){
    $data = getJsonInput(['email']);
    $email = $data['email'] ?? '';

    validateAuthEmail($email);

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

    validatePasswordStrength($new_password);

    $hashedPassword = password_hash($new_password, PASSWORD_DEFAULT);
    updateUserPassword($conn, $email, $hashedPassword);
    deleteResetToken($email);

    response(HttpStatus('OK'), "Password reset successfully.");
}
?>