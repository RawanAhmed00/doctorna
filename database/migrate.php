<?php
/**
 * Migration: Add type and parent_id to appointments
 * 
 * type = 'consultation' | 'procedure'
 * parent_id = FK to appointments(id) for procedure follow-ups
 */
require_once __DIR__ . '/../config/database.php';

try {
    $conn->exec("ALTER TABLE `appointments`
        ADD COLUMN `type` enum('consultation','procedure') NOT NULL DEFAULT 'consultation' AFTER `spec_id`,
        ADD COLUMN `parent_id` int(12) DEFAULT NULL AFTER `type`,
        ADD KEY `fk_app_parent` (`parent_id`)");

    // Set existing appointments type
    $conn->exec("UPDATE appointments SET type = 'consultation' WHERE type IS NULL OR type = ''");
    
    $conn->exec("ALTER TABLE `appointments`
        ADD CONSTRAINT `fk_app_parent` FOREIGN KEY (`parent_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE");

    echo "Migration complete.\n";
} catch (PDOException $e) {
    die("Migration error: " . $e->getMessage() . "\n");
}
