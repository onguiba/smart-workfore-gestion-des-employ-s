# 🚀 Smart Workforce AI - Système de Gestion Intelligente des Employés

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Système complet de gestion RH avec reconnaissance faciale, pointage biométrique, gestion des congés, chat IA, tracking GPS et détection de fraude en temps réel.

## ✨ Fonctionnalités Principales

- 🔐 **Authentification Biométrique** - Reconnaissance faciale Face ID
- ⏰ **Pointage Intelligent** - Check-in/Check-out avec géolocalisation
- 📊 **Dashboard RH** - Vue d'ensemble temps réel des employés
- 📅 **Gestion des Congés** - Demandes et approbations en ligne
- 💰 **Module Paie** - Calcul automatique des salaires
- 🚗 **Tracking GPS** - Suivi des missions terrain en temps réel
- 🛡️ **Détection de Fraude** - IA pour identifier les anomalies
- 💬 **Chat IA Intégré** - Assistant intelligent RH
- 📱 **Responsive Design** - Compatible mobile et desktop

## 🚀 Démarrage Rapide

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installé
- Git installé

### Installation (2 minutes)

```bash
# 1. Cloner le projet
git clone https://github.com/onguiba/smart-workfore-gestion-des-employ-s.git
cd smart-workfore-gestion-des-employ-s-main

# 2. Créer le fichier de configuration
cp .env.example .env

# 3. Modifier .env avec vos mots de passe
# Changez: DB_PASSWORD, JWT_SECRET

# 4. Démarrer l'application
docker-compose up -d

# 5. Accéder à l'application
# http://localhost
```

### 🗄️ Choix de la Base de Données

Le projet supporte **2 bases de données** :

#### Option 1 : PostgreSQL (Docker - Recommandé pour développement)

```bash
# Utiliser PostgreSQL avec Docker
docker-compose up -d
```

#### Option 2 : MySQL (Hostinger - Production)

```bash
# 1. Configurer les identifiants Hostinger
cp backend/.env.hostinger backend/.env

# 2. Modifier backend/.env avec vos identifiants MySQL Hostinger
# DB_DRIVER=mysql
# DB_HOST=localhost
# DB_NAME=votre_db
# DB_USER=votre_user
# DB_PASSWORD=votre_password

# 3. Importer le schéma SQL dans phpMyAdmin
# Fichier: backend/hostinger_database.sql

# 4. Tester la connexion
cd backend
npm install
node test_connection.js

# 5. Démarrer l'application
npm start
```

#### Option 3 : MySQL avec Docker (Alternative)

```bash
docker-compose -f docker-compose.mysql.yml up -d
```

### Basculer entre MySQL et PostgreSQL

Modifiez simplement le fichier `backend/.env` :

**PostgreSQL** :
```env
DB_DRIVER=postgresql
DB_HOST=postgres
DB_PORT=5432
```

**MySQL (Hostinger)** :
```env
DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
```

**Mode JSON (Sans DB)** :
```env
DB_DRIVER=json
```

### Commandes Utiles

```bash
# Démarrer avec PostgreSQL
docker-compose up -d

# Démarrer avec MySQL (Docker)
docker-compose -f docker-compose.mysql.yml up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f

# Tester connexion MySQL
cd backend && node test_connection.js

# Sauvegarder PostgreSQL
docker-compose exec postgres pg_dump -U smartworkforce smart_workforce > backup.sql

# Sauvegarder MySQL
docker-compose exec mysql mysqldump -u smartworkforce -p smart_workforce > backup_mysql.sql
```

## 📖 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Guide de démarrage rapide
- **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** - Documentation Docker complète
- **[README_DOCKER.md](README_DOCKER.md)** - Infrastructure et architecture
- **[HOSTINGER_SETUP.md](HOSTINGER_SETUP.md)** - Configuration MySQL Hostinger
- **[backend/migrate_mysql_to_postgres.md](backend/migrate_mysql_to_postgres.md)** - Guide de migration

## 🏗️ Architecture

```
┌─────────────────┐
│  Nginx (80/443) │  → Reverse Proxy & Static Files
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Node.js (3000)  │  → Backend API
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ PostgreSQL (5432) ou MySQL (3306)│  → Base de données
└─────────────────────────────────┘
```

**Flexibilité de la Base de Données** :
- ✅ PostgreSQL 15 (Docker - recommandé pour dev/test)
- ✅ MySQL 8.0 (Hostinger - production)
- ✅ Mode JSON (fallback sans base de données)

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Backend**: Node.js
- **Base de données**: PostgreSQL 15 / MySQL 8.0 (flexible)
- **Serveur web**: Nginx
- **Containerisation**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## 📂 Structure du Projet

```
smart-workforce-ai/
├── frontend/              # Application frontend
│   ├── home.html         # Page d'accueil
│   ├── login.html        # Authentification
│   ├── dashboard.html    # Tableau de bord RH
│   └── ...
├── backend/              # Backend Node.js
│   ├── server.js        # Serveur principal
│   ├── database.js      # Gestion DB universelle (MySQL/PostgreSQL)
│   ├── database.sql     # Schéma PostgreSQL
│   ├── hostinger_database.sql  # Schéma MySQL pour Hostinger
│   ├── test_connection.js      # Test connexion MySQL
│   ├── .env.hostinger   # Config Hostinger MySQL
│   └── package.json     # Dépendances (mysql2 + pg)
├── docker-compose.yml   # Configuration Docker PostgreSQL
├── docker-compose.mysql.yml  # Configuration Docker MySQL
├── Dockerfile          # Image production
├── nginx.conf         # Configuration Nginx
└── README.md         # Ce fichier
```

## 🔒 Sécurité

- Authentification biométrique multi-facteurs
- Tokens JWT pour les sessions
- Hashage des mots de passe
- Protection CSRF
- Headers de sécurité Nginx
- Logs d'audit complets

## 🌍 Déploiement

### Développement Local

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production

```bash
docker-compose up -d
```

### Cloud (AWS/Azure/GCP)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📝 License

Ce projet est sous licence MIT.

## 🆘 Support

Pour toute question ou problème :
- 📖 Documentation Docker: [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
- 🌐 Configuration Hostinger: [HOSTINGER_SETUP.md](HOSTINGER_SETUP.md)
- 📚 Guide rapide: [QUICK_START.md](QUICK_START.md)
- 🐛 Problèmes: [GitHub Issues](https://github.com/onguiba/smart-workfore-gestion-des-employ-s/issues)

---

**Smart Workforce AI v1.0.0** | Système de Gestion RH Intelligent
