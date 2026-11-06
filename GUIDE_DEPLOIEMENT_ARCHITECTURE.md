# 🚀 TSA SmartWorkforce AI — Nouvelle Architecture & Guide de Déploiement

## 🌟 Ce qui a été accompli

### 1. Véritable Communication Backend ⟷ Frontend
* **Suppression de `localdb.js`** : Toutes les simulations localStorage qui interceptaient les appels `fetch()` ont été retirées de toutes les pages HTML.
* **Appels HTTP REST réels** : Toutes les pages communiquent désormais directement avec les endpoints `/api/*` du serveur.
* **Prise en charge complète** :
  * 📸 Inscription biométrique avec photo capturée en Base64 et géolocalisation GPS réelle (`POST /api/employees/register`).
  * ⏰ Pointage d'arrivée avec photo et coordonnées GPS (`POST /api/attendance/checkin`).
  * 🚪 Pointage de départ avec photo et coordonnées GPS (`POST /api/attendance/checkout`).
  * 💼 Missions logistiques & transport (`GET /api/missions`, `POST /api/missions/create`, `POST /api/missions/update`).
  * 🌴 Demandes et validation de congés (`GET /api/leaves`, `GET /api/leaves/balance`, `POST /api/leaves/request`, `POST /api/leaves/approve`).
  * 💰 Fiches de paie et calcul des salaires (`GET /api/payroll`, `POST /api/payroll/calculate`).
  * 🛡️ Détection de fraude & alertes SOC (`GET /api/fraud/alerts`, `POST /api/fraud/alerts/resolve`, `POST /api/fraud/scan`).
  * 📍 Suivi cartographique et tracking GPS des agents terrain (`GET /api/tracking/agents`).
  * 🤖 Assistant RH IA interactif et contextuel (`POST /api/chatbot/message`, `GET /api/chatbot/messages`).
  * 📊 Tableaux de bord RH & Analytics (`GET /api/analytics/summary`, `GET /api/stats`).

---

### 2. Architecture Propre : Backends Ensemble & Frontends Ensemble

```
smart-workfore-gestion-des-employ-s-main/
│
├── backend/                       ⭐ TOUT LE BACKEND REGROUPÉ
│   ├── api/
│   │   ├── config.php             ⭐ Configuration PDO MySQL Hostinger + Résilience JSON
│   │   ├── index.php              ⭐ Routeur REST API complet (PHP Hostinger)
│   │   ├── employees.php          ⭐ Alias rétrocompatible
│   │   └── employees-api.php      ⭐ Alias rétrocompatible
│   ├── server.js                  ⭐ Serveur Node.js complet (Express/HTTP + Statique)
│   ├── database.js                ⭐ Gestionnaire universel (MySQL / PostgreSQL / JSON)
│   ├── database.sql               ⭐ Schéma MySQL avec jeux de données
│   ├── hostinger_database.sql     ⭐ Schéma Hostinger optimisé
│   ├── package.json               ⭐ Dépendances Node.js (mysql2, pg, dotenv)
│   ├── .env                       ⭐ Identifiants BDD Hostinger
│   └── data/
│       └── database.json          ⭐ Stockage résilient autonome
│
├── frontend/                      ⭐ TOUT LE FRONTEND REGROUPÉ
│   ├── home.html                  ⭐ Portail d'accueil collaborateurs
│   ├── login.html                 ⭐ Connexion avec Face ID & compte RH/Employé
│   ├── register.html              ⭐ Inscription avec Caméra + GPS
│   ├── attendance.html            ⭐ Pointage Arrivée/Départ avec Caméra + GPS
│   ├── dashboard.html             ⭐ Tableau de bord RH
│   ├── enhanced-dashboard.html    ⭐ Redirection dashboard
│   ├── mon-compte.html            ⭐ Espace personnel collaborateur
│   ├── missions.html              ⭐ Suivi & création de missions
│   ├── leaves.html                ⭐ Gestion & approbation des congés
│   ├── leave-request.html         ⭐ Formulaire de demande de congé
│   ├── payroll.html               ⭐ Fiches de paie
│   ├── tracking.html              ⭐ Carte GPS temps réel
│   ├── fraud-detection.html       ⭐ Alertes de sécurité & géofencing
│   ├── chat.html                  ⭐ Assistant RH IA
│   ├── styles.css & professional-styles.css
│   ├── api.js                     ⭐ Client API centralisé
│   ├── *.js                       ⭐ Tous les scripts fonctionnels
│   └── image/
│       └── tsa.jpeg               ⭐ Logo officiel TSA
│
├── .htaccess                      ⭐ Routage Apache Hostinger (/api/* -> backend/api/index.php)
├── index.php                      ⭐ Redirection racine vers frontend/home.html
├── index.html                     ⭐ Redirection HTML immédiate
├── start.bat                      ⭐ Lancement 1-clic en local (Node.js)
├── preparer-deploiement-hostinger.ps1 ⭐ Script de création du package ZIP
└── hostinger-deploy.zip           ⭐ Archive prête à uploader sur Hostinger
```

---

## 🛠️ Comment Tester en Local (Node.js)

1. Double-cliquez sur `start.bat` (ou ouvrez un terminal et tapez `npm start`).
2. Ouvrez votre navigateur sur : [http://localhost:3000](http://localhost:3000)
3. Vous pouvez :
   - Vous inscrire avec photo et GPS sur `register.html`
   - Pointer arrivée et départ sur `attendance.html`
   - Consulter vos fiches de paie, vos congés, vos missions et chatter avec l'IA.

---

## 🌐 Comment Déployer sur Hostinger (Apache / PHP / MySQL)

### Étape 1 : Base de Données
1. Connectez-vous sur votre compte Hostinger (hPanel).
2. Rendez-vous dans **Bases de données MySQL** et notez le nom de votre BDD, utilisateur et mot de passe. *(Vos identifiants préconfigurés sont dans `backend/api/config.php`)*.
3. Cliquez sur **phpMyAdmin** et importez le fichier `hostinger_database.sql` (ou `database.sql`).

### Étape 2 : Fichiers Web
1. Ouvrez le **Gestionnaire de fichiers** d'Hostinger.
2. Allez dans le dossier `public_html/`.
3. Uploadez le fichier **`hostinger-deploy.zip`** qui a été généré à la racine du projet.
4. Faites un clic droit sur `hostinger-deploy.zip` et sélectionnez **Extraire**.
5. C'est tout ! Votre site est immédiatement fonctionnel avec votre domaine.

