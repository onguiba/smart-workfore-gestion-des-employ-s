-- Script SQL pour PostgreSQL - Smart Workforce AI
-- Base de données optimisée pour PostgreSQL

-- Créer la base de données (à exécuter en tant que superuser)
-- CREATE DATABASE smart_workforce_tsa WITH ENCODING 'UTF8' LC_COLLATE='fr_FR.UTF-8' LC_CTYPE='fr_FR.UTF-8';

-- Se connecter à la base de données
-- \c smart_workforce_tsa;

-- Extension pour UUID (optionnel)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des employés
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  position VARCHAR(255),
  role VARCHAR(255),
  department VARCHAR(100),
  salary NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'absent' CHECK (status IN ('present','absent','late','on_mission')),
  photo TEXT, -- Photo de profil en base64
  avatar VARCHAR(500),
  matricule VARCHAR(50) UNIQUE,
  user_type VARCHAR(50) DEFAULT 'employee',
  join_date DATE,
  registration_date VARCHAR(50),
  registration_time VARCHAR(50),
  check_in_time VARCHAR(50),
  check_out_time VARCHAR(50),
  location_latitude NUMERIC(10,8),
  location_longitude NUMERIC(11,8),
  registration_location TEXT, -- JSON de la localisation d'inscription
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_matricule ON employees(matricule);
CREATE INDEX idx_employees_status ON employees(status);

-- Table des utilisateurs RH
CREATE TABLE IF NOT EXISTS hr_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(255),
  department VARCHAR(100) DEFAULT 'RH',
  avatar VARCHAR(500),
  matricule VARCHAR(50) UNIQUE,
  user_type VARCHAR(50) DEFAULT 'hr',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hr_users_email ON hr_users(email);

-- Table des pointages
CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  employee_email VARCHAR(255),
  employee_name VARCHAR(255),
  type VARCHAR(20) NOT NULL CHECK (type IN ('checkin','checkout')),
  check_time TIMESTAMP NOT NULL,
  check_time_formatted VARCHAR(50),
  check_date DATE NOT NULL,
  location_latitude NUMERIC(10,8),
  location_longitude NUMERIC(11,8),
  location_accuracy NUMERIC(10,2),
  photo TEXT, -- Photo de pointage en base64
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX idx_attendance_date ON attendance_records(check_date);
CREATE INDEX idx_attendance_type ON attendance_records(type);

-- Table des congés
CREATE TABLE IF NOT EXISTS leaves (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER,
  employee_name VARCHAR(255),
  employee_email VARCHAR(255),
  type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER DEFAULT 1,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX idx_leaves_employee ON leaves(employee_id);
CREATE INDEX idx_leaves_status ON leaves(status);

-- Table de la paie
CREATE TABLE IF NOT EXISTS payroll (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  employee VARCHAR(255) NOT NULL,
  matricule VARCHAR(50),
  role VARCHAR(255),
  department VARCHAR(100),
  gross_salary NUMERIC(10,2) DEFAULT 0,
  bonuses NUMERIC(10,2) DEFAULT 0,
  overtime NUMERIC(10,2) DEFAULT 0,
  deductions NUMERIC(10,2) DEFAULT 0,
  net_salary NUMERIC(10,2) DEFAULT 0,
  month VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'En attente' CHECK (status IN ('Payé','En attente')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_payroll_month ON payroll(month);

-- Table des missions
CREATE TABLE IF NOT EXISTS missions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','inProgress','completed','cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_time VARCHAR(50),
  location VARCHAR(255),
  assignee VARCHAR(255),
  priority VARCHAR(20) DEFAULT 'Normale' CHECK (priority IN ('Basse','Normale','Haute','Urgente')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_assignee ON missions(assignee);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at sur la table employees
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertion des données de démonstration
INSERT INTO employees (name, email, phone, position, role, department, salary, status, matricule, user_type, join_date, check_in_time) VALUES
('Moussa Diop', 'moussa.diop@smartworkforce.ai', '+33 6 45 89 12 30', 'Superviseur Logistique', 'Superviseur Logistique', 'Operations', 45000.00, 'present', 'SWA-8842', 'employee', '2023-01-15', '08:24'),
('Jean Dupont', 'jean.dupont@smartworkforce.ai', '+33 6 12 34 56 78', 'Architecte Cloud', 'Architecte Cloud & Systèmes', 'IT', 52000.00, 'present', 'SWA-4910', 'employee', '2022-05-20', '08:55'),
('Marie Martin', 'marie.martin@smartworkforce.ai', '+33 6 98 76 54 32', 'Analyste Données', 'Data Analyst', 'IT', 48000.00, 'late', 'SWA-3421', 'employee', '2023-03-10', '09:42');

INSERT INTO hr_users (name, email, phone, role, department, matricule, user_type) VALUES
('Sophie Laurent', 'sophie.laurent@smartworkforce.ai', '+33 6 10 20 30 40', 'Directrice des Ressources Humaines', 'Direction RH', 'SWA-DIR-01', 'hr'),
('Thomas Bernard', 'thomas.bernard@smartworkforce.ai', '+33 6 20 30 40 50', 'Manager RH', 'Ressources Humaines', 'SWA-HR-02', 'hr');

INSERT INTO missions (title, status, progress, due_time, location, assignee, priority) VALUES
('Livraison Express Client ABC', 'inProgress', 65, '17:30', 'Paris 15ème', 'Moussa Diop', 'Haute'),
('Audit Sécurité Infrastructure', 'inProgress', 40, '18:00', 'Siège Social', 'Jean Dupont', 'Urgente'),
('Formation Équipe Commerciale', 'pending', 0, '14:00', 'Salle de Conférence', 'Sophie Laurent', 'Normale');

INSERT INTO payroll (employee_id, employee, matricule, role, department, gross_salary, bonuses, overtime, deductions, net_salary, month, status) VALUES
(1, 'Moussa Diop', 'SWA-8842', 'Superviseur Logistique', 'Operations', 3750.00, 250.00, 180.00, 450.00, 3730.00, 'Mai 2026', 'Payé'),
(2, 'Jean Dupont', 'SWA-4910', 'Architecte Cloud', 'IT', 4333.33, 500.00, 0.00, 520.00, 4313.33, 'Mai 2026', 'Payé');

INSERT INTO leaves (employee_id, employee_name, employee_email, type, start_date, end_date, days, reason, status) VALUES
(1, 'Moussa Diop', 'moussa.diop@smartworkforce.ai', 'Congés Payés', '2026-06-15', '2026-06-22', 7, 'Vacances d''été', 'approved'),
(2, 'Jean Dupont', 'jean.dupont@smartworkforce.ai', 'RTT', '2026-05-20', '2026-05-20', 1, 'Démarches administratives', 'pending');

-- Vue pour les statistiques de présence
CREATE OR REPLACE VIEW attendance_summary AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'present') as present_count,
  COUNT(*) FILTER (WHERE status = 'absent') as absent_count,
  COUNT(*) FILTER (WHERE status = 'late') as late_count,
  COUNT(*) FILTER (WHERE status = 'on_mission') as on_mission_count,
  COUNT(*) as total_employees
FROM employees;

-- Vue pour les statistiques de paie
CREATE OR REPLACE VIEW payroll_summary AS
SELECT 
  month,
  COUNT(*) as employee_count,
  SUM(gross_salary) as total_gross,
  SUM(net_salary) as total_net,
  AVG(net_salary) as average_net
FROM payroll
GROUP BY month
ORDER BY month DESC;

COMMENT ON TABLE employees IS 'Table des employés avec informations complètes';
COMMENT ON TABLE attendance_records IS 'Historique des pointages (check-in/check-out)';
COMMENT ON TABLE leaves IS 'Demandes de congés et absences';
COMMENT ON TABLE payroll IS 'Gestion de la paie mensuelle';
COMMENT ON TABLE missions IS 'Suivi des missions et tâches';
