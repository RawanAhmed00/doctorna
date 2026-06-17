<?php
function getAllSpecialities($conn) {
    $query = "SELECT * FROM speciality WHERE deleted_at IS NULL ORDER BY id";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    return $stmt->fetchAll();
}

function getSpecialityById($conn, $id) {
    $query = "SELECT * FROM speciality WHERE id = ? AND deleted_at IS NULL";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    return $stmt->fetch();
}

function createSpeciality($conn, $name, $description) {
    $query = "INSERT INTO speciality (name, description) VALUES (?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->execute([$name, $description]);
    return $conn->lastInsertId();
}

function updateSpeciality($conn, $id, $name, $description) {
    $query = "UPDATE speciality SET name = ?, description = ? WHERE id = ? AND deleted_at IS NULL";
    $stmt = $conn->prepare($query);
    $stmt->execute([$name, $description, $id]);
    return $stmt->rowCount() > 0;
}

function softDeleteSpeciality($conn, $id) {
    $query = "UPDATE speciality SET deleted_at = NOW() WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    return $stmt->rowCount() > 0;
}

function getSpecialityWithDoctorsCount($conn, $id) {
    $query = "SELECT s.*, COUNT(d.id) as doctors_count 
              FROM speciality s 
              LEFT JOIN doctors d ON d.spec_id = s.id AND d.deleted_at IS NULL 
              WHERE s.id = ? AND s.deleted_at IS NULL 
              GROUP BY s.id";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    return $stmt->fetch();
}
?>