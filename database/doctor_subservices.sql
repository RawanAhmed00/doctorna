-- Phase 1: Database Migration for Doctor-SubService "Offers" Integration

-- 1. Create the many-to-many pivot table for Doctors and SubServices
CREATE TABLE `doctor_subservices` (
  `id` int(12) NOT NULL AUTO_INCREMENT,
  `doctor_id` int(12) NOT NULL,
  `subservice_id` int(12) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_offer` (`doctor_id`, `subservice_id`),
  CONSTRAINT `fk_ds_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ds_subservice` FOREIGN KEY (`subservice_id`) REFERENCES `sub_services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Note: The `appointment_subservice` table already exists in doctorna.sql
-- So we only need to add foreign keys to it if they don't exist, but we will leave it as is 
-- for now since it is part of the existing schema. We will just use the new `doctor_subservices` table.
