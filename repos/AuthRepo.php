<?php
require __DIR__ .'/../config/database.php';
// start with logging in:
// 1-check if this email exists, if exists:1-check the password written to password in database
// if correct  message:Welcome!
// if not correct message:password not correct
// if email does not exist: user not found, please sign up
// if yes: welcome to the system
// if not please sign up to proceed
// 2-then sign up function

//authentication repo:
//1.login: get user by email
function getuserbyemail($email){
    global $conn;
    $get="select * from `users` where email=?";
    $getting=$conn->prepare($get);
    $getting->execute([$email]);
    $user=$getting->fetch(PDO::FETCH_ASSOC);
    return $user;
}

//2.signup
function createuser($data){
    global $conn;
    $create="insert into `users` (name,email,password,age,gender,phone,role) 
    values(:name,:email,:password,:age,:gender,:phone,:role)";
    $creation=$conn->prepare($create);
    return $creation->execute([
     'name'=>$data['name'] ,
     'email'=>$data['email'] ,
     'password'=>$data['password'],
     'age'=>$data['age'] ,
     'gender'=>$data['gender']  ,
     'phone'=>$data['phone'] ,
     'role'=>$data['role']
    ]);
}

?>
