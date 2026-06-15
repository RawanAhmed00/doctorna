-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 14, 2026 at 11:18 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `doctorna`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(12) NOT NULL,
  `status` enum('completed','cancelled','pending','confirmed') NOT NULL,
  `date_time` datetime NOT NULL,
  `user_id` int(12) NOT NULL,
  `doc_id` int(12) NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `status`, `date_time`, `user_id`, `doc_id`) VALUES
(1, 'pending', '2026-06-15 10:00:00', 1, 3),
(2, 'confirmed', '2026-06-15 12:30:00', 2, 5),
(3, 'completed', '2026-06-10 09:00:00', 3, 1),
(4, 'cancelled', '2026-06-11 14:00:00', 4, 2),
(5, 'confirmed', '2026-06-16 11:00:00', 5, 10),
(6, 'pending', '2026-06-16 16:15:00', 6, 7),
(7, 'completed', '2026-06-12 10:30:00', 7, 4),
(8, 'confirmed', '2026-06-17 13:00:00', 8, 12),
(9, 'cancelled', '2026-06-12 15:00:00', 9, 6),
(10, 'pending', '2026-06-18 09:30:00', 10, 15),
(11, 'completed', '2026-06-13 11:00:00', 11, 8),
(12, 'confirmed', '2026-06-18 14:30:00', 12, 11),
(13, 'pending', '2026-06-19 10:00:00', 13, 20),
(14, 'confirmed', '2026-06-19 12:00:00', 14, 13),
(15, 'completed', '2026-06-14 08:30:00', 15, 9),
(16, 'cancelled', '2026-06-14 17:00:00', 16, 14),
(17, 'confirmed', '2026-06-20 11:30:00', 17, 25),
(18, 'pending', '2026-06-20 15:00:00', 18, 18),
(19, 'completed', '2026-06-09 13:00:00', 19, 16),
(20, 'confirmed', '2026-06-21 10:30:00', 20, 22),
(21, 'pending', '2026-06-21 14:00:00', 21, 30),
(22, 'confirmed', '2026-06-22 09:00:00', 22, 27),
(23, 'completed', '2026-06-08 16:00:00', 23, 21),
(24, 'cancelled', '2026-06-15 13:30:00', 24, 24),
(25, 'confirmed', '2026-06-22 12:00:00', 25, 35),
(26, 'pending', '2026-06-23 11:00:00', 26, 32),
(27, 'completed', '2026-06-07 10:00:00', 27, 26),
(28, 'confirmed', '2026-06-23 15:30:00', 28, 40),
(29, 'cancelled', '2026-06-16 09:00:00', 29, 29),
(30, 'pending', '2026-06-24 13:00:00', 30, 45),
(31, 'completed', '2026-06-06 14:30:00', 31, 31),
(32, 'confirmed', '2026-06-24 16:00:00', 32, 38),
(33, 'pending', '2026-06-25 10:30:00', 33, 42),
(34, 'confirmed', '2026-06-25 12:00:00', 34, 33),
(35, 'completed', '2026-06-05 11:00:00', 35, 34),
(36, 'cancelled', '2026-06-17 15:00:00', 36, 36),
(37, 'confirmed', '2026-06-26 09:30:00', 37, 49),
(38, 'pending', '2026-06-26 14:00:00', 38, 44),
(39, 'completed', '2026-06-04 12:30:00', 39, 39),
(40, 'confirmed', '2026-06-27 11:00:00', 40, 47),
(41, 'pending', '2026-06-27 16:30:00', 41, 41),
(42, 'confirmed', '2026-06-28 10:00:00', 42, 46),
(43, 'completed', '2026-06-03 15:00:00', 43, 43),
(44, 'cancelled', '2026-06-18 11:30:00', 44, 48),
(45, 'confirmed', '2026-06-28 13:00:00', 45, 50),
(46, 'pending', '2026-06-29 09:00:00', 46, 2),
(47, 'completed', '2026-06-02 10:30:00', 47, 17),
(48, 'confirmed', '2026-06-29 14:30:00', 48, 19),
(49, 'cancelled', '2026-06-19 12:00:00', 49, 23),
(50, 'pending', '2026-06-30 11:00:00', 50, 28);

-- --------------------------------------------------------

--
-- Table structure for table `appointment_subservice`
--

CREATE TABLE `appointment_subservice` (
  `appointment_id` int(12) NOT NULL,
  `subservice_id` int(12) NOT NULL,
  `prescription` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointment_subservice`
--

INSERT INTO `appointment_subservice` (`appointment_id`, `subservice_id`, `prescription`) VALUES
(1, 1, 'Rest and avoid caffeine before the next checkup.'),
(1, 2, 'Concor 5mg (1 tablet daily in the morning), Aspoci'),
(2, 18, 'Keep monitoring the temperature. Give Cetal syrup '),
(2, 19, 'Apply cold compresses on the injection site if swe'),
(3, 3, 'Plavix 75mg once daily. Schedule a follow-up visit'),
(4, 35, 'Apply Fucidin cream twice daily for 3 days. Strict'),
(4, 37, 'Use a hydrating sunscreen SPF 50+ every 2 hours wh'),
(5, 21, 'Add iron-rich foods to the diet. Sansovit syrup 5m'),
(6, 36, 'Apply Panthenol cream to soothe the skin after the'),
(7, 4, 'Keep the monitor attached for 24 hours. Avoid mois'),
(8, 20, 'Normal growth indicators for this age group.'),
(9, 5, 'No specific medication needed. Review findings nex'),
(10, 22, 'Slight anemia detected. Take minor iron supplement'),
(11, 6, 'Approved for further scan. Take medications as sch'),
(12, 23, 'Use Ventolin inhaler 2 puffs only during asthma at'),
(12, 38, 'Keep the area dry. Apply Mebo ointment twice daily'),
(13, 7, 'Measure blood pressure twice daily and record it.'),
(14, 24, 'Refer to behavioral therapist for standard develop'),
(15, 8, 'Device is functioning well. Next battery check in '),
(16, 25, 'Hearing capability is perfect in both ears.'),
(17, 9, 'Lipitor 20mg once daily before sleep. Reduce fatty'),
(18, 26, 'Vision is 6/6. No need for corrective eyeglasses.'),
(19, 10, 'Follow a low-salt diet. Repeat the blood profile i'),
(20, 27, 'Growth hormone levels are within the standard rang'),
(21, 11, 'Continue current treatment. Regular walking for 30'),
(22, 28, 'Pediatric echo shows a completely normal heart str'),
(23, 12, 'No acute changes. Maintain the dosage of your beta'),
(24, 29, 'Avoid dairy products for two weeks due to suspecte'),
(25, 13, 'Follow up with the surgical team regarding the val'),
(26, 30, 'Take Zyrtec syrup 2.5ml once daily before sleeping'),
(27, 14, 'Wear compression stockings during the day.'),
(28, 31, 'Everything is normal. Ensure proper hydration for '),
(29, 15, 'Cardiac rehabilitation sessions scheduled twice a '),
(30, 32, 'Speech sessions recommended three times a week.'),
(31, 16, 'Chest X-Ray is clear. No active pulmonary congesti'),
(32, 33, 'Apply Elocon cream thin layer on dry patches for 5'),
(33, 17, 'Nitroglycerin sublingual when needed for severe ch'),
(34, 34, 'Flu vaccine shot given successfully. Expect mild w'),
(35, 39, 'Avoid massaging the face or sleeping on the side f'),
(36, 40, 'Apply ice packs to reduce minor swelling at inject'),
(37, 41, 'Use Minoxidil 5% spray 5 puffs on scalp daily.'),
(38, 42, 'Apply Aloe Vera gel post-laser session to minimize'),
(39, 43, 'Biopsy sample sent to lab. Results will be ready i'),
(40, 44, 'All moles are benign. Re-examine after 12 months.'),
(41, 45, 'Apply laser soothing cream 3 times daily. Keep are'),
(42, 46, 'Skin hydration vitamins recommended for daily inta'),
(43, 47, 'Keep nails clean and dry. Apply antifungal lacquer'),
(44, 48, 'Apply Lamisil cream to affected skin areas for 2 w'),
(45, 49, 'Laser settings updated. Continue with moisturizing'),
(46, 50, 'Avoid scratching the treated skin area. Keep it mo'),
(47, 35, 'Apply zinc ointment over active acne breakouts.'),
(48, 36, 'Allergy test shows sensitivity towards certain per'),
(49, 37, 'Peeling process will start in 3 days. Do not peel '),
(50, 38, 'Wart removed successfully. Keep the band-aid on fo');

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` int(12) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `rank` enum('intern','resident','specialist','senior specialist','consultant') NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `spec_id` int(12) NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `name`, `email`, `rank`, `gender`, `is_available`, `spec_id`) VALUES
(1, 'Dr. Tarek Hegazi', 'tarek@doctorna.com', 'consultant', 'male', '1', 1),
(2, 'Dr. Mona El-Assal', 'mona@doctorna.com', 'senior specialist', 'female', '1', 2),
(3, 'Dr. Amr Diab', 'amr.d@doctorna.com', 'specialist', 'male', '1', 3),
(4, 'Dr. Rania Youssef', 'rania.y@doctorna.com', 'resident', 'female', '0', 4),
(5, 'Dr. Khaled El-Sawy', 'khaled.s@doctorna.co', 'consultant', 'male', '1', 5),
(6, 'Dr. Fatma Omar', 'fatma.o@doctorna.com', 'intern', 'female', '1', 6),
(7, 'Dr. Sherif Mounir', 'sherif.m@doctorna.co', 'senior specialist', 'male', '1', 7),
(8, 'Dr. Dina Fouad', 'dina.f@doctorna.com', 'specialist', 'female', '1', 8),
(9, 'Dr. Mahmoud Abdel', 'mahmoud.a@doctorna.c', 'consultant', 'male', '0', 9),
(10, 'Dr. Aya Mansour', 'aya.m@doctorna.com', 'resident', 'female', '1', 10),
(11, 'Dr. Hany Ramzy', 'hany.r@doctorna.com', 'specialist', 'male', '1', 11),
(12, 'Dr. Mai Selim', 'mai.s@doctorna.com', 'intern', 'female', '1', 12),
(13, 'Dr. Ahmed Khaled', 'ahmed.k@example.com', 'consultant', 'male', '1', 13),
(14, 'Dr. Noha Soliman', 'noha.s@doctorna.com', 'senior specialist', 'female', '1', 14),
(15, 'Dr. Waleed Fawzy', 'waleed.f@doctorna.co', 'specialist', 'male', '0', 15),
(16, 'Dr. Yasmine Sabri', 'yasmine.s@doctorna.c', 'resident', 'female', '1', 16),
(17, 'Dr. Mostafa Nour', 'mostafa.n@doctorna.c', 'consultant', 'male', '1', 17),
(18, 'Dr. Reem Ali', 'reem.a@doctorna.com', 'intern', 'female', '1', 18),
(19, 'Dr. Hazem Imam', 'hazem.i@doctorna.com', 'senior specialist', 'male', '1', 19),
(20, 'Dr. Laila Elwi', 'laila.e@doctorna.com', 'specialist', 'female', '1', 20),
(21, 'Dr. Karim Fahmy', 'karim.f@doctorna.com', 'consultant', 'male', '1', 21),
(22, 'Dr. Heba Magdy', 'heba.m@doctorna.com', 'resident', 'female', '1', 22),
(23, 'Dr. Sameh Hussein', 'sameh.h@doctorna.com', 'specialist', 'male', '0', 23),
(24, 'Dr. Salma Ahmed', 'salma.a@doctorna.com', 'intern', 'female', '1', 24),
(25, 'Dr. Eslam El-Sayed', 'eslam.s@doctorna.com', 'senior specialist', 'male', '1', 25),
(26, 'Dr. Farida Seif', 'farida.s@doctorna.co', 'consultant', 'female', '1', 26),
(27, 'Dr. Ramy Sabry', 'ramy.s@doctorna.com', 'resident', 'male', '1', 27),
(28, 'Dr. Nadine Khan', 'nadine.k@doctorna.co', 'specialist', 'female', '1', 28),
(29, 'Dr. Maged El-Kedy', 'maged.k@doctorna.com', 'consultant', 'male', '1', 29),
(30, 'Dr. Habiba Shaker', 'habiba.s@doctorna.co', 'intern', 'female', '0', 30),
(31, 'Dr. Hisham Abbas', 'hisham.a@doctorna.co', 'senior specialist', 'male', '1', 31),
(32, 'Dr. Malak Nour', 'malak.n@doctorna.com', 'specialist', 'female', '1', 32),
(33, 'Dr. Bassem Youssef', 'bassem.y@doctorna.co', 'consultant', 'male', '1', 33),
(34, 'Dr. Jana Amr', 'jana.a@doctorna.com', 'resident', 'female', '1', 34),
(35, 'Dr. Ziad Rahal', 'ziad.r@doctorna.com', 'specialist', 'male', '1', 35),
(36, 'Dr. Mariam Nour', 'mariam.n@doctorna.co', 'intern', 'female', '1', 36),
(37, 'Dr. Ashraf Zaki', 'ashraf.z@doctorna.co', 'consultant', 'male', '0', 37),
(38, 'Dr. Shahd El-Sawy', 'shahd.s@doctorna.com', 'senior specialist', 'female', '1', 38),
(39, 'Dr. Belal Hamed', 'belal.h@doctorna.com', 'resident', 'male', '1', 39),
(40, 'Dr. Ghada Adel', 'ghada.a@doctorna.com', 'specialist', 'female', '1', 40),
(41, 'Dr. Ayman Nour', 'ayman.n@doctorna.com', 'consultant', 'male', '1', 41),
(42, 'Dr. Shaimaa Aly', 'shaimaa.a@doctorna.c', 'intern', 'female', '1', 42),
(43, 'Dr. Medhat Saleh', 'medhat.s@doctorna.co', 'senior specialist', 'male', '1', 43),
(44, 'Dr. Radwa Sherif', 'radwa.s@doctorna.com', 'specialist', 'female', '1', 44),
(45, 'Dr. Tamer Hosny', 'tamer.h@doctorna.com', 'consultant', 'male', '0', 45),
(46, 'Dr. Ola Ghanem', 'ola.g@doctorna.com', 'resident', 'female', '1', 46),
(47, 'Dr. Wael Jassar', 'wael.j@doctorna.com', 'specialist', 'male', '1', 47),
(48, 'Dr. Hanan Turk', 'hanan.t@doctorna.com', 'intern', 'female', '1', 48),
(49, 'Dr. Sherif Ramzy', 'sherif.r@doctorna.co', 'senior specialist', 'male', '1', 49),
(50, 'Dr. Mirna Nour', 'mirna.n@doctorna.com', 'consultant', 'female', '1', 50);

-- --------------------------------------------------------

--
-- Table structure for table `speciality`
--

CREATE TABLE `speciality` (
  `id` int(12) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `speciality`
--

INSERT INTO `speciality` (`id`, `name`, `description`) VALUES
(1, 'Cardiology', 'Heart Care'),
(2, 'Pediatrics', 'Children Clinic'),
(3, 'Dermatology', 'Skin Clinic'),
(4, 'Orthopedics', 'Bone Care'),
(5, 'Ophthalmology', 'Eye Care'),
(6, 'Neurology', 'Brain Care'),
(7, 'Dentistry', 'Teeth Care'),
(8, 'Psychiatry', 'Mental Health'),
(9, 'Gynecology', 'Women Care'),
(10, 'Internal Medicine', 'General Adult'),
(11, 'General Surgery', 'Surgery Dept'),
(12, 'ENT', 'Ear Nose'),
(13, 'Urology', 'Urinary Care'),
(14, 'Gastroenterology', 'Stomach Care'),
(15, 'Pulmonology', 'Lung Care'),
(16, 'Endocrinology', 'Diabetes Care'),
(17, 'Nephrology', 'Kidney Care'),
(18, 'Oncology', 'Cancer Care'),
(19, 'Rheumatology', 'Joint Care'),
(20, 'Physical Therapy', 'Physio Rehab'),
(21, 'Urology', 'Urinary Clinic'),
(22, 'Radiology', 'X-Ray Scan'),
(23, 'Anesthesiology', 'Anesthesia Dept'),
(24, 'Hematology', 'Blood Care'),
(25, 'Immunology', 'Allergy Care'),
(26, 'Emergency', 'Er Dept'),
(27, 'Neurosurgery', 'Brain Surgery'),
(28, 'Plastic Surgery', 'Cosmetic Surgery'),
(29, 'Vascular Surgery', 'Vein Care'),
(30, 'Cardiothoracic', 'Heart Surgery'),
(31, 'Vascular Medicine', 'Blood Vessels'),
(32, 'Geriatrics', 'Elderly Care'),
(33, 'Neonatology', 'Newborn Care'),
(34, 'Sports Medicine', 'Athletes Care'),
(35, 'Podiatry', 'Foot Care'),
(36, 'Audiology', 'Hearing Clinic'),
(37, 'Hepatology', 'Liver Care'),
(38, 'Andrology', 'Male Health'),
(39, 'Family Medicine', 'Family Care'),
(40, 'Nephrology', 'Kidney Clinic'),
(41, 'Nutrition', 'Diet Care'),
(42, 'Pathology', 'Lab Test'),
(43, 'Toxicology', 'Poison Control'),
(44, 'Infectious Diseases', 'Virus Care'),
(45, 'Vascular Surgery', 'Vascular Clinic'),
(46, 'Cosmetic Dentistry', 'Smile Care'),
(47, 'Orthodontics', 'Braces Clinic'),
(48, 'Maxillofacial', 'Jaw Surgery'),
(49, 'Pedodontics', 'Kids Teeth'),
(50, 'Periodontics', 'Gum Care');

-- --------------------------------------------------------

--
-- Table structure for table `sub_services`
--

CREATE TABLE `sub_services` (
  `id` int(12) NOT NULL,
  `name` varchar(15) NOT NULL,
  `fees` decimal(30,0) NOT NULL,
  `description` text NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_services`
--

INSERT INTO `sub_services` (`id`, `name`, `fees`, `description`) VALUES
(1, 'Echocardiogram', 1200, 'Heart Scan'),
(2, 'ECG Rhythm Test', 350, 'Heart Rhythm'),
(3, 'Stress ECG Test', 800, 'Cardiac Stress'),
(4, 'Holter Monitor', 900, '24h Heart Scan'),
(5, 'Carotid Doppler', 1100, 'Artery Scan'),
(6, 'Cardiac CT Pre', 500, 'Scan Review'),
(7, 'BP Monitoring', 150, 'Blood Pressure'),
(8, 'Pacemaker Check', 600, 'Device Review'),
(9, 'Lipid Profile', 300, 'Cholesterol Check'),
(10, 'Angio PreCheck', 400, 'Vessel Review'),
(11, 'Heart Valve Exa', 700, 'Valve Check'),
(12, 'Myocardial Scan', 1500, 'Muscle Imaging'),
(13, 'Aortic Exam', 850, 'Aorta Check'),
(14, 'Venous Doppler', 950, 'Vein Scan'),
(15, 'Cardiac Rehab', 400, 'Heart Exercise'),
(16, 'Chest X-Ray Pre', 300, 'Scan Review'),
(17, 'Coronary Care', 1000, 'Vessel Care'),
(18, 'Pediatric Check', 400, 'Child Care'),
(19, 'Infant Vaccine', 250, 'Immune Dose'),
(20, 'Newborn Screen', 500, 'Baby Growth'),
(21, 'Child Nutrition', 350, 'Diet Plan'),
(22, 'Pediatric CBC', 200, 'Blood Test'),
(23, 'Asthma FollowUp', 400, 'Lung Check'),
(24, 'Autism Screen', 600, 'Behavior Test'),
(25, 'Hearing Screen', 300, 'Ear Check'),
(26, 'Vision Screen', 250, 'Eye Check'),
(27, 'Growth Hormone', 800, 'Hormone Check'),
(28, 'Pediatric Echo', 1000, 'Child Heart'),
(29, 'Allergy Testing', 450, 'Allergy Check'),
(30, 'Stool Analysis', 120, 'Lab Test'),
(31, 'Neonatal Care', 700, 'Infant Care'),
(32, 'Speech Therapy', 500, 'Speech Session'),
(33, 'Eczema Care', 300, 'Skin Treatment'),
(34, 'Flu Vaccine', 180, 'Immune Dose'),
(35, 'Acne Laser', 850, 'Skin Care'),
(36, 'Skin Allergy', 450, 'Skin Check'),
(37, 'Chemical Peel', 900, 'Skin Therapy'),
(38, 'Cryotherapy', 600, 'Wart Removal'),
(39, 'Botox Injection', 3000, 'Cosmetic Derm'),
(40, 'Filler Session', 3500, 'Cosmetic Derm'),
(41, 'Plasma Hair', 1200, 'Hair Therapy'),
(42, 'Laser Hair Rem', 1500, 'Cosmetic Laser'),
(43, 'Skin Biopsy', 800, 'Lab Test'),
(44, 'Mole Mapping', 500, 'Skin Scan'),
(45, 'Tattoo Removal', 1100, 'Laser Session'),
(46, 'Mesotherapy', 1000, 'Skin Face'),
(47, 'Nail Treatment', 400, 'Nail Care'),
(48, 'Fungal Screen', 250, 'Lab Test'),
(49, 'Eczema Laser', 950, 'Skin Therapy'),
(50, 'Phototherapy', 700, 'UV Session');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(12) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `age` int(10) NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `phone` varchar(20) NOT NULL,
  `role` enum('admin','user') NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `age`, `gender`, `phone`, `role`) VALUES
(1, 'Ahmed Ali', 'ahmed.ali@example.com', 'pass1234', 28, 'male', 1012345678, 'user'),
(2, 'Sara Hassan', 'sara.hassan@example.com', 'sara@2026', 24, 'female', 1123456789, 'user'),
(3, 'Mohamed Omar', 'mohamed.omar@example.com', 'doctor#1', 35, 'male', 1234567890, 'admin'),
(4, 'Aya Ibrahim', 'aya.ibrahim@example.com', 'aya_pass', 22, 'female', 1545678901, 'user'),
(5, 'Mahmoud Khaled', 'mahmoud.k@example.com', 'khaled99', 31, 'male', 1098765432, 'user'),
(6, 'Fatma Mostafa', 'fatma.m@example.com', 'fatma@@', 29, 'female', 1198765432, 'user'),
(7, 'Hany Youssef', 'hany.y@example.com', 'hany_secure', 42, 'male', 1298765432, 'admin'),
(8, 'Amira Tarek', 'amira.t@example.com', 'amira123', 26, 'female', 1598765432, 'user'),
(9, 'Mustafa Reda', 'mustafa.r@example.com', 'mustafa77', 33, 'male', 1011122233, 'user'),
(10, 'Nour El-Din', 'nour.edin@example.com', 'nour_pass', 27, 'female', 1111122233, 'user'),
(11, 'Kareem Adel', 'kareem.a@example.com', 'kareem88', 30, 'male', 1211122233, 'user'),
(12, 'Rania Sayed', 'rania.s@example.com', 'rania_secure', 25, 'female', 1511122233, 'user'),
(13, 'Eslam Gamal', 'eslam.g@example.com', 'eslam123', 23, 'male', 1022233344, 'user'),
(14, 'Dina Amr', 'dina.amr@example.com', 'dina@pass', 34, 'female', 1122233344, 'admin'),
(15, 'Sherif Hussein', 'sherif.h@example.com', 'sherif90', 45, 'male', 1222333444, 'user'),
(16, 'Mona Mahmoud', 'mona.m@example.com', 'mona2026', 28, 'female', 1522233344, 'user'),
(17, 'Tarek Anwar', 'tarek.a@example.com', 'tarek_pass', 38, 'male', 1033344455, 'admin'),
(18, 'Yasmine Fouad', 'yasmine.f@example.com', 'yasmine11', 24, 'female', 1133344455, 'user'),
(19, 'Waleed Ashour', 'waleed.a@example.com', 'waleed66', 29, 'male', 1233344455, 'user'),
(20, 'Noha Kamal', 'noha.k@example.com', 'noha_pass', 31, 'female', 1533344455, 'user'),
(21, 'Hassan Soliman', 'hassan.s@example.com', 'hassan77', 36, 'male', 1044455566, 'user'),
(22, 'Mai Abdelrahman', 'mai.a@example.com', 'mai_secure', 22, 'female', 1144455566, 'user'),
(23, 'Hazem Emad', 'hazem.e@example.com', 'hazem123', 27, 'male', 1244455566, 'user'),
(24, 'Farida Wael', 'farida.w@example.com', 'farida99', 26, 'female', 1544455566, 'user'),
(25, 'Amr Saad', 'amr.saad@example.com', 'amr_pass', 40, 'male', 1055566677, 'admin'),
(26, 'Reem Nabil', 'reem.n@example.com', 'reem2026', 25, 'female', 1155566677, 'user'),
(27, 'Sameh Magdy', 'sameh.m@example.com', 'sameh88', 32, 'male', 1255566677, 'user'),
(28, 'Laila Hassan', 'laila.h@example.com', 'laila_pass', 28, 'female', 1555666777, 'user'),
(29, 'Ramy Saeed', 'ramy.s@example.com', 'ramy1234', 33, 'male', 1066677788, 'user'),
(30, 'Heidi Mohamed', 'heidi.m@example.com', 'heidi@@', 30, 'female', 1166677788, 'user'),
(31, 'Youssef Nasser', 'youssef.n@example.com', 'youssef99', 35, 'male', 1266677788, 'admin'),
(32, 'Aisha Ahmed', 'aisha.a@example.com', 'aisha_pass', 23, 'female', 1566677788, 'user'),
(33, 'Khaled Mansour', 'khaled.m@example.com', 'khaled77', 41, 'male', 1077788899, 'user'),
(34, 'Nadine Sherif', 'nadine.s@example.com', 'nadine123', 24, 'female', 1177788899, 'user'),
(35, 'Maged Raafat', 'maged.r@example.com', 'maged_pass', 29, 'male', 1277788899, 'user'),
(36, 'Salma Ezzat', 'salma.e@example.com', 'salma2026', 27, 'female', 1577788899, 'user'),
(37, 'Ibrahim Awad', 'ibrahim.a@example.com', 'ibrahim88', 37, 'male', 1088899900, 'user'),
(38, 'Habiba Alaa', 'habiba.a@example.com', 'habiba_secure', 21, 'female', 1188899900, 'user'),
(39, 'Hisham Gaber', 'hisham.g@example.com', 'hisham99', 44, 'male', 1288899900, 'admin'),
(40, 'Malak Omar', 'malak.o@example.com', 'malak123', 25, 'female', 1588899900, 'user'),
(41, 'Bassem Talaat', 'bassem.t@example.com', 'bassem_pass', 32, 'male', 1099900011, 'user'),
(42, 'Jana Waleed', 'jana.w@example.com', 'jana2026', 23, 'female', 1199900011, 'user'),
(43, 'Ziad Karim', 'ziad.k@example.com', 'ziad88', 28, 'male', 1299900011, 'user'),
(44, 'Mariam Zakaria', 'mariam.z@example.com', 'mariam_pass', 26, 'female', 1599900011, 'user'),
(45, 'Ashraf Helmy', 'ashraf.h@example.com', 'ashraf99', 46, 'male', 1012131415, 'admin'),
(46, 'Rowan Mahmoud', 'rowan.m@example.com', 'rowan123', 22, 'female', 1112131415, 'user'),
(47, 'Belal Hamdy', 'belal.h@example.com', 'belal_pass', 30, 'male', 1212131415, 'user'),
(48, 'Ghada Ali', 'ghada.a@example.com', 'ghada2026', 34, 'female', 1512131415, 'user'),
(49, 'Ayman Fathy', 'ayman.f@example.com', 'ayman88', 39, 'male', 1016171819, 'user'),
(50, 'Shahd Samir', 'shahd.s@example.com', 'shahd_secure', 24, 'female', 1116171819, 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_app_user` (`user_id`),
  ADD KEY `fk_app_doc` (`doc_id`);

--
-- Indexes for table `appointment_subservice`
--
ALTER TABLE `appointment_subservice`
  ADD PRIMARY KEY (`appointment_id`,`subservice_id`),
  ADD KEY `fk_app_ss_ss` (`subservice_id`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_doc_spec` (`spec_id`);

--
-- Indexes for table `speciality`
--
ALTER TABLE `speciality`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sub_services`
--
ALTER TABLE `sub_services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(12) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int(12) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `speciality`
--
ALTER TABLE `speciality`
  MODIFY `id` int(12) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `sub_services`
--
ALTER TABLE `sub_services`
  MODIFY `id` int(12) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(12) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `fk_app_doc` FOREIGN KEY (`doc_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `appointment_subservice`
--
ALTER TABLE `appointment_subservice`
  ADD CONSTRAINT `fk_app_ss_app` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_app_ss_ss` FOREIGN KEY (`subservice_id`) REFERENCES `sub_services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `fk_doc_spec` FOREIGN KEY (`spec_id`) REFERENCES `speciality` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


