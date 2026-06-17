<?php
require_once __DIR__ . '/../helper/db.php';

function getAllPatients($conn) {
    $sql = "SELECT id, name, email, age, gender, phone, role FROM users WHERE role = 'user'";
    $stmt = runQuery($conn, $sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getPatientById($conn, $id) {
    $sql = "SELECT id, name, email, age, gender, phone, role FROM users WHERE id = :id AND role = 'user'";
    $stmt = runQuery($conn, $sql, ['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

