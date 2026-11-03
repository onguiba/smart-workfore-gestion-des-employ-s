<?php
// Configuration de la base de données MySQL Hostinger
// Remplacez ces valeurs par celles fournies par Hostinger

define('DB_HOST', 'localhost'); // ou l'hôte fourni par Hostinger
define('DB_NAME', 'u954610625_db_OhzWYKBo'); // Nom de votre base de données
define('DB_USER', 'u954610625_usr_OhzWYKBo'); // Nom d'utilisateur
define('DB_PASS', 'S@SuF-db'); // Mot de passe

// Connexion à la base de données
function getDBConnection() {
    try {
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $conn;
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur de connexion à la base de données']);
        exit();
    }
}

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
