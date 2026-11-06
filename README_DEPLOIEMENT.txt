# ==============================================================================
# TSA SmartWorkforce AI™ — Guide de Déploiement Hostinger (Ultra-Simple)
# ==============================================================================

Ce dépôt est conçu pour être déployé en 1 seul clic via le ZIP téléchargé depuis GitHub.

------------------------------------------------------------------------------
ÉTAPES DE MISE EN LIGNE SUR HOSTINGER :
------------------------------------------------------------------------------

1. TÉLÉCHARGER LE PROJET :
   - Sur votre dépôt GitHub, cliquez sur le bouton vert [ <> Code ]
   - Cliquez sur [ Download ZIP ]

2. CHARGER SUR HOSTINGER :
   - Connectez-vous à votre panneau Hostinger (hPanel)
   - Rendez-vous dans : "Gestionnaire de fichiers" > ouvrez le dossier "public_html"
   - Glissez-déposez le fichier ZIP téléchargé dans "public_html"
   - Faites Clic Droit sur le ZIP > "Extraire"

3. CONFIGURATION DES IDENTIFIANTS BASE DE DONNÉES :
   - Par défaut, l'application fonctionne immédiatement avec sa base JSON locale sécurisée.
   - Si vous utilisez une base MySQL Hostinger :
     Ouvrez simplement le fichier "api/config.php" ou créez "backend/.env" pour renseigner :
       DB_HOST=localhost
       DB_NAME=votre_nom_de_base
       DB_USER=votre_utilisateur
       DB_PASSWORD=votre_mot_de_passe

4. ACCÉDER AU SITE :
   - Ouvrez votre domaine dans votre navigateur :
     https://votre-domaine.com/
   - Le fichier index.php / index.html vous redirige automatiquement vers l'application !

------------------------------------------------------------------------------
STRUCTURE COMPLÈTE APRÈS EXTRACTION :
------------------------------------------------------------------------------
public_html/
  ├── .htaccess           (Règles de routage automatique et sécurité)
  ├── index.php           (Point d'entrée principal avec redirection)
  ├── index.html          (Secours redirection universelle)
  ├── api/                (Point d'accès standard pour les APIs)
  │     ├── config.php    (Fichier de configuration de la base)
  │     └── employees.php (Routeur employés)
  ├── backend/            (Moteur API PHP, base JSON et scripts SQL)
  │     ├── api/
  │     ├── data/
  │     └── hostinger_database.sql
  └── frontend/           (Tous les écrans HTML, styles CSS et scripts JS)
        ├── home.html
        ├── attendance.html (Pointage Face ID / Email)
        ├── dashboard.html  (Tableau de bord RH avec heures d'arrivée et départ)
        ├── employee-portal.html (Portail collaborateur personnel)
        └── ...
