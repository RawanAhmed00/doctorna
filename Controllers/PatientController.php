<?php
require_once __DIR__ . "/../helper/cache.php";
require_once __DIR__ . "/../repos/PatientRepo.php";
require_once __DIR__ . "/../helper/response.php";

function GetUsers()
{
    global $redis;
    $cacheKey = "users";
    $cachedData = $redis->get($cacheKey);

    if($cachedData)
    {
        response(
            200,
            "Success",
            json_decode($cachedData, true)
        );
        return;
    }

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




