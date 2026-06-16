<?php

require_once __DIR__ . '/../helper/db.php';

function getAllSubServices($conn) {
    $sql = "SELECT * FROM sub_services WHERE deleted_at IS NULL";
    $stmt = runQuery($conn, $sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getSubServiceById($conn, $id) {
    $sql = "SELECT * FROM sub_services WHERE id = :id AND deleted_at IS NULL";
    $stmt = runQuery($conn, $sql, ['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function createSubService($conn, $data) {
    $sql = "INSERT INTO sub_services (name, fees, description)
            VALUES (:name, :fees, :description)";

    runQuery($conn, $sql, [
        'name' => $data['name'],
        'fees' => $data['fees'],
        'description' => $data['description']
    ]);

    return getSubServiceById($conn, $conn->lastInsertId());
}
