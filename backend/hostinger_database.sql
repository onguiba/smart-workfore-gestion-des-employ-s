-- Script SQL pour MySQL Hostinger
-- À exécuter dans phpMyAdmin de Hostinger
-- Base de données: u954610625_db_8FSN1oDM

USE `u954610625_db_8FSN1oDM`;

-- Table des employés
CREATE TABLE IF NOT EXISTS `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `phone` varchar(50) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `status` enum('present','absent','late','on_mission') DEFAULT 'absent',
  `photo` longtext DEFAULT NULL COMMENT 'Photo de profil en base64',
  `avatar` varchar(500) DEFAULT NULL,
  `matricule` varchar(50) UNIQUE DEFAULT NULL,
  `user_type` varchar(50) DEFAULT 'employee',
  `join_date` date DEFAULT NULL,
  `registration_date` varchar(50) DEFAULT NULL,
  `registration_time` varchar(50) DEFAULT NULL,
  `check_in_time` varchar(50) DEFAULT NULL,
  `check_out_time` varchar(50) DEFAULT NULL,
  `location_latitude` decimal(10,8) DEFAULT NULL,
  `location_longitude` decimal(11,8) DEFAULT NULL,
  `registration_location` text DEFAULT NULL COMMENT 'JSON de la localisation',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_matricule` (`matricule`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des utilisateurs RH
CREATE TABLE IF NOT EXISTS `hr_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `phone` varchar(50) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT 'RH',
  `avatar` varchar(500) DEFAULT NULL,
  `matricule` varchar(50) UNIQUE DEFAULT NULL,
  `user_type` varchar(50) DEFAULT 'hr',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des pointages
CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `employee_email` varchar(255) DEFAULT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `type` enum('checkin','checkout') NOT NULL,
  `check_time` datetime NOT NULL,
  `check_time_formatted` varchar(50) DEFAULT NULL,
  `check_date` date NOT NULL,
  `location_latitude` decimal(10,8) DEFAULT NULL,
  `location_longitude` decimal(11,8) DEFAULT NULL,
  `location_accuracy` decimal(10,2) DEFAULT NULL,
  `photo` longtext DEFAULT NULL COMMENT 'Photo de pointage en base64',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_date` (`check_date`),
  KEY `idx_type` (`type`),
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des congés
CREATE TABLE IF NOT EXISTS `leaves` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) DEFAULT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `employee_email` varchar(255) DEFAULT NULL,
  `type` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days` int(11) DEFAULT 1,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de la paie
CREATE TABLE IF NOT EXISTS `payroll` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `employee` varchar(255) NOT NULL,
  `matricule` varchar(50) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `gross_salary` decimal(10,2) DEFAULT 0,
  `bonuses` decimal(10,2) DEFAULT 0,
  `overtime` decimal(10,2) DEFAULT 0,
  `deductions` decimal(10,2) DEFAULT 0,
  `net_salary` decimal(10,2) DEFAULT 0,
  `month` varchar(50) NOT NULL,
  `status` enum('Payé','En attente') DEFAULT 'En attente',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_month` (`month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des missions
CREATE TABLE IF NOT EXISTS `missions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `status` enum('pending','inProgress','completed','cancelled') DEFAULT 'pending',
  `progress` int(11) DEFAULT 0,
  `due_time` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `assignee` varchar(255) DEFAULT NULL,
  `priority` enum('Basse','Normale','Haute','Urgente') DEFAULT 'Normale',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_assignee` (`assignee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion des données de démonstration
INSERT INTO `employees` (`name`, `email`, `phone`, `position`, `role`, `department`, `salary`, `status`, `matricule`, `user_type`, `join_date`, `check_in_time`) VALUES
('Moussa Diop', 'moussa.diop@smartworkforce.ai', '+33 6 45 89 12 30', 'Superviseur Logistique', 'Superviseur Logistique', 'Operations', 45000.00, 'present', 'SWA-8842', 'employee', '2023-01-15', '08:24'),
('Jean Dupont', 'jean.dupont@smartworkforce.ai', '+33 6 12 34 56 78', 'Architecte Cloud', 'Architecte Cloud & Systèmes', 'IT', 52000.00, 'present', 'SWA-4910', 'employee', '2022-05-20', '08:55'),
('Marie Martin', 'marie.martin@smartworkforce.ai', '+33 6 98 76 54 32', 'Analyste Données', 'Data Analyst', 'IT', 48000.00, 'late', 'SWA-3421', 'employee', '2023-03-10', '09:42');

INSERT INTO `hr_users` (`name`, `email`, `phone`, `role`, `department`, `matricule`, `user_type`) VALUES
('Sophie Laurent', 'sophie.laurent@smartworkforce.ai', '+33 6 10 20 30 40', 'Directrice des Ressources Humaines', 'Direction RH', 'SWA-DIR-01', 'hr'),
('Thomas Bernard', 'thomas.bernard@smartworkforce.ai', '+33 6 20 30 40 50', 'Manager RH', 'Ressources Humaines', 'SWA-HR-02', 'hr');

INSERT INTO `missions` (`title`, `status`, `progress`, `due_time`, `location`, `assignee`, `priority`) VALUES
('Livraison Express Client ABC', 'inProgress', 65, '17:30', 'Paris 15ème', 'Moussa Diop', 'Haute'),
('Audit Sécurité Infrastructure', 'inProgress', 40, '18:00', 'Siège Social', 'Jean Dupont', 'Urgente'),
('Formation Équipe Commerciale', 'pending', 0, '14:00', 'Salle de Conférence', 'Sophie Laurent', 'Normale');

INSERT INTO `payroll` (`employee_id`, `employee`, `matricule`, `role`, `department`, `gross_salary`, `bonuses`, `overtime`, `deductions`, `net_salary`, `month`, `status`) VALUES
(1, 'Moussa Diop', 'SWA-8842', 'Superviseur Logistique', 'Operations', 3750.00, 250.00, 180.00, 450.00, 3730.00, 'Mai 2026', 'Payé'),
(2, 'Jean Dupont', 'SWA-4910', 'Architecte Cloud', 'IT', 4333.33, 500.00, 0.00, 520.00, 4313.33, 'Mai 2026', 'Payé');

INSERT INTO `leaves` (`employee_id`, `employee_name`, `employee_email`, `type`, `start_date`, `end_date`, `days`, `reason`, `status`) VALUES
(1, 'Moussa Diop', 'moussa.diop@smartworkforce.ai', 'Congés Payés', '2026-06-15', '2026-06-22', 7, 'Vacances d''été', 'approved'),
(2, 'Jean Dupont', 'jean.dupont@smartworkforce.ai', 'RTT', '2026-05-20', '2026-05-20', 1, 'Démarches administratives', 'pending');
