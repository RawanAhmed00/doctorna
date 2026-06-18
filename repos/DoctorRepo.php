<?php

require_once __DIR__ . '/../helper/db.php';
require_once __DIR__ . '/../helper/filtration.php';

function getAllDoctors($conn) {
    $sql = "SELECT * FROM doctors WHERE deleted_at IS NULL";
    
    $filtered = applyFilters($sql, ['gender', 'rank', 'is_available', 'name'], [], ['name' => 'LIKE']);
    return paginateQuery($conn, $filtered['sql'], $filtered['bindings']);
}

function getAllDoctorsWithSpeciality($conn) {
    $sql = "SELECT d.*, s.name AS speciality_name, s.description AS speciality_description
            FROM doctors d
            LEFT JOIN speciality s ON d.spec_id = s.id AND s.deleted_at IS NULL
            WHERE d.deleted_at IS NULL";

    $operatorMap = [
        'name'            => 'LIKE',
        'speciality_name' => ['LIKE', 's.name'],
        'spec_id'         => ['=', 'd.spec_id'],
    ];
    $filtered = applyFilters($sql, ['gender', 'rank', 'is_available', 'name', 'spec_id', 'speciality_name'], [], $operatorMap);
    return paginateQuery($conn, $filtered['sql'], $filtered['bindings']);
}

function getDoctorById($conn, $id) {
    $sql = "SELECT * FROM doctors WHERE id = :id AND deleted_at IS NULL";
    $stmt = runQuery($conn, $sql, ['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getDoctorByIdWithSpeciality($conn, $id) {
    $sql = "SELECT d.*, s.name AS speciality_name, s.description AS speciality_description
            FROM doctors d
            LEFT JOIN speciality s ON d.spec_id = s.id AND s.deleted_at IS NULL
            WHERE d.id = :id AND d.deleted_at IS NULL";
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
//$field -> IS THE VALUE THAT CHANGES DEPENDONG ON WHAT VALUE ADMIN WANT TO PATCH
function patchDoctor($conn, $id, $field, $value) {
    $sql = "UPDATE doctors SET `$field` = :value WHERE id = :id AND deleted_at IS NULL";
    runQuery($conn, $sql, ['id' => $id, 'value' => $value]);
    return getDoctorById($conn, $id);
}

function deleteDoctor($conn, $id) {
    $sql = "UPDATE doctors SET deleted_at = NOW() WHERE id = :id AND deleted_at IS NULL";
    runQuery($conn, $sql, ['id' => $id]);
}
