<?php

require_once __DIR__ . '/../helper/db.php';
require_once __DIR__ . '/../helper/filtration.php';

function getAllDoctors($conn) {
    $bindings = [];
    $sql = "SELECT d.*, s.name AS speciality_name, s.description AS speciality_description,
                   (SELECT GROUP_CONCAT(ss2.name ORDER BY ss2.id SEPARATOR ', ')
                    FROM doctor_subservices ds2
                    JOIN sub_services ss2 ON ss2.id = ds2.subservice_id
                    WHERE ds2.doctor_id = d.id) AS subservice_names
            FROM doctors d
            LEFT JOIN speciality s ON s.id = d.spec_id
            WHERE d.deleted_at IS NULL";

    // Handle subservice_id filter — uses WHERE IN to avoid breaking GROUP_CONCAT
    if (isset($_GET['subservice_id']) && is_numeric($_GET['subservice_id'])) {
        $sql .= " AND d.id IN (SELECT doctor_id FROM doctor_subservices WHERE subservice_id = :filter_subservice_id)";
        $bindings[':filter_subservice_id'] = (int)$_GET['subservice_id'];
    }

    $filtered = applyFilters($sql, ['gender', 'rank', 'is_available', 'name', 'spec_id'], $bindings, ['name' => 'LIKE']);
    return paginateQuery($conn, $filtered['sql'], $filtered['bindings']);
}

function getDoctorById($conn, $id) {
    $sql = "SELECT d.*, s.name AS speciality_name, s.description AS speciality_description,
                   (SELECT GROUP_CONCAT(ss2.name ORDER BY ss2.id SEPARATOR ', ')
                    FROM doctor_subservices ds2
                    JOIN sub_services ss2 ON ss2.id = ds2.subservice_id
                    WHERE ds2.doctor_id = d.id) AS subservice_names
            FROM doctors d
            LEFT JOIN speciality s ON s.id = d.spec_id
            WHERE d.id = :id AND d.deleted_at IS NULL";
    $stmt = runQuery($conn, $sql, ['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getDoctorWithAllRelations($conn, $id) {
    // Same as getDoctorById — all enrichments already inlined
    return getDoctorById($conn, $id);
}

function getDoctorSubServices($conn, $doctor_id) {
    $sql = "SELECT s.* 
            FROM sub_services s
            INNER JOIN doctor_subservices ds ON s.id = ds.subservice_id
            WHERE ds.doctor_id = :doctor_id AND s.deleted_at IS NULL";
    $stmt = runQuery($conn, $sql, ['doctor_id' => $doctor_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function assignSubServiceToDoctor($conn, $doctor_id, $subservice_id) {
    // IGNORE if already exists to prevent duplicate key error
    $sql = "INSERT IGNORE INTO doctor_subservices (doctor_id, subservice_id) 
            VALUES (:doctor_id, :subservice_id)";
    runQuery($conn, $sql, [
        'doctor_id' => $doctor_id,
        'subservice_id' => $subservice_id
    ]);
    return true;
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
