<?php
 
 require __DIR__ . "/../repos/AppointmentRepo.php";
 require __DIR__ . "/../helper/response.php";

 //GET BY ID

 function GetById ($connection , $id){

 $id=$_GET["id"];
 $Appointment =GetById($connection,$id);

 if ($Appointment==null){
    response(404 , "Appointment not found " , $Appointment);
 }

 response(200 , "Appointment retrieved" , $Appointment);

 }


 //GET ALL

 function GetAll ($connection ){

 if (isset ($_GET["search"])){
    $id=$_GET["search"];
    $result = GetALL ($connection );

 }
 if ($result){
    response(200 , "Appointment retrieved successfully", $result);
 }else {
    response(404 , "No Appointment to get ");
 }
 }

 //POST 

 function UpdateAppointment ($connection){

 $id =$_GET ['id'];
  $date =json_decode(file_get_contents("php://input") , true);

if (empty ($date)){
    response (400 ,"All fields required");
}
$Appointment = GetById ($connection , $id);

if ($Appointment==null){
    response (404 ."not found");
    }

    $status =$date['status']??$Appointment['status'];
     $date_time =$date['date_time']??$Appointment['date_time'];
     $user_id =$date['user_id']??$Appointment['user_id'];
     $doc_id =$date['doc_id']??$Appointment['doc_id'];

     $result = Update ($connection ,$id , $status , $date_time , $user_id , $doc_id);

     if ($result){
        response(200, "Appointment has been updated");
     }else{
        response(500 ," Appointment couldn't be updated");
     }
 }



