# 🚀 Smart Workforce AI - Système de Gestion Intelligente des Employés

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
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
git clone https://github.com/votre-username/smart-workforce-ai.git
cd smart-workforce-ai

# 2. Créer le fichier de configuration
cp .env.example .env

# 3. Modifier .env avec vos mots de passe
# Changez: DB_PASSWORD, MYSQL_ROOT_PASSWORD, JWT_SECRET

# 4. Démarrer l'application
docker-compose up -d

# 5. Accéder à l'application
# http://localhost
```

### Commandes Utiles

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f

# Sauvegarder la base de données
docker-compose exec mysql mysqldump -u smartworkforce -p smart_workforce > backup.sql
```

## 📖 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Guide de démarrage rapide
- **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** - Documentation Docker complète
- **[README_DOCKER.md](README_DOCKER.md)** - Infrastructure et architecture

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
┌─────────────────┐
│  MySQL (3306)   │  → Base de données
└─────────────────┘
```

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Backend**: Node.js
- **Base de données**: MySQL 8.0
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
│   ├── database.js      # Gestion DB
│   └── database.sql     # Schéma MySQL
├── docker-compose.yml   # Configuration Docker
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
- 📖 Documentation: [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
- 📚 Guide rapide: [QUICK_START.md](QUICK_START.md)

---

**Smart Workforce AI v1.0.0** | Système de Gestion RH Intelligent
