<?php
/**
 * Configuration Base de Données Hostinger
 * Généré automatiquement pour Hostinger
 */

// Paramètres de connexion MySQL Hostinger
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'u954610625_db_6LxveS47');
define('DB_USER', getenv('DB_USER') ?: 'u954610625_usr_6LxveS47');
define('DB_PASS', getenv('DB_PASSWORD') ?: (getenv('DB_PASS') ?: 'DOesWJm^2O:'));
define('DB_PORT', getenv('DB_PORT') ?: 3306);

// Inclusion du moteur complet
require_once __DIR__ . '/../backend/api/config.php';
