<?php

require_once __DIR__ . '/../helper/db.php';
require_once __DIR__ . '/../helper/filtration.php';

function getAllDoctors($conn, $requestType = 'all') {
    $sql = "SELECT * FROM doctors WHERE deleted_at IS NULL";
    
    if ($requestType === 'filter') {
        $filtered = applyFilters($sql, ['gender', 'rank', 'is_available']);
        $stmt = runQuery($conn, $filtered['sql'], $filtered['bindings']);
    } else {
        $stmt = runQuery($conn, $sql);
    }
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getDoctorById($conn, $id) {
    $sql = "SELECT * FROM doctors WHERE id = :id AND deleted_at IS NULL";
    $stmt = runQuery($conn, $sql, ['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function createDoctor($conn, $data) {
    $sql = "INSERT INTO doctors (name, email, `rank`, gender, is_available, spec_id)
            VALUES (:name, :email, :rank, :gender, :is_available, :spec_id)";
    runQuery($conn, $sql, [
        'name'         => $data['name'],
        'email'        => $data['email'],
        'rank'         => $data['rank'],
        'gender'       => $data['gender'],
        'is_available' => $data['is_available'] ?? 1,
        'spec_id'      => $data['spec_id']
    ]);
    return getDoctorById($conn, $conn->lastInsertId());
}

function updateDoctor($conn, $id, $data) {
    $sql = "UPDATE doctors
            SET name = :name, email = :email, `rank` = :rank,
                gender = :gender, is_available = :is_available, spec_id = :spec_id
            WHERE id = :id AND deleted_at IS NULL";
    runQuery($conn, $sql, [
        'id'           => $id,
        'name'         => $data['name'],
        'email'        => $data['email'],
        'rank'         => $data['rank'],
        'gender'       => $data['gender'],
        'is_available' => $data['is_available'],
        'spec_id'      => $data['spec_id']
    ]);
    return getDoctorById($conn, $id);
}

function patchDoctor($conn, $id, $field, $value) {
    $sql = "UPDATE doctors SET `$field` = :value WHERE id = :id AND deleted_at IS NULL";
    runQuery($conn, $sql, ['id' => $id, 'value' => $value]);
    return getDoctorById($conn, $id);
}

function deleteDoctor($conn, $id) {
    $sql = "UPDATE doctors SET deleted_at = NOW() WHERE id = :id AND deleted_at IS NULL";
    runQuery($conn, $sql, ['id' => $id]);
}
