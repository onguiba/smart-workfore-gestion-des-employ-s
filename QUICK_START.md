# 🚀 Quick Start - Smart Workforce AI

Guide de démarrage rapide pour déployer l'application en quelques minutes.

## ⚡ Démarrage Ultra-Rapide

### Sur Windows

```batch
# 1. Cloner le projet (si pas encore fait)
git clone <votre-repo>
cd smart-workforce-ai

# 2. Démarrer l'application
deploy.bat production

# 3. Accéder à l'application
# http://localhost
```

### Sur Linux/Mac

```bash
# 1. Cloner le projet (si pas encore fait)
git clone <votre-repo>
cd smart-workforce-ai

# 2. Rendre le script exécutable
chmod +x deploy.sh

# 3. Démarrer l'application
./deploy.sh production

# 4. Accéder à l'application
# http://localhost
```

### Avec Make (recommandé)

```bash
# Installation complète en une commande
make install

# Ou démarrage simple
make up

# Voir toutes les commandes
make help
```

## 📋 Prérequis

- **Docker Desktop** (Windows/Mac) ou **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- **Ports disponibles**: 3000, 3306, 80

### Installer Docker

#### Windows
1. Télécharger [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Installer et redémarrer
3. Vérifier : `docker --version`

#### Mac
```bash
brew install --cask docker
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## 🎯 Commandes Essentielles

### Démarrage
```bash
# Production (avec Nginx)
docker-compose up -d

# OU avec le script
./deploy.sh production          # Linux/Mac
deploy.bat production           # Windows

# OU avec Make
make up
```

### Arrêt
```bash
docker-compose down
# OU
./deploy.sh stop
# OU
make down
```

### Voir les logs
```bash
docker-compose logs -f
# OU
./deploy.sh logs
# OU
make logs
```

### Vérifier l'état
```bash
docker-compose ps
# OU
./deploy.sh status
# OU
make status
```

## 🔧 Modes de Déploiement

### Mode Production (Recommandé)
- **Services**: App + MySQL + Nginx
- **Ports**: 80 (Nginx), 3000 (App), 3306 (MySQL)
- **Optimisé**: Images légères, volumes persistants
- **URL**: http://localhost

```bash
docker-compose up -d
# OU
make up
```

### Mode Développement
- **Hot-reload**: Les modifications de code sont appliquées automatiquement
- **Logs détaillés**: Debugging facilité
- **Port**: 3000 uniquement
- **URL**: http://localhost:3000

```bash
docker-compose -f docker-compose.dev.yml up -d
# OU
./deploy.sh dev
# OU
make dev
```

### Mode Sans Nginx
- **Accès direct**: à l'application Node.js
- **Port**: 3000 uniquement
- **Idéal**: pour les tests rapides

```bash
docker-compose up -d app mysql
```

## 🗄️ Gestion de la Base de Données

### Sauvegarde automatique
```bash
# Créer une sauvegarde
docker-compose exec mysql mysqldump -u smartworkforce -psmartworkforce2026 smart_workforce > backup.sql

# OU avec script
./deploy.sh backup

# OU avec Make
make db-backup
```

### Restauration
```bash
# Restaurer une sauvegarde
docker-compose exec -T mysql mysql -u smartworkforce -psmartworkforce2026 smart_workforce < backup.sql

# OU avec Make
make db-restore FILE=backup.sql
```

### Accéder à MySQL
```bash
# Shell MySQL
docker-compose exec mysql mysql -u smartworkforce -psmartworkforce2026 smart_workforce

# OU avec Make
make db-shell
```

## 🔐 Configuration Sécurisée

### 1. Créer le fichier .env
```bash
cp .env.example .env
```

### 2. Modifier les mots de passe
```env
# .env
DB_PASSWORD=votre_mot_de_passe_fort
MYSQL_ROOT_PASSWORD=votre_root_password_fort
JWT_SECRET=votre_secret_jwt_minimum_32_caracteres
```

### 3. Redémarrer
```bash
docker-compose down
docker-compose up -d
```

## 📱 Accès à l'Application

### URLs principales
- **Frontend**: http://localhost (avec Nginx) ou http://localhost:3000 (direct)
- **API**: http://localhost/api ou http://localhost:3000/api
- **Connexion**: Page de login avec reconnaissance faciale

### Comptes par défaut
Consultez `backend/database.sql` pour les comptes de test.

## 🐛 Dépannage Rapide

### L'application ne démarre pas
```bash
# Voir les logs détaillés
docker-compose logs

# Vérifier MySQL
docker-compose logs mysql | grep "ready for connections"

# Redémarrer proprement
docker-compose down
docker-compose up -d
```

### Port déjà utilisé
```bash
# Windows
netstat -ano | findstr :3000
# Linux/Mac
lsof -i :3000

# Solution : Changer le port dans docker-compose.yml
ports:
  - "8080:3000"
```

### Erreur de connexion MySQL
```bash
# Attendre que MySQL soit prêt (30-60 secondes au premier démarrage)
docker-compose logs mysql

# Vérifier la connexion
docker-compose exec app ping mysql
```

### Reset complet
```bash
# ⚠️ ATTENTION: Supprime toutes les données
docker-compose down -v
docker-compose up -d
```

## 📊 Monitoring

### Voir l'utilisation des ressources
```bash
docker stats

# OU avec Make
make stats
```

### Logs en temps réel
```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f app
docker-compose logs -f mysql

# Avec Make
make logs
make logs-app
make logs-mysql
```

## 🚀 Déploiement en Production

### VPS/Cloud (AWS, DigitalOcean, etc.)

1. **Connexion SSH**
```bash
ssh user@votre-serveur.com
```

2. **Installation Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

3. **Cloner et déployer**
```bash
git clone <votre-repo>
cd smart-workforce-ai
cp .env.example .env
nano .env  # Modifier les mots de passe
docker-compose up -d
```

4. **Configurer le domaine** (optionnel)
```bash
# Dans nginx.conf
server_name votre-domaine.com;

# SSL avec Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

## 📚 Documentation Complète

- **Guide Docker détaillé**: [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
- **Architecture**: [ANALYSE_ARCHITECTURE_COMPLETE.md](ANALYSE_ARCHITECTURE_COMPLETE.md)
- **Déploiement Hostinger**: [README_DEPLOIEMENT.txt](README_DEPLOIEMENT.txt)

## 💡 Astuces

### Développement avec hot-reload
```bash
make dev
# Les modifications dans frontend/ et backend/ sont appliquées automatiquement
```

### Sauvegarde automatique avant mise à jour
```bash
make deploy  # Fait automatiquement une sauvegarde puis met à jour
```

### Nettoyage des ressources
```bash
make clean        # Nettoie les conteneurs arrêtés
make clean-all    # ⚠️ Supprime TOUT (volumes inclus)
```

## 🆘 Support

En cas de problème :

1. Vérifier les logs : `docker-compose logs -f`
2. Consulter [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
3. Redémarrer : `docker-compose restart`
4. Reset : `docker-compose down && docker-compose up -d`

---

**Smart Workforce AI** - Démarrage rapide en 2 minutes ! ⚡
