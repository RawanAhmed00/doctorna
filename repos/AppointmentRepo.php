<?php

//GET BY ID 

function GetById ($connection , $id){
    $query="select * from Appointments where id=?";
    $getByID =$connection->prepare($query);
    $getByID->execute ([$id]);
    return $getByID->fetch(PDO::FETCH_ASSOC);

    }

    // GET ALL
    function GatAll ($connection){
        $query ="select id , status , date_time , user_id , doc_id ";
        $getAppointments=$connection->prepare($query);
        $getAppointments->execute();
        return $getAppointments ->fetchAll (PDO::FETCH_ASSOC);

    }

    //POST

    function Update ($connection , $id , $status , $date_time , $user_id , $doc_id){

    $update = $connection->prepare("update Appointments  set status=? , date_time=? , user_id=? , doc_id=? where id=?");
    $update ->execute ([$id , $status ,$date_time , $user_id , $doc_id]);

    return $update ->rowCount ()>0 ;

    }