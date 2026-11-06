<?php
/**
 * TSA SmartWorkforce AI™ — Point d'entrée Hostinger
 */
if (file_exists(__DIR__ . '/home.html')) {
    include __DIR__ . '/home.html';
    exit();
} else {
    header('Location: home.html');
    exit();
}
