<?php

require_once __DIR__ . '/../helper/db.php';
require_once __DIR__ . '/../helper/filtration.php';
require_once __DIR__ . '/../helper/pagination.php';

function getAppointmentById($conn, $id) {
    $sql = "SELECT a.*, dr.name AS doctor_name, pt.name AS patient_name, pt.phone AS patient_phone,
                   sp.name AS speciality_name
            FROM appointments a
            LEFT JOIN doctors dr ON dr.id = a.doc_id
            LEFT JOIN users pt ON pt.id = a.user_id
            LEFT JOIN speciality sp ON sp.id = a.spec_id
            WHERE a.id = :id";
    $stmt = runQuery($conn, $sql, ['id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getAllAppointments($conn) {
    $sql = "SELECT a.*, dr.name AS doctor_name, pt.name AS patient_name, pt.phone AS patient_phone,
                   sp.name AS speciality_name
            FROM appointments a
            LEFT JOIN doctors dr ON dr.id = a.doc_id
            LEFT JOIN users pt ON pt.id = a.user_id
            LEFT JOIN speciality sp ON sp.id = a.spec_id
            WHERE 1=1";
    $operatorMap = [
        'status'   => ['=', 'a.status'],
        'date_time'=> ['=', 'a.date_time'],
        'doc_id'   => ['=', 'a.doc_id'],
        'user_id'  => ['=', 'a.user_id'],
        'spec_id'  => ['=', 'a.spec_id'],
    ];
    $filtered = applyFilters($sql, ['status', 'date_time', 'doc_id', 'user_id', 'spec_id'], [], $operatorMap);
    return paginateQuery($conn, $filtered['sql'], $filtered['bindings']);
}

function getAppointmentsByUserId($conn, $user_id) {
    $sql = "SELECT a.*, dr.name AS doctor_name, pt.name AS patient_name, pt.phone AS patient_phone,
                   sp.name AS speciality_name
            FROM appointments a
            LEFT JOIN doctors dr ON dr.id = a.doc_id
            LEFT JOIN users pt ON pt.id = a.user_id
            LEFT JOIN speciality sp ON sp.id = a.spec_id
            WHERE a.user_id = :user_id";
    $operatorMap = [
        'status'   => ['=', 'a.status'],
        'date_time'=> ['=', 'a.date_time'],
        'doc_id'   => ['=', 'a.doc_id'],
        'spec_id'  => ['=', 'a.spec_id'],
    ];
    $filtered = applyFilters($sql, ['status', 'date_time', 'doc_id', 'spec_id'], ['user_id' => $user_id], $operatorMap);
    return paginateQuery($conn, $filtered['sql'], $filtered['bindings']);
}

function createAppointment($conn, $data){
    $sql = "INSERT INTO appointments (status, date_time, user_id, doc_id, spec_id) 
            VALUES (:status, :date_time, :user_id, :doc_id, :spec_id)";
    runQuery($conn, $sql, [
        'status' => $data['status'],
        'date_time' => $data['date_time'],
        'user_id' => $data['user_id'],
        'doc_id' => $data['doc_id'],
        'spec_id' => $data['spec_id'] ?? null
    ]);
    
    $appointmentId = $conn->lastInsertId();
    
    if (isset($data['subservice_ids']) && is_array($data['subservice_ids'])) {
        foreach ($data['subservice_ids'] as $subservice_id) {
            $sqlSub = "INSERT INTO appointment_subservice (appointment_id, subservice_id, prescription) 
                       VALUES (:appointment_id, :subservice_id, :prescription)";
            runQuery($conn, $sqlSub, [
                'appointment_id' => $appointmentId,
                'subservice_id' => $subservice_id,
                'prescription' => '' // Default empty prescription
            ]);
        }
    }
    
    return getAppointmentById($conn, $appointmentId);
}

function updateAppointment($conn, $id, $data) {
    $sql = "UPDATE appointments 
            SET status = :status, date_time = :date_time, user_id = :user_id, doc_id = :doc_id, spec_id = :spec_id
            WHERE id = :id";
    runQuery($conn, $sql, [
        'id' => $id,
        'status' => $data['status'],
        'date_time' => $data['date_time'],
        'user_id' => $data['user_id'],
        'doc_id' => $data['doc_id'],
        'spec_id' => $data['spec_id'] ?? null
    ]);
    return getAppointmentById($conn, $id);
}
