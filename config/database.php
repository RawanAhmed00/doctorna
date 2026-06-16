<?php
require_once __DIR__ . '/../helper/env.php';

$config = [
    "host" => env('DB_HOST', 'localhost'),
    "user"=> env('DB_USER', 'root'),
    "password" => env('DB_PASS', ''),
    "database" => env('DB_NAME', 'doctorna')
];

try {
    $conn = new PDO("mysql:host={$config['host']};dbname={$config['database']}", $config['user'], $config['password']);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}