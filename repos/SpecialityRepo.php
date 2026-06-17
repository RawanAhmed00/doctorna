<?php

require_once __DIR__ . '/../helper/db.php';
require_once __DIR__ . '/../helper/filtration.php';

function getAllSpecialities($conn) {
    $sql = "SELECT * FROM speciality WHERE deleted_at IS NULL";
    // Allow filtering by name if needed
    $filtered = applyFilters($sql, ['name']);
    $stmt = runQuery($conn, $filtered['sql'], $filtered['bindings']);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getSpecialityById($conn, $id, $includeDoctorsCount = false) {
    if ($includeDoctorsCount) {
        $sql = "SELECT s.*, COUNT(d.id) as doctors_count 
                FROM speciality s 
                LEFT JOIN doctors d ON d.spec_id = s.id AND d.deleted_at IS NULL 
                WHERE s.id = :id AND s.deleted_at IS NULL 
                GROUP BY s.id";
    } else {
        $sql = "SELECT * FROM speciality WHERE id = :id AND deleted_at IS NULL";
    }
    
    $stmt = runQuery($conn, $sql, ['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getSpecialityByName($conn, $name) {
    $sql = "SELECT * FROM speciality WHERE name = :name AND deleted_at IS NULL";
    $stmt = runQuery($conn, $sql, ['name' => $name]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function createSpeciality($conn, $data) {
    $sql = "INSERT INTO speciality (name, description) VALUES (:name, :description)";
    runQuery($conn, $sql, [
        'name' => $data['name'],
        'description' => $data['description']
    ]);
    return getSpecialityById($conn, $conn->lastInsertId());
}

function updateSpeciality($conn, $id, $data) {
    $sql = "UPDATE speciality SET name = :name, description = :description WHERE id = :id AND deleted_at IS NULL";
    runQuery($conn, $sql, [
        'id' => $id,
        'name' => $data['name'],
        'description' => $data['description']
    ]);
    return getSpecialityById($conn, $id);
}

function softDeleteSpeciality($conn, $id) {
    $sql = "UPDATE speciality SET deleted_at = NOW() WHERE id = :id AND deleted_at IS NULL";
    runQuery($conn, $sql, ['id' => $id]);
}


