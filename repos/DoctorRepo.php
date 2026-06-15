<?php

require_once '../helper/db.php';

function getAlldocotors($conn){
    $sql = "SELECT * From Doctors";
    $stmt = runQuery($conn, $sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}


function getDoctorById($conn, $id){
    $sql = "SELECT * From Doctors where id = :id";
    $stmt = runQuery($conn, $sql, ['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}


function createDoctor($conn, $data){
    $sql = "INSERT INTO Doctors (`name`, `email`, `rank`, `gender`, `is_available`, `spec_id`) 
            VALUES (:name, :email, :rank, :gender, :is_available, :spec_id)";
    runQuery($conn, $sql, [
        'name' => $data['name'],
        'email' => $data['email'],
        'rank' => $data['rank'],
        'gender' => $data['gender'],
        'is_available' => $data['is_available'],
        'spec_id' => $data['spec_id']
    ]);
    return getDoctorById($conn, $conn->lastInsertId());
}






