<?php

require_once __DIR__ . '/../helper/db.php';
require_once __DIR__ . '/../helper/filtration.php';
require_once __DIR__ . '/../helper/pagination.php';

function getAllPatients($conn) {
    // Only return users with role='user'. Hide soft-deleted.
    $sql = "SELECT id, name, email, age, gender, phone, role FROM users WHERE role = 'user' AND deleted_at IS NULL";
    
    $filtered = applyFilters($sql, ['gender', 'age', 'name'], [], ['name' => 'LIKE']);
    return paginateQuery($conn, $filtered['sql'], $filtered['bindings']);
}

function getPatientById($conn, $id) {
    $sql = "SELECT id, name, email, age, gender, phone, role FROM users WHERE id = :id AND role = 'user' AND deleted_at IS NULL";
    $stmt = runQuery($conn, $sql, ['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function updatePatient($conn, $id, $data) {
    $sql = "UPDATE users SET name = :name, email = :email, age = :age, gender = :gender, phone = :phone WHERE id = :id AND role = 'user' AND deleted_at IS NULL";
    runQuery($conn, $sql, [
        'id' => $id,
        'name' => $data['name'],
        'email' => $data['email'],
        'age' => $data['age'],
        'gender' => $data['gender'],
        'phone' => $data['phone']
    ]);
    return getPatientById($conn, $id);
}

function softDeletePatient($conn, $id) {
    $sql = "UPDATE users SET deleted_at = NOW() WHERE id = :id AND role = 'user' AND deleted_at IS NULL";
    runQuery($conn, $sql, ['id' => $id]);
}
