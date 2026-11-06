# 🐳 Smart Workforce AI - Infrastructure Docker Complète

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Latest-009639?logo=nginx&logoColor=white)](https://nginx.org/)

> Infrastructure Docker complète, prête pour le développement et la production, avec déploiement automatisé.

---

## 🚀 Démarrage Rapide (2 minutes)

### Windows
```batch
deploy.bat production
```

### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh production
```

### Avec Make (recommandé)
```bash
make install
```

**Accès:** http://localhost

---

## 📦 Ce qui a été créé

### ✅ Fichiers Docker (7)
- `Dockerfile` - Image production optimisée
- `Dockerfile.dev` - Image développement avec hot-reload
- `docker-compose.yml` - Configuration production avec Nginx
- `docker-compose.dev.yml` - Configuration développement
- `docker-compose.prod.yml` - Configuration cloud avancée
- `nginx.conf` - Configuration Nginx complète
- `.dockerignore` - Exclusions build Docker

### ✅ Scripts de Déploiement (3)
- `deploy.sh` - Script Bash automatisé (Linux/Mac)
- `deploy.bat` - Script Batch automatisé (Windows)
- `Makefile` - Commandes Make simplifiées

### ✅ Configuration (1)
- `.env.example` - Template variables d'environnement

### ✅ Documentation (4)
- `DOCKER_GUIDE.md` - Guide complet (50+ pages)
- `QUICK_START.md` - Démarrage ultra-rapide
- `DOCKER_FILES_SUMMARY.md` - Résumé détaillé
- `README_DOCKER.md` - Ce fichier

### ✅ CI/CD (1)
- `.github/workflows/docker-deploy.yml` - GitHub Actions pipeline

---

## 🎯 Modes de Déploiement

### 1️⃣ Production (avec Nginx)
**Idéal pour:** Production, VPS, serveurs cloud

```bash
# Avec Make
make up

# Avec script
./deploy.sh production    # Linux/Mac
deploy.bat production     # Windows

# Direct Docker Compose
docker-compose up -d
```

**Services:**
- ✅ Application Node.js (port 3000)
- ✅ MySQL 8.0 (port 3306)
- ✅ Nginx reverse proxy (ports 80/443)

**URLs:**
- Frontend: http://localhost
- API: http://localhost/api
- App directe: http://localhost:3000

---

### 2️⃣ Développement (hot-reload)
**Idéal pour:** Développement local, debugging

```bash
# Avec Make
make dev

# Avec script
./deploy.sh dev

# Direct Docker Compose
docker-compose -f docker-compose.dev.yml up -d
```

**Avantages:**
- 🔄 Hot-reload activé (nodemon)
- 📝 Modifications de code instantanées
- 🐛 Logs détaillés pour debugging
- 🚫 Pas de Nginx (accès direct)

**URL:** http://localhost:3000

---

### 3️⃣ Production Cloud (AWS/Azure/GCP)
**Idéal pour:** Déploiement cloud, scalabilité

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Fonctionnalités:**
- 📊 Limites de ressources CPU/RAM
- 🔄 Support auto-scaling
- 💾 Redis pour cache/sessions
- 🔒 Security headers
- 📝 Logs structurés JSON

---

## 📋 Prérequis

### Installer Docker

#### Windows / Mac
1. Télécharger [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Installer et redémarrer
3. Vérifier: `docker --version`

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

#### Vérification
```bash
docker --version
docker-compose --version
```

**Versions requises:**
- Docker: 20.10+
- Docker Compose: 2.0+

---

## ⚙️ Configuration

### 1. Créer le fichier .env
```bash
cp .env.example .env
```

### 2. Modifier les variables ⚠️ IMPORTANT
```env
# Base de données
DB_PASSWORD=votre_mot_de_passe_fort_ici
MYSQL_ROOT_PASSWORD=votre_root_password_fort

# Sécurité
JWT_SECRET=votre_secret_jwt_minimum_32_caracteres_aleatoires

# Application
PORT=3000
NODE_ENV=production
```

### 3. Démarrer
```bash
make up
```

---

## 🛠️ Commandes Essentielles

### Avec Make (recommandé)

```bash
make help           # Afficher toutes les commandes
make install        # Installation complète
make up             # Démarrer (production)
make down           # Arrêter
make restart        # Redémarrer
make dev            # Mode développement
make logs           # Voir les logs
make status         # État des services
make db-backup      # Sauvegarder la DB
make db-restore     # Restaurer la DB FILE=backup.sql
make clean          # Nettoyer Docker
```

### Avec Scripts

```bash
# Linux/Mac
./deploy.sh production|dev|stop|backup|logs|status

# Windows
deploy.bat production|dev|stop|backup|logs|status
```

### Docker Compose Direct

```bash
# Production
docker-compose up -d              # Démarrer
docker-compose down               # Arrêter
docker-compose logs -f            # Logs
docker-compose ps                 # Status
docker-compose restart app        # Redémarrer app

# Développement
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🗄️ Gestion de la Base de Données

### Sauvegarde Automatique
```bash
make db-backup
# Crée: backups/backup_YYYYMMDD_HHMMSS.sql
```

### Restauration
```bash
make db-restore FILE=backup.sql
```

### Accès MySQL CLI
```bash
make db-shell
# OU
docker-compose exec mysql mysql -u smartworkforce -psmartworkforce2026 smart_workforce
```

### Reset Complet ⚠️
```bash
make db-reset
# Supprime et recrée la base de données
```

---

## 📊 Monitoring & Logs

### Voir les logs
```bash
# Tous les services
make logs

# Service spécifique
make logs-app
make logs-mysql
make logs-nginx

# Direct Docker Compose
docker-compose logs -f app
docker-compose logs -f --tail=100
```

### Utilisation des ressources
```bash
make stats
# OU
docker stats
```

### État des services
```bash
make status
# OU
docker-compose ps
```

### Health Checks
```bash
# Vérifier la santé des conteneurs
docker-compose ps

# Tester l'API
curl http://localhost:3000/api/health
curl http://localhost/api/health  # Via Nginx
```

---

## 🚢 Déploiement Production

### Sur VPS/Serveur Dédié

#### 1. Préparer le serveur
```bash
# Se connecter
ssh user@votre-serveur.com

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Déployer l'application
```bash
# Cloner le projet
git clone <votre-repo>
cd smart-workforce-ai

# Configuration
cp .env.example .env
nano .env  # Modifier les mots de passe

# Démarrer
docker-compose up -d

# Vérifier
docker-compose ps
curl http://localhost:3000/api/health
```

#### 3. Configurer Nginx & SSL (optionnel)
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Auto-renouvellement
sudo certbot renew --dry-run
```

### Sur Cloud Providers

#### AWS ECS
```bash
# Pousser l'image vers ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin account.dkr.ecr.region.amazonaws.com
docker build -t smart-workforce .
docker tag smart-workforce:latest account.dkr.ecr.region.amazonaws.com/smart-workforce:latest
docker push account.dkr.ecr.region.amazonaws.com/smart-workforce:latest
```

#### Azure Container Instances
```bash
az container create \
  --resource-group myResourceGroup \
  --name smart-workforce \
  --image myregistry.azurecr.io/smart-workforce:latest \
  --dns-name-label smart-workforce \
  --ports 80 3000
```

#### Google Cloud Run
```bash
gcloud run deploy smart-workforce \
  --image gcr.io/project-id/smart-workforce \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

---

## 🔒 Sécurité

### Checklist Production

- [ ] ✅ Changer `DB_PASSWORD` dans `.env`
- [ ] ✅ Changer `MYSQL_ROOT_PASSWORD`
- [ ] ✅ Générer un nouveau `JWT_SECRET` (32+ caractères)
- [ ] ✅ Ne pas exposer MySQL (3306) publiquement
- [ ] ✅ Configurer HTTPS avec Let's Encrypt
- [ ] ✅ Activer les logs structurés
- [ ] ✅ Configurer les sauvegardes automatiques
- [ ] ✅ Limiter les ressources CPU/RAM
- [ ] ✅ Configurer un monitoring externe
- [ ] ✅ Mettre à jour régulièrement les images

### Générer des secrets sécurisés

```bash
# JWT Secret (32 caractères minimum)
openssl rand -hex 32

# Mot de passe MySQL
openssl rand -base64 24
```

### Sauvegardes Automatiques

```bash
# Créer un cron job pour sauvegardes quotidiennes
crontab -e

# Ajouter (sauvegarde tous les jours à 2h du matin)
0 2 * * * cd /opt/smart-workforce && make db-backup
```

---

## 🐛 Dépannage

### L'application ne démarre pas

```bash
# 1. Voir les logs
docker-compose logs

# 2. Vérifier MySQL
docker-compose logs mysql | grep "ready for connections"

# 3. Vérifier les ports
netstat -tuln | grep 3000
lsof -i :3000

# 4. Redémarrer proprement
docker-compose down
docker-compose up -d
```

### Erreur de connexion MySQL

```bash
# Attendre que MySQL soit prêt (30-60s au premier démarrage)
docker-compose logs mysql

# Vérifier la connexion depuis l'app
docker-compose exec app ping mysql

# Tester la connexion MySQL
docker-compose exec mysql mysql -u smartworkforce -psmartworkforce2026 -e "SELECT 1"
```

### Port déjà utilisé

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Ou changer le port dans docker-compose.yml
ports:
  - "8080:3000"
```

### Problème de permissions

```bash
# Linux
sudo chown -R $USER:$USER .
chmod -R 755 backend/data

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
newgrp docker
```

### Reset complet ⚠️

```bash
# ATTENTION: Supprime TOUTES les données
docker-compose down -v
docker system prune -af --volumes
docker-compose up -d
```

---

## 🔄 Mises à Jour

### Mise à jour standard

```bash
# 1. Sauvegarder
make db-backup

# 2. Arrêter
make down

# 3. Mettre à jour le code
git pull

# 4. Reconstruire et redémarrer
make up

# 5. Vérifier
make status
```

### Avec le Makefile (recommandé)

```bash
make deploy
# Fait automatiquement : backup + pull + build + restart
```

### Zero-downtime Update

```bash
# Utiliser le mode rolling update
docker-compose up -d --no-deps --build app
```

---

## 🤖 CI/CD avec GitHub Actions

Le pipeline CI/CD est configuré dans `.github/workflows/docker-deploy.yml`.

### Fonctionnalités

- ✅ Build automatique à chaque push
- ✅ Tests de sécurité (Trivy)
- ✅ Push vers Docker Hub
- ✅ Déploiement staging automatique
- ✅ Déploiement production manuel
- ✅ Notifications Slack

### Configuration requise

**Secrets GitHub à configurer:**
```
DOCKER_USERNAME          # Docker Hub username
DOCKER_PASSWORD          # Docker Hub password
STAGING_HOST            # IP serveur staging
STAGING_USER            # User SSH staging
PROD_HOST               # IP serveur production
PROD_USER               # User SSH production
SSH_PRIVATE_KEY         # Clé SSH privée
DB_PASSWORD             # Mot de passe MySQL
SLACK_WEBHOOK           # Webhook Slack (optionnel)
```

### Workflow

1. **Push sur `main`** → Build + Deploy staging
2. **Push sur `production`** → Build + Deploy production
3. **Pull Request** → Build + Tests seulement

---

## 📚 Documentation Complète

- **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** - Guide détaillé (50+ pages)
- **[QUICK_START.md](QUICK_START.md)** - Démarrage rapide (5 min)
- **[DOCKER_FILES_SUMMARY.md](DOCKER_FILES_SUMMARY.md)** - Résumé des fichiers
- **[README_DOCKER.md](README_DOCKER.md)** - Ce fichier

---

## 💡 Astuces & Best Practices

### Développement
```bash
# Hot-reload actif
make dev

# Logs en temps réel
make logs

# Restart rapide d'un service
docker-compose restart app
```

### Production
```bash
# Sauvegardes avant toute opération
make db-backup

# Monitoring continu
watch -n 5 'docker-compose ps'

# Nettoyage régulier
make clean
```

### Performance
```bash
# Limiter les ressources
docker update --cpus="1" --memory="512m" smart-workforce-app

# Voir l'utilisation
docker stats
```

---

## 📊 Architecture Docker

```
┌─────────────────────────────────────────────────┐
│                   Nginx (80/443)                │
│          Reverse Proxy & Static Files           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│            Node.js App (3000)                   │
│         Backend API + Frontend Serve            │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│              MySQL 8.0 (3306)                   │
│          Database with Persistence              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              Redis (6379)                       │
│         Cache & Session Store (optionnel)       │
└─────────────────────────────────────────────────┘
```

---

## 🎉 Fonctionnalités Complètes

✅ **Docker prêt pour:**
- Développement local avec hot-reload
- Production VPS/serveur dédié
- Production cloud (AWS, Azure, GCP)
- CI/CD avec GitHub Actions
- Monitoring et logs structurés
- Sauvegardes automatiques
- Auto-scaling (avec orchestrateurs)

✅ **Scripts automatisés:**
- Déploiement en une commande
- Gestion de la base de données
- Monitoring intégré
- Dépannage simplifié

✅ **Documentation complète:**
- Guides détaillés
- Exemples pratiques
- Troubleshooting
- Best practices

---

## 🆘 Support

### Problème persistant ?

1. **Consulter les logs:** `make logs`
2. **Lire le guide:** [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
3. **Vérifier l'état:** `make status`
4. **Reset si nécessaire:** `make down && make up`

### Ressources utiles

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## 📜 Licence

MIT License - Smart Workforce AI

---

**🚀 Smart Workforce AI est maintenant prêt pour le déploiement Docker !**

Infrastructure complète • Production ready • CI/CD intégré • Documentation détaillée

Version 1.0.0 | Dernière mise à jour: Novembre 2026
