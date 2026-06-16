<?php

//GET BY ID 

  function GetById ($conn , $id){
    $query="select * from Appointments where id=?";
    $getByID =$conn->prepare($query);
    $getByID->execute ([$id]);
    return $getByID->fetch(PDO::FETCH_ASSOC);

    }

    // GET ALL
   function GatAll ($conn){
        $query ="select id , status , date_time , user_id , doc_id ";
        $getAppointments=$conn->prepare($query);
        $getAppointments->execute();
        return $getAppointments ->fetchAll (PDO::FETCH_ASSOC);

    }

    //POST

   function PostAppointment ($conn , $id , $status , $date_time , $user_id , $doc_id){

    $update = $conn->prepare("update Appointments  set status=? , date_time=? , user_id=? , doc_id=? where id=?");
    $update ->execute ([$id , $status ,$date_time , $user_id , $doc_id]);

    return $update ->rowCount ()>0 ;

    }