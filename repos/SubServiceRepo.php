<?php

require_once __DIR__ . '/../helper/db.php';
require_once __DIR__ . '/../helper/filtration.php';

function getAllSubServices($conn) {
    $sql = "SELECT * FROM sub_services WHERE deleted_at IS NULL";
    $filtered = applyFilters($sql, ['name', 'fees']);
    $stmt = runQuery($conn, $filtered['sql'], $filtered['bindings']);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getSubServiceById($conn, $id) {
    $sql = "SELECT * FROM sub_services WHERE id = :id AND deleted_at IS NULL";
    $stmt = runQuery($conn, $sql, ['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function createSubService($conn, $data) {
    $sql = "INSERT INTO sub_services (name, fees, description) VALUES (:name, :fees, :description)";
    runQuery($conn, $sql, [
        'name' => $data['name'],
        'fees' => $data['fees'],
        'description' => $data['description']
    ]);
    return getSubServiceById($conn, $conn->lastInsertId());
}

function updateSubService($conn, $id, $data) {
    $sql = "UPDATE sub_services SET name = :name, fees = :fees, description = :description WHERE id = :id AND deleted_at IS NULL";
    runQuery($conn, $sql, [
        'id' => $id,
        'name' => $data['name'],
        'fees' => $data['fees'],
        'description' => $data['description']
    ]);
    return getSubServiceById($conn, $id);
}

function softDeleteSubService($conn, $id) {
    $sql = "UPDATE sub_services SET deleted_at = NOW() WHERE id = :id AND deleted_at IS NULL";
    runQuery($conn, $sql, ['id' => $id]);
}
