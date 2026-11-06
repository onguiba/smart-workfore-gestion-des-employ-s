# 🐳 Guide de Déploiement Docker - Smart Workforce AI

Ce guide vous explique comment déployer l'application Smart Workforce AI avec Docker et Docker Compose.

## 📋 Prérequis

- Docker Desktop installé (Windows/Mac) ou Docker Engine (Linux)
- Docker Compose v2.0+
- Ports disponibles : 3000 (app), 3306 (MySQL), 80/443 (Nginx optionnel)

## 🚀 Démarrage Rapide

### Option 1 : Production (avec Nginx)

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps

# Accéder à l'application
# Frontend: http://localhost
# API: http://localhost/api
# App directe: http://localhost:3000
```

### Option 2 : Production (sans Nginx)

```bash
# Démarrer uniquement app + MySQL
docker-compose up -d app mysql

# Accéder à l'application
# http://localhost:3000
```

### Option 3 : Développement (avec hot-reload)

```bash
# Utiliser le fichier de configuration dev
docker-compose -f docker-compose.dev.yml up -d

# Les modifications de code seront automatiquement détectées
# http://localhost:3000
```

## 📦 Structure des Services

### Service `mysql`
- **Image**: mysql:8.0
- **Port**: 3306
- **Database**: smart_workforce
- **User**: smartworkforce
- **Password**: smartworkforce2026
- **Volume**: Données persistées dans `mysql_data`
- **Init SQL**: Le schéma est chargé automatiquement depuis `backend/database.sql`

### Service `app` (Node.js)
- **Port**: 3000
- **Framework**: Node.js 18
- **Backend**: `backend/server.js`
- **Frontend**: Servi depuis `/frontend`
- **Dépendances**: mysql2, dotenv, pg

### Service `nginx` (optionnel)
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Role**: Reverse proxy et serveur de fichiers statiques
- **Config**: `nginx.conf`

## 🔧 Commandes Utiles

### Gestion des conteneurs

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker-compose down -v

# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f app
docker-compose logs -f mysql

# Reconstruire les images
docker-compose build

# Redémarrer un service
docker-compose restart app
```

### Accès aux conteneurs

```bash
# Ouvrir un shell dans le conteneur app
docker-compose exec app sh

# Ouvrir MySQL CLI
docker-compose exec mysql mysql -u smartworkforce -p
# Password: smartworkforce2026

# Vérifier l'état des services
docker-compose ps
```

### Base de données

```bash
# Exporter la base de données
docker-compose exec mysql mysqldump -u smartworkforce -psmartworkforce2026 smart_workforce > backup.sql

# Importer une sauvegarde
docker-compose exec -T mysql mysql -u smartworkforce -psmartworkforce2026 smart_workforce < backup.sql

# Réinitialiser la base de données
docker-compose down -v
docker-compose up -d
```

## 🌍 Variables d'Environnement

Vous pouvez personnaliser la configuration dans `docker-compose.yml` ou créer un fichier `.env` :

```env
# Application
PORT=3000
NODE_ENV=production

# Base de données
DB_DRIVER=mysql
DB_HOST=mysql
DB_PORT=3306
DB_NAME=smart_workforce
DB_USER=smartworkforce
DB_PASSWORD=smartworkforce2026

# Sécurité
JWT_SECRET=votre_secret_jwt_personnalisé
```

## 🚢 Déploiement en Production

### Sur un serveur VPS/Cloud

1. **Cloner le projet sur le serveur**
```bash
git clone <votre-repo>
cd smart-workforce-ai
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env
nano .env  # Éditer avec vos valeurs de production
```

3. **Démarrer les services**
```bash
docker-compose up -d
```

4. **Configurer un nom de domaine (optionnel)**

Éditez `nginx.conf` et changez :
```nginx
server_name votre-domaine.com;
```

5. **HTTPS avec Let's Encrypt (recommandé)**
```bash
# Installer certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtenir un certificat SSL
sudo certbot --nginx -d votre-domaine.com
```

### Sur Hostinger ou hébergeur partagé

Si votre hébergeur ne supporte pas Docker :
1. Utilisez le fichier ZIP pour déploiement PHP traditionnel
2. Ou déployez Docker sur un VPS séparé

### Sur AWS/Azure/GCP

1. **AWS ECS (Elastic Container Service)**
```bash
# Pousser l'image vers ECR
docker build -t smart-workforce .
docker tag smart-workforce:latest <account>.dkr.ecr.region.amazonaws.com/smart-workforce
docker push <account>.dkr.ecr.region.amazonaws.com/smart-workforce
```

2. **Azure Container Instances**
```bash
az container create --resource-group myResourceGroup \
  --name smart-workforce \
  --image <votre-image> \
  --dns-name-label smart-workforce \
  --ports 80 3000
```

3. **Google Cloud Run**
```bash
gcloud run deploy smart-workforce \
  --image gcr.io/project-id/smart-workforce \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

## 🔒 Sécurité

### Bonnes pratiques

1. **Changer les mots de passe par défaut**
   - Modifier `MYSQL_ROOT_PASSWORD`
   - Modifier `MYSQL_PASSWORD`
   - Changer `JWT_SECRET`

2. **Utiliser des secrets Docker**
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

3. **Limiter les ports exposés**
   - En production, n'exposez que le port 80/443
   - MySQL ne devrait pas être exposé publiquement

4. **Mettre à jour régulièrement**
```bash
docker-compose pull
docker-compose up -d
```

## 🐛 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
docker-compose logs app

# Vérifier que MySQL est prêt
docker-compose logs mysql | grep "ready for connections"

# Redémarrer proprement
docker-compose down
docker-compose up -d
```

### Erreur de connexion à la base de données

```bash
# Vérifier que MySQL est accessible
docker-compose exec app ping mysql

# Tester la connexion MySQL
docker-compose exec mysql mysql -u smartworkforce -psmartworkforce2026 -e "SELECT 1"
```

### Problème de permissions

```bash
# Donner les permissions au dossier data
chmod -R 755 backend/data

# Sur Windows avec WSL2
# Vérifier que Docker Desktop a accès au lecteur
```

### Port déjà utilisé

```bash
# Trouver quel processus utilise le port
# Windows
netstat -ano | findstr :3000
# Linux/Mac
lsof -i :3000

# Changer le port dans docker-compose.yml
ports:
  - "8080:3000"  # Utilise 8080 au lieu de 3000
```

## 📊 Monitoring

### Vérifier la santé des services

```bash
# Statut détaillé
docker-compose ps

# Utilisation des ressources
docker stats

# Logs en temps réel
docker-compose logs -f --tail=50
```

### Logs structurés

Les logs sont disponibles :
- **Application**: `docker-compose logs app`
- **MySQL**: `docker-compose logs mysql`
- **Nginx**: `docker-compose logs nginx`

## 🔄 Mises à jour

```bash
# 1. Sauvegarder la base de données
docker-compose exec mysql mysqldump -u smartworkforce -psmartworkforce2026 smart_workforce > backup_$(date +%Y%m%d).sql

# 2. Arrêter les services
docker-compose down

# 3. Mettre à jour le code
git pull

# 4. Reconstruire et redémarrer
docker-compose build
docker-compose up -d

# 5. Vérifier que tout fonctionne
docker-compose ps
```

## 📞 Support

Pour toute question ou problème :
- Consultez les logs : `docker-compose logs`
- Vérifiez la documentation Docker : https://docs.docker.com
- Contactez le support technique

---

**Smart Workforce AI** - Système de Gestion Intelligente des Employés
Version: 1.0.0 | Docker Ready 🐳
