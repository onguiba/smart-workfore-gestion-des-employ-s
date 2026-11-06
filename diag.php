<?php
// Script de test et diagnostic Hostinger
header('Content-Type: application/json; charset=utf-8');

 = [
    'status' => 'ok',
    'php_version' => PHP_VERSION,
    'pdo_mysql' => extension_loaded('pdo_mysql'),
    'json' => extension_loaded('json'),
    'db_connection' => null,
    'json_data_readable' => false,
    'timestamp' => date('c')
];

// Test connexion DB
try {
    require_once __DIR__ . '/backend/api/config.php';
     = getDBConnection();
    if () {
        ['db_connection'] = 'MySQL Connecté';
    } else {
        ['db_connection'] = 'JSON Fallback actif';
    }
     = getJsonData();
    ['json_data_readable'] = !empty(['employees']);
    ['employees_count'] = count(['employees'] ?? []);
} catch (Throwable ) {
    ['status'] = 'error';
    ['error'] = ->getMessage();
    ['file'] = ->getFile();
    ['line'] = ->getLine();
}

echo json_encode(, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);