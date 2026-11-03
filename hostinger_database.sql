-- ==============================================================================
-- TSA SmartWorkforce AI™ — Schéma de Base de Données MySQL 8 pour Hostinger
-- Compatible : Hostinger cPanel / hPanel phpMyAdmin & Hostinger Docker VPS
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Départements
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Utilisateurs & Administrateurs RH
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NULL,
  `role` VARCHAR(100) NOT NULL,
  `department` VARCHAR(100) DEFAULT 'Ressources Humaines',
  `user_type` ENUM('hr', 'employee', 'admin') DEFAULT 'employee',
  `matricule` VARCHAR(50) UNIQUE,
  `phone` VARCHAR(30),
  `avatar` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Employés
CREATE TABLE IF NOT EXISTS `employees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `phone` VARCHAR(30),
  `position` VARCHAR(100),
  `role` VARCHAR(100),
  `department` VARCHAR(100),
  `salary` DECIMAL(10, 2) DEFAULT 0.00,
  `matricule` VARCHAR(50) UNIQUE,
  `user_type` VARCHAR(30) DEFAULT 'employee',
  `status` ENUM('present', 'absent', 'late', 'onMission') DEFAULT 'present',
  `photo` LONGTEXT,
  `avatar` LONGTEXT,
  `join_date` VARCHAR(50),
  `registration_hour` VARCHAR(20),
  `checkin_time` VARCHAR(20) DEFAULT '-',
  `location` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Pointage (Arrivée & Départ avec Biométrie & Géolocalisation)
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NULL,
  `employee_email` VARCHAR(150) NOT NULL,
  `type` ENUM('checkin', 'checkout') NOT NULL,
  `check_time` VARCHAR(50),
  `check_time_formatted` VARCHAR(20),
  `check_date` VARCHAR(30),
  `location` JSON,
  `photo` LONGTEXT,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_attendance_email` (`employee_email`),
  INDEX `idx_attendance_type` (`type`),
  INDEX `idx_attendance_date` (`check_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Demandes de Congés
CREATE TABLE IF NOT EXISTS `leaves` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NULL,
  `employee_email` VARCHAR(150) NULL,
  `employee_name` VARCHAR(150) NULL,
  `type` VARCHAR(50) NOT NULL,
  `start_date` VARCHAR(30) NOT NULL,
  `end_date` VARCHAR(30) NOT NULL,
  `days` INT DEFAULT 1,
  `reason` TEXT,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Soldes de Congés
CREATE TABLE IF NOT EXISTS `leave_balances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_email` VARCHAR(150) UNIQUE NOT NULL,
  `annual_total` INT DEFAULT 25,
  `annual_taken` INT DEFAULT 5,
  `annual_remaining` INT DEFAULT 20,
  `rtt_total` INT DEFAULT 10,
  `rtt_taken` INT DEFAULT 2,
  `rtt_remaining` INT DEFAULT 8,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Missions de Transport & Logistique
CREATE TABLE IF NOT EXISTS `missions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `agent` VARCHAR(150),
  `destination` VARCHAR(200),
  `status` ENUM('inProgress', 'completed', 'pending', 'cancelled') DEFAULT 'inProgress',
  `priority` ENUM('high', 'medium', 'low') DEFAULT 'medium',
  `progress` INT DEFAULT 0,
  `eta` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Paie & Fiches de Salaire
CREATE TABLE IF NOT EXISTS `payroll` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NULL,
  `employee_email` VARCHAR(150) NULL,
  `month` VARCHAR(50) NOT NULL,
  `gross_salary` DECIMAL(10, 2) NOT NULL,
  `net_salary` DECIMAL(10, 2) NOT NULL,
  `bonuses` DECIMAL(10, 2) DEFAULT 0.00,
  `overtime_hours` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Détection de Fraude & Anomalies SOC
CREATE TABLE IF NOT EXISTS `fraud_alerts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_name` VARCHAR(150),
  `employee_email` VARCHAR(150),
  `type` VARCHAR(100) NOT NULL,
  `severity` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `description` TEXT,
  `time` VARCHAR(50),
  `location` JSON,
  `resolved` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Messages Chatbot RH IA
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_email` VARCHAR(150),
  `role` ENUM('user', 'assistant') NOT NULL,
  `text` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- DONNÉES INITIALES PAR DÉFAUT (SEEDS)
-- ==============================================================================

-- Départements
INSERT INTO `departments` (`name`, `description`) VALUES
('Direction Générale', 'Management stratégique TSA'),
('Direction RH', 'Gestion des ressources humaines et talents'),
('Opérations & Logistique', 'Supervision des transports et convois'),
('Informatique & Systèmes', 'Infrastructure cloud et IA'),
('Commercial & Ventes', 'Développement commercial')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Équipe RH Officielle
INSERT INTO `users` (`id`, `name`, `email`, `role`, `department`, `user_type`, `matricule`, `phone`, `avatar`) VALUES
('hr-1', 'Sophie Laurent', 'sophie.laurent@smartworkforce.ai', 'Directrice des Ressources Humaines', 'Direction RH', 'hr', 'SWA-DIR-01', '+33 6 10 20 30 40', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
('hr-2', 'Marie Martin', 'marie.martin@smartworkforce.ai', 'Responsable Recrutement & Talents', 'Ressources Humaines', 'hr', 'SWA-HR-02', '+33 6 98 76 54 32', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80')
ON DUPLICATE KEY UPDATE `email`=`email`;

-- Employés initiaux
INSERT INTO `employees` (`id`, `name`, `email`, `phone`, `position`, `role`, `department`, `salary`, `matricule`, `status`, `checkin_time`, `avatar`) VALUES
(1, 'Moussa Diop', 'moussa.diop@smartworkforce.ai', '+33 6 45 89 12 30', 'Superviseur Logistique', 'Superviseur Logistique', 'Operations', 45000.00, 'SWA-8842', 'present', '08:24', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
(2, 'Jean Dupont', 'jean.dupont@smartworkforce.ai', '+33 6 12 34 56 78', 'Architecte Cloud & Systèmes', 'Architecte Cloud & Systèmes', 'IT', 52000.00, 'SWA-4910', 'present', '08:55', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
(3, 'Marie Martin', 'marie.martin@smartworkforce.ai', '+33 6 98 76 54 32', 'Responsable Recrutement & Talents', 'Responsable Recrutement & Talents', 'HR', 48000.00, 'SWA-3301', 'late', '09:42', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
(4, 'Daniel Gomis', 'daniel.gomis@smartworkforce.ai', '+33 6 55 44 33 22', 'Chauffeur Poids Lourd', 'Chauffeur Poids Lourd', 'Logistics', 42000.00, 'SWA-7219', 'present', '07:50', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
(5, 'Lucas Mercier', 'lucas.mercier@smartworkforce.ai', '+33 6 77 88 99 00', 'Account Executive B2B', 'Account Executive B2B', 'Sales', 50000.00, 'SWA-5541', 'present', '08:40', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'),
(6, 'Sarah Perez', 'sarah.perez@smartworkforce.ai', '+33 6 33 22 11 00', 'Chef de Produit IA', 'Chef de Produit IA', 'Marketing', 47000.00, 'SWA-6022', 'absent', '-', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80')
ON DUPLICATE KEY UPDATE `email`=`email`;

-- Missions initiales
INSERT INTO `missions` (`title`, `description`, `agent`, `destination`, `status`, `priority`, `progress`, `eta`) VALUES
('Livraison Convoi Sécurisé Dakar-Saint-Louis', 'Transport de matériel critique pour filiale portuaire', 'Daniel Gomis', 'Saint-Louis, Sénégal', 'inProgress', 'high', 68, '18:45'),
('Audit Sécurité & Biométrie Hub Abidjan', 'Mise à niveau des terminaux de pointage facial', 'Jean Dupont', 'Abidjan, Côte d\'Ivoire', 'inProgress', 'medium', 42, 'Demain 10:00')
ON DUPLICATE KEY UPDATE `title`=`title`;

SET FOREIGN_KEY_CHECKS = 1;
