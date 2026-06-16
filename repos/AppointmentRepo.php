<?php

//GET BY ID 
function GetById($conn,$id){
    $query="select * from appointments where id=?";
    $getByID =$conn->prepare($query);
    $getByID->execute ([$id]);
    return $getByID->fetch(PDO::FETCH_ASSOC);
    }
    // GET ALL
    function GetAll($conn){
        $query ="select * from appointments";
        $getAppointments=$conn->prepare($query);
        $getAppointments->execute();
        return $getAppointments->fetchAll(PDO::FETCH_ASSOC);
    }
    //returns all appointments data related to a specefic user
    function relatedtouser($conn,$user_id){
        $related="select * from appointments where user_id=?";
        $userrelated=$conn->prepare($related);
        $userrelated->execute([$user_id]);
        return $userrelated->fetchAll(PDO::FETCH_ASSOC);
    }
    //update
    function post($conn,$status, $date_time, $user_id , $doc_id){
    $post="insert into appointments (status, date_time, user_id, doc_id)
    values(?,?,?,?)";
    $posting=$conn->prepare($post);
    $posting->execute([$status, $date_time, $user_id,$doc_id]);
    return $conn->lastInsertId();
    }