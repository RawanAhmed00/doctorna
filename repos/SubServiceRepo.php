<?php

require_once __DIR__ . '/../helper/db.php';
require_once __DIR__ . '/../helper/filtration.php';
require_once __DIR__ . '/../helper/pagination.php';

function getAllSubServices($conn) {
    $sql = "SELECT * FROM sub_services WHERE deleted_at IS NULL";

    $operatorMap = [
        'name'     => 'LIKE',
        'min_fees' => ['>=', 'fees'],
        'max_fees' => ['<=', 'fees'],
    ];
    $filtered = applyFilters($sql, ['name', 'min_fees', 'max_fees'], [], $operatorMap);
    return paginateQuery($conn, $filtered['sql'], $filtered['bindings']);
}

function getSubServiceById($conn, $id) {
    $sql = "SELECT * FROM sub_services WHERE id = :id AND deleted_at IS NULL";
    $stmt = runQuery($conn, $sql, ['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getDoctorsBySubService($conn, $subservice_id) {
    $sql = "SELECT d.*, s.name AS speciality_name,
                   (SELECT GROUP_CONCAT(ss2.name ORDER BY ss2.id SEPARATOR ', ')
                    FROM doctor_subservices ds2
                    JOIN sub_services ss2 ON ss2.id = ds2.subservice_id
                    WHERE ds2.doctor_id = d.id) AS subservice_names
            FROM doctors d
            LEFT JOIN speciality s ON s.id = d.spec_id
            INNER JOIN doctor_subservices ds ON d.id = ds.doctor_id
            WHERE ds.subservice_id = :subservice_id
              AND d.deleted_at IS NULL";
    $stmt = runQuery($conn, $sql, ['subservice_id' => $subservice_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
