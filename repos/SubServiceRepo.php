<?php

namespace App\repos;

use PDO;

class SubServiceRepo {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getAll(): array {
        $query = "SELECT * FROM sub_services WHERE deleted_at IS NULL";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(int $id): ?array {
        $query = "SELECT * FROM sub_services WHERE id = :id AND deleted_at IS NULL";
        $stmt = $this->db->prepare($query);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function create(array $data): ?array {
        $query = "INSERT INTO sub_services (name, fees, description) VALUES (:name, :fees, :description)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            'name'        => $data['name'],
            'fees'        => $data['fees'],
            'description' => $data['description']
        ]);
        
        $newId = (int)$this->db->lastInsertId();
        return $this->getById($newId);
    }
}
