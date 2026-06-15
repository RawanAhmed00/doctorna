<?php
// Database configuration will go here


$config = [
    "host" => "localhost",
    "user"=> "root",
    "password" => "",
    "database" => "doctorna"
];

try {
    $conn = new PDO("mysql:host={$config['host']};dbname={$config['database']}", $config['user'], $config['password']);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}