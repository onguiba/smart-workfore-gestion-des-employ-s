/**
 * TSA SmartWorkforce AI - Point d'entree racine pour Hostinger Node.js
 * Ce script permet a Hostinger de demarrer automatiquement l'application
 * quel que soit le dossier racine configure (racine ou backend/).
 */

const path = require('path');

// Demarrer le serveur backend Node.js
require('./backend/server.js');