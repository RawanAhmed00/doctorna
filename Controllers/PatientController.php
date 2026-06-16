<?php

require_once __DIR__ . "/../repos/PatientRepo.php";
require_once __DIR__ . "/../helper/response.php";

function GetUsers()
{
    echo json_encode("ana hena");
    $result = GetAllUsersRepo();

    response(
        200,
        "Success",
        $result
    );
}

function GetUserById()
{
    $id = $_GET["id"] ?? null;

    if(empty($id))
    {
        response(
            422,
            "User ID Is Required"
        );
    }

    $result = GetUserByIdRepo(
        $id
    );

    response(
        200,
        "Success",
        $result
    );
}

function AddUser()
{
    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    if(
        empty($data["name"]) ||
        empty($data["email"]) ||
        empty($data["password"]) ||
        empty($data["age"]) ||
        empty($data["gender"]) ||
        empty($data["phone"]) ||
        empty($data["role"])
    )
    {
        response(
            422,
            "Missing Required Fields"
        );
    }

    $hashedPassword = password_hash(
        $data["password"],
        PASSWORD_DEFAULT
    );

    $result = AddUserRepo(
        $data["name"],
        $data["email"],
        $hashedPassword,
        $data["age"],
        $data["gender"],
        $data["phone"],
        $data["role"]
    );

    if($result)
    {
        response(
            200,
            "User Added"
        );
    }

    response(
        500,
        "Failed"
    );
}

