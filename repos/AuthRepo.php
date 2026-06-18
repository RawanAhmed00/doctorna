<?php
require_once __DIR__ .'/../config/database.php';
require_once __DIR__ .'/../helper/db.php';

// start with logging in(
// 1-check if this email exists, if exists:1-check of the password written to password in database
// if correct : message:Welcome!
// if not correct message:password not correct
// if email does not exist: user not found, please sign up
// if yes: welcome to the system
// if not please sign up to proceed)
// then sign up function

//authentication repo:
//1.login: get user by email
function getUserByEmail($conn, $email){
    $sql = "SELECT * FROM `users` WHERE email = :email";
    $stmt = runQuery($conn, $sql, ['email' => $email]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getUserByPhone($conn, $phone){
    $sql = "SELECT * FROM `users` WHERE phone = :phone";
    $stmt = runQuery($conn, $sql, ['phone' => $phone]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

//2.signup
function createUser($conn, $data){
    $sql = "INSERT INTO `users` (name, email, password, age, gender, phone, role) 
            VALUES (:name, :email, :password, :age, :gender, :phone, :role)";
    $stmt = runQuery($conn, $sql, [
        'name'     => $data['name'],
        'email'    => $data['email'],
        'password' => $data['password'],
        'age'      => $data['age'],
        'gender'   => $data['gender'],
        'phone'    => $data['phone'] ?? '',
        'role'     => $data['role']
    ]);
    return $stmt->rowCount() > 0;
}

function updateUserPassword($conn, $email, $hashedPassword){
    $sql = "UPDATE `users` SET password = :password WHERE email = :email";
    $stmt = runQuery($conn, $sql, ['password' => $hashedPassword, 'email' => $email]);
    return $stmt->rowCount() > 0;
}
?>
