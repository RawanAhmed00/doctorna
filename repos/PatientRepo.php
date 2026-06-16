<?php

<?php

function createPatientRepo($conn, $data) {
    $query = "INSERT INTO patients (name, email, phone, created_at) VALUES (?, ?, ?, NOW())";
    $stmt = $conn->prepare($query);
    $stmt->execute([$data['name'], $data['email'], $data['phone']]);
    
    $id = $conn->lastInsertId();
    return getPatientByIdRepo($conn, $id);
}

function updatePatientRepo($conn, $id, $data) {
    $fields = [];
    $values = [];
    
    if (isset($data['name'])) {
        $fields[] = "name = ?";
        $values[] = $data['name'];
    }
    if (isset($data['email'])) {
        $fields[] = "email = ?";
        $values[] = $data['email'];
    }
    if (isset($data['phone'])) {
        $fields[] = "phone = ?";
        $values[] = $data['phone'];
    }
    
    if (empty($fields)) {
        return getPatientByIdRepo($conn, $id);
    }
    
    $values[] = $id;
    $query = "UPDATE patients SET " . implode(", ", $fields) . " WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute($values);
    
    return getPatientByIdRepo($conn, $id);
}

function deletePatientRepo($conn, $id) {
    $query = "DELETE FROM patients WHERE id = ?";
    $stmt = $conn->prepare($query);
    return $stmt->execute([$id]);
}

function getPatientByIdRepo($conn, $id) {
    $query = "SELECT * FROM patients WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

