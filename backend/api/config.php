<?php
/**
 * TSA SmartWorkforce AI — Configuration & Base de Données Universelle
 * Compatible :
 * 1. Hostinger cPanel / hPanel MySQL 8
 * 2. Serveur local / Docker MySQL
 * 3. Fallback persistant JSON autonome (si MySQL temporairement inaccessible)
 */

// Charger les variables d'environnement depuis .env si présent
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0 || strpos($line, '=') === false) continue;
        list($key, $val) = explode('=', $line, 2);
        $key = trim($key);
        $val = trim($val, " \t\n\r\0\x0B\"'");
        if (!getenv($key)) putenv("$key=$val");
    }
}

// Paramètres de connexion MySQL Hostinger par défaut
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'u954610625_db_6LxveS47');
define('DB_USER', getenv('DB_USER') ?: 'u954610625_usr_6LxveS47');
define('DB_PASS', getenv('DB_PASSWORD') ?: (getenv('DB_PASS') ?: 'DOesWJm^2O:'));
define('DB_PORT', getenv('DB_PORT') ?: 3306);

// Fichier de données JSON de secours
define('JSON_FALLBACK_FILE', __DIR__ . '/../data/database.json');

// Headers CORS globaux
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Connexion PDO à MySQL avec détection automatique
 */
function getDBConnection() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $passwordsToTry = [DB_PASS, 'DOesWJm^2O:', 'S@3uF-db', 'S@SuF-db', ''];
    $uniquePasswords = array_unique($passwordsToTry);

    foreach ($uniquePasswords as $pass) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $conn = new PDO($dsn, DB_USER, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 2
            ]);
            $pdo = $conn;
            initTablesIfMissing($pdo);
            return $pdo;
        } catch (Exception $e) {
            // Continuer au mot de passe suivant
        }
    }

    return null;
}

/**
 * Initialiser les tables MySQL automatiquement si absentes
 */
function initTablesIfMissing($pdo) {
    if (!$pdo) return;
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `employees` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `name` VARCHAR(150) NOT NULL,
              `email` VARCHAR(150) UNIQUE NOT NULL,
              `phone` VARCHAR(50) NULL,
              `position` VARCHAR(100) NULL,
              `role` VARCHAR(100) NULL,
              `department` VARCHAR(100) NULL,
              `salary` DECIMAL(10, 2) DEFAULT 0.00,
              `matricule` VARCHAR(50) UNIQUE NULL,
              `userType` VARCHAR(30) DEFAULT 'employee',
              `status` ENUM('present', 'absent', 'late', 'onMission') DEFAULT 'present',
              `photo` LONGTEXT NULL,
              `avatar` LONGTEXT NULL,
              `joinDate` VARCHAR(50) NULL,
              `registrationTime` VARCHAR(20) NULL,
              `checkInTime` VARCHAR(20) DEFAULT '-',
              `checkOutTime` VARCHAR(20) DEFAULT '-',
              `location_latitude` DECIMAL(10,8) NULL,
              `location_longitude` DECIMAL(11,8) NULL,
              `registrationLocation` TEXT NULL,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS `attendance_records` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `employee_id` INT NULL,
              `employee_email` VARCHAR(150) NOT NULL,
              `employee_name` VARCHAR(150) NULL,
              `type` ENUM('checkin', 'checkout') NOT NULL,
              `check_time` DATETIME NULL,
              `check_time_formatted` VARCHAR(20) NULL,
              `check_date` DATE NULL,
              `location_latitude` DECIMAL(10,8) NULL,
              `location_longitude` DECIMAL(11,8) NULL,
              `location_accuracy` DECIMAL(10,2) NULL,
              `photo` LONGTEXT NULL,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS `missions` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `title` VARCHAR(200) NOT NULL,
              `description` TEXT NULL,
              `agent` VARCHAR(150) NULL,
              `destination` VARCHAR(200) NULL,
              `status` ENUM('inProgress', 'completed', 'pending', 'cancelled') DEFAULT 'inProgress',
              `priority` VARCHAR(50) DEFAULT 'Normale',
              `progress` INT DEFAULT 0,
              `dueTime` VARCHAR(50) NULL,
              `location` VARCHAR(200) NULL,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS `leaves` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `employee_id` INT NULL,
              `employee_email` VARCHAR(150) NULL,
              `employee_name` VARCHAR(150) NULL,
              `type` VARCHAR(50) NOT NULL,
              `start_date` VARCHAR(30) NOT NULL,
              `end_date` VARCHAR(30) NOT NULL,
              `days` INT DEFAULT 1,
              `reason` TEXT NULL,
              `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS `payroll` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `employee_id` INT NULL,
              `employee` VARCHAR(150) NOT NULL,
              `matricule` VARCHAR(50) NULL,
              `role` VARCHAR(100) NULL,
              `department` VARCHAR(100) NULL,
              `gross_salary` DECIMAL(10, 2) NOT NULL,
              `net_salary` DECIMAL(10, 2) NOT NULL,
              `bonuses` DECIMAL(10, 2) DEFAULT 0.00,
              `overtime` DECIMAL(10, 2) DEFAULT 0.00,
              `deductions` DECIMAL(10, 2) DEFAULT 0.00,
              `month` VARCHAR(50) NOT NULL,
              `status` ENUM('Payé', 'En attente') DEFAULT 'Payé',
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS `fraud_alerts` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `employee` VARCHAR(150) NULL,
              `type` VARCHAR(100) NOT NULL,
              `severity` ENUM('low', 'medium', 'high', 'warning', 'critical') DEFAULT 'warning',
              `description` TEXT NULL,
              `time` VARCHAR(50) NULL,
              `location` VARCHAR(255) NULL,
              `resolved` TINYINT(1) DEFAULT 0,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
    } catch (Exception $e) {
        // Ignorer les erreurs si tables déjà présentes
    }
}

/**
 * Obtenir les données JSON du fallback
 */
function getJsonData() {
    $file = JSON_FALLBACK_FILE;
    if (!file_exists($file)) {
        // Chercher dans l'autre emplacement possible
        $alt = __DIR__ . '/../../data/database.json';
        if (file_exists($alt)) $file = $alt;
    }

    if (file_exists($file)) {
        $json = file_get_contents($file);
        $data = json_decode($json, true);
        if (is_array($data)) return $data;
    }

    // Données par défaut si le fichier n'existe pas encore
    return [
        'hrUsers' => [
            [
                'id' => 'hr-1',
                'name' => 'Sophie Laurent',
                'email' => 'sophie.laurent@smartworkforce.ai',
                'role' => 'Directrice des Ressources Humaines',
                'department' => 'Direction RH',
                'phone' => '+33 6 10 20 30 40',
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
                'userType' => 'hr',
                'matricule' => 'SWA-DIR-01'
            ]
        ],
        'employees' => [
            [
                'id' => 1,
                'name' => 'Moussa Diop',
                'email' => 'moussa.diop@smartworkforce.ai',
                'phone' => '+33 6 45 89 12 30',
                'position' => 'Superviseur Logistique',
                'role' => 'Superviseur Logistique',
                'department' => 'Operations',
                'salary' => 45000,
                'matricule' => 'SWA-8842',
                'status' => 'present',
                'checkInTime' => '08:24',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'userType' => 'employee'
            ],
            [
                'id' => 2,
                'name' => 'Jean Dupont',
                'email' => 'jean.dupont@smartworkforce.ai',
                'phone' => '+33 6 12 34 56 78',
                'position' => 'Architecte Cloud & Systèmes',
                'role' => 'Architecte Cloud & Systèmes',
                'department' => 'IT',
                'salary' => 52000,
                'matricule' => 'SWA-4910',
                'status' => 'present',
                'checkInTime' => '08:55',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                'userType' => 'employee'
            ]
        ],
        'attendanceRecords' => [],
        'missions' => [
            [
                'id' => 1,
                'title' => 'Livraison Convoi Sécurisé Dakar-Saint-Louis',
                'description' => 'Transport de matériel critique pour filiale portuaire',
                'agent' => 'Daniel Gomis',
                'destination' => 'Saint-Louis, Sénégal',
                'status' => 'inProgress',
                'priority' => 'Haute',
                'progress' => 68,
                'dueTime' => '18:45'
            ]
        ],
        'leaves' => [],
        'payroll' => [],
        'fraudAlerts' => [],
        'chatMessages' => []
    ];
}

/**
 * Sauvegarder les données dans le fichier JSON
 */
function saveJsonData($data) {
    $dir = dirname(JSON_FALLBACK_FILE);
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
    @file_put_contents(JSON_FALLBACK_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    // Également mettre à jour l'emplacement data/ racine si existant
    $alt = __DIR__ . '/../../data/database.json';
    if (file_exists(dirname($alt))) {
        @file_put_contents($alt, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}

/**
 * Helper de réponse JSON standardisée
 */
function jsonResponse($success, $dataOrMessage = null, $extra = [], $statusCode = 200) {
    http_response_code($statusCode);
    $response = ['success' => (bool)$success];
    if (is_string($dataOrMessage)) {
        if ($success) $response['message'] = $dataOrMessage;
        else $response['error'] = $dataOrMessage;
    } elseif ($dataOrMessage !== null) {
        $response['data'] = $dataOrMessage;
    }
    if (!empty($extra) && is_array($extra)) {
        $response = array_merge($response, $extra);
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

