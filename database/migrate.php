<?php
/**
 * Migration: Add spec_id to appointments table
 * 
 * Adds FK to speciality so appointments can optionally carry a speciality.
 * Auto-populates spec_id from doctor's spec_id for existing rows.
 * Run ONCE after reviewing.
 */

require_once __DIR__ . '/../config/database.php';

try {
    // 1. Add column (nullable, FK later)
    $conn->exec("ALTER TABLE `appointments`
        ADD COLUMN `spec_id` int(12) DEFAULT NULL AFTER `doc_id`,
        ADD KEY `fk_app_spec` (`spec_id`)");

    echo "Column spec_id added.\n";

    // 2. Auto-populate from doctors for existing rows
    $conn->exec("UPDATE appointments a
        INNER JOIN doctors d ON d.id = a.doc_id
        SET a.spec_id = d.spec_id
        WHERE a.spec_id IS NULL");

    echo "Auto-populated spec_id for existing rows.\n";

    // 3. Add FK constraint
    $conn->exec("ALTER TABLE `appointments`
        ADD CONSTRAINT `fk_app_spec` FOREIGN KEY (`spec_id`) REFERENCES `speciality` (`id`) ON DELETE SET NULL ON UPDATE CASCADE");

    echo "FK constraint added.\n";

    echo "Migration complete.\n";

} catch (PDOException $e) {
    die("Migration error: " . $e->getMessage() . "\n");
}
