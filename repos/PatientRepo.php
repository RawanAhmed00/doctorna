<?php
require_once '../config/database.php';
function GetAllUsersRepo()
{
    global $conn ;
   $stmt = $conn->prepare("
        SELECT *
        FROM users
    ");

    $stmt->execute();

    return 
    $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function GetUserByIdRepo($id)
{
    global $conn;
    $stmt = $conn->prepare("
        SELECT
            id,
            name,
            email,
            age,
            gender,
            phone,
            role
        FROM users
        WHERE id = ?
    ");

    $stmt->execute([$id]);

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

