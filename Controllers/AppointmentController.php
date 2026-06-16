<?php
 
 require __DIR__ . "/../repos/AppointmentRepo.php";
 require __DIR__ . "/../helper/response.php";
 require __DIR__ ."/../helper/JWT.php";


//admin: can get all appointments, by id but not post
//user: get appointments related to his id only, post an appointment
//if role==admin

 //GET BY ID
function getappointmentbyid($conn , $id){
   $verifiedToken=verifyToken();
   require_admin($verifiedToken);
$appointment =GetById($conn,$id);
if (!$appointment){
    response(HttpStatus('BAD_REQUEST'),"Appointment not found");
    exit;
}
 response(HttpStatus('OK'),"Appointment found", $appointment);
}

 //GET ALL
function getallappointments($conn){
   $verifiedToken=verifyToken();
   if($verifiedToken->role === "user"){
      $userid=$verifiedToken->user_id;
      $show= relatedtouser($conn,$userid);
      if(!empty($show)){
         response(HttpStatus('OK'),"Here are all your appointments",$show);
         exit;
      }
      else{
         response(HttpStatus('OK'),"No Appointments related to this user!");
         exit;
      }
   }
   require_admin($verifiedToken);
    $result = GetAll($conn);
 
 if ($result){
     response(HttpStatus('OK'),"Here are All appointments: ", $result);
 }else {
    response(HttpStatus('Not_Found'),"No Appointments");
 }};


 //post:
 function postappointment($conn){
   //$verifiedToken=verifyToken();
   //require_admin($verifiedToken);
   // if($verifiedToken->role !== "user"){
   //     response(HttpStatus('FORBIDDEN'),"Only Users Can Add an Appointment !");
   // }
   $data = json_decode(file_get_contents("php://input"), true);
   if(empty($data)){
       response(HttpStatus('BAD_REQUEST'),"Please fill in all fields");
   }
   //array for accepted fields in status:
      $acceptedstatus=["pending","confirmed","cancelled","completed"];
//checking status:1.receiving status, 2.convert it to lower case
if(isset($data['status'])) {
   $status=strtolower($data['status']);
}else{
   response(HttpStatus('BAD_REQUEST'),"Please fill in the status !");
}
   //checking on: status should be in:pending, confirmed, completed, cancelled
   if(!in_array($status,$acceptedstatus, true)){
    response(HttpStatus('BAD_REQUEST'),"Invalid status !, Please enter one from
     (pending, confirmed, cancelled or completed)");
     exit;
   }
   $date_time=$data['date_time'];
   $user_id=$data['user_id'];
   $doc_id=$data['doc_id'];
   $user_id=$verfiedToken->user_id;
   $add=post($conn,$status, $date_time, $user_id , $doc_id);
   if(!$add){
      response(HttpStatus('BAD_REQUEST'),"Data could not be entered");
      exit;
   }
   response(HttpStatus('CREATED'),"Appointment Booked successfully" ,$add);
 }


//connection
