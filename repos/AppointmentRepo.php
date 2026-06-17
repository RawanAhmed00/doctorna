<?php

require_once __DIR__ . '/../helper/db.php';
require_once __DIR__ . '/../helper/filtration.php';

function getAppointmentById($conn, $id) {
    $sql = "SELECT * FROM appointments WHERE id = :id";
    $stmt = runQuery($conn, $sql, ['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getAllAppointments($conn) {
    $baseSql = "SELECT * FROM appointments WHERE 1=1";
    // Admin can filter by status, date_time, doc_id, user_id
    $filtered = applyFilters($baseSql, ['status', 'date_time', 'doc_id', 'user_id']);
    
    $stmt = runQuery($conn, $filtered['sql'], $filtered['bindings']);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getAppointmentsByUserId($conn, $user_id) {
    $baseSql = "SELECT * FROM appointments WHERE user_id = :user_id";
    // User can filter their own appointments by status, date_time, doc_id
    $filtered = applyFilters($baseSql, ['status', 'date_time', 'doc_id'], ['user_id' => $user_id]);
    
    $stmt = runQuery($conn, $filtered['sql'], $filtered['bindings']);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function createAppointment($conn, $data) {
    $sql = "INSERT INTO appointments (status, date_time, user_id, doc_id) 
            VALUES (:status, :date_time, :user_id, :doc_id)";
    runQuery($conn, $sql, [
        'status' => $data['status'],
        'date_time' => $data['date_time'],
        'user_id' => $data['user_id'],
        'doc_id' => $data['doc_id']
    ]);
    return getAppointmentById($conn, $conn->lastInsertId());
}

function updateAppointment($conn, $id, $data) {
    $sql = "UPDATE appointments 
            SET status = :status, date_time = :date_time, user_id = :user_id, doc_id = :doc_id 
            WHERE id = :id";
    runQuery($conn, $sql, [
        'id' => $id,
        'status' => $data['status'],
        'date_time' => $data['date_time'],
        'user_id' => $data['user_id'],
        'doc_id' => $data['doc_id']
    ]);
    return getAppointmentById($conn, $id);
}
