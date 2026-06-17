<?php

<?php

// function createPatientRepo($conn, $data) {
//     $query = "INSERT INTO users (name, email, phone,password, age, gender, phone, role, created_at) VALUES (?, ?, ?, NOW())";
//     $stmt = $conn->prepare($query);
//     $stmt->execute([$data['name'], $data['email'], $data['phone'],
//     $data['age'], $data['gender'], $data['phone'], ]);
    
//     $id = $conn->lastInsertId();
//     return getPatientByIdRepo($conn, $id);
// }

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
    if (isset($data['password'])) {
        $fields[] = "password = ?";
        $values[] = $data['password'];
    }
    if (isset($data['age'])) {
        $fields[] = "age = ?";
        $values[] = $data['age'];
    }
    if (isset($data['gender'])) {
        $fields[] = "gender = ?";
        $values[] = $data['gender'];
    }
    if (isset($data['phone'])) {
        $fields[] = "phone = ?";
        $values[] = $data['phone'];
    }
    if (isset($data['role'])) {
        $fields[] = "role = ?";
        $values[] = $data['role'];
    }
    if (isset($data['deleted_at'])) {
        $fields[] = "deleted_at = ?";
        $values[] = $data['deleted_at'];
    }

    
    if (empty($fields)) {
        return getPatientByIdRepo($conn, $id);
    }
    
    $values[] = $id;
    $query = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute($values);
    
    return getPatientByIdRepo($conn, $id);
}

function deletePatientRepo($conn, $id) {
    $query = "DELETE FROM users WHERE id = ?";
    $stmt = $conn->prepare($query);
    return $stmt->execute([$id]);
}

function getPatientByIdRepo($conn, $id) {
    $query = "SELECT * FROM users WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

