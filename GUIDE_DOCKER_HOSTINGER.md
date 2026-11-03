# 🐳 Guide Déploiement Docker — TSA SmartWorkforce AI™ sur Hostinger VPS

## Architecture des Conteneurs

```
Internet (port 443/80)
        │
        ▼
┌───────────────────────┐
│   Nginx (nginx:alpine) │  ← Reverse Proxy + SSL Let's Encrypt
│   Port 80 + 443       │    Gzip, Headers Sécurité, Rate Limiting
└──────────┬────────────┘
           │ proxy_pass http://app:3000
           ▼
┌───────────────────────┐
│  Node.js App          │  ← TSA SmartWorkforce (port 3000)
│  (node:20-alpine)     │    server.js + frontend/ statique
│  Santé: /api/employees│
└──────────┬────────────┘
           │ mysql://db:3306
           ▼
┌───────────────────────┐
│  MySQL 8.0            │  ← Base de données persistante
│  (mysql:8.0)          │    Données dans volume Docker
│  Santé: mysqladmin    │
└───────────────────────┘
```

---

## Fichiers Docker Créés

| Fichier | Rôle |
|---|---|
| [`Dockerfile`](Dockerfile) | Build multi-stage de l'image Node.js (Alpine, non-root) |
| [`docker-compose.yml`](docker-compose.yml) | Orchestration production (App + MySQL + Nginx) |
| [`docker-compose.dev.yml`](docker-compose.dev.yml) | Environnement développement local (sans Nginx) |
| [`.dockerignore`](.dockerignore) | Exclusions du contexte de build |
| [`.env.docker`](.env.docker) | Template de variables d'environnement Docker |
| [`nginx/nginx.conf`](nginx/nginx.conf) | Config Nginx principale (Gzip, Rate Limiting) |
| [`nginx/conf.d/tsa.conf`](nginx/conf.d/tsa.conf) | Virtual host HTTPS + Let's Encrypt |
| [`deploy.sh`](deploy.sh) | Script automatisé de déploiement complet |

---

## 🚀 Méthode 1 — Déploiement Automatique (Recommandé)

### Prérequis Hostinger VPS
- **Plan** : VPS 2 (2 vCPU, 8 GB RAM minimum recommandé)
- **OS** : Ubuntu 22.04 LTS
- **Accès** : SSH root

### Étapes

```bash
# 1. Connexion SSH au VPS Hostinger
ssh root@VOTRE_IP_VPS

# 2. Cloner ou transférer le projet
# Option A — depuis GitHub :
git clone https://github.com/VOTRE_REPO/tsa-smartworkforce.git
cd tsa-smartworkforce

# Option B — transférer le zip depuis votre PC :
# Sur votre PC Windows (PowerShell) :
# scp smartworkforce-hostinger.zip root@VOTRE_IP_VPS:/root/
# Sur le VPS : unzip smartworkforce-hostinger.zip && cd smart-workfore*/

# 3. Configurer votre domaine et mots de passe
cp .env.docker .env
nano .env
# → Modifiez : DB_PASSWORD, MYSQL_ROOT_PASSWORD, JWT_SECRET, DOMAIN

# 4. Lancer le script de déploiement automatique
chmod +x deploy.sh
./deploy.sh
```

Le script s'occupe de tout :
- ✅ Installation Docker & Docker Compose
- ✅ Build de l'image Node.js
- ✅ Démarrage MySQL → attente santé → démarrage App
- ✅ Génération SSL Let's Encrypt (si domaine configuré)
- ✅ Service systemd pour démarrage automatique au reboot

---

## 🔧 Méthode 2 — Déploiement Manuel Étape par Étape

### Étape 1 — Installer Docker sur le VPS Hostinger

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker
apt-get install -y docker-compose-plugin
docker --version  # Docker 24.x ou supérieur
```

### Étape 2 — Transférer et configurer le projet

```bash
# Sur votre PC Windows :
scp -r . root@VOTRE_IP:/opt/tsa-smartworkforce/

# Sur le VPS :
cd /opt/tsa-smartworkforce
cp .env.docker .env
nano .env  # ← Renseignez vos vraies valeurs
```

### Étape 3 — Build de l'image Docker

```bash
docker compose build --no-cache
# Durée estimée : 2-3 minutes (téléchargement node:20-alpine)
```

### Étape 4 — Démarrer les services (sans Nginx d'abord)

```bash
# Démarrer MySQL + Application
docker compose up -d db app

# Vérifier que tout tourne
docker compose ps
# Attendu : db = healthy, app = healthy

# Vérifier les logs
docker compose logs -f app
# Attendu : "Serveur lancé avec succès !" sur port 3000

# Tester l'API
curl http://localhost:3000/api/employees
```

### Étape 5 — SSL Let's Encrypt

> **Important** : Votre domaine doit pointer vers l'IP du VPS dans le DNS Hostinger avant cette étape.

```bash
# Installer Certbot
apt-get install -y certbot

# Générer le certificat
certbot certonly --standalone \
    -d votre-domaine.com \
    -d www.votre-domaine.com \
    --email admin@votre-domaine.com \
    --agree-tos --non-interactive

# Copier les certificats pour Nginx
mkdir -p /opt/tsa-smartworkforce/nginx/ssl
cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem /opt/tsa-smartworkforce/nginx/ssl/
cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem /opt/tsa-smartworkforce/nginx/ssl/
```

### Étape 6 — Configurer et démarrer Nginx

```bash
# Éditer le domaine dans la config Nginx
nano nginx/conf.d/tsa.conf
# → Remplacez "votre-domaine.com" par votre vrai domaine (2 occurrences)

# Démarrer Nginx
docker compose up -d nginx

# Vérifier
docker compose ps  # Tous les 3 services = running
curl https://votre-domaine.com  # Doit retourner la page d'accueil TSA
```

---

## 💻 Développement Local avec Docker

```bash
# Démarrer l'environnement de développement
docker compose -f docker-compose.dev.yml up -d

# L'app est accessible sur http://localhost:3000
# MySQL accessible sur localhost:3306 (pour DBeaver, phpMyAdmin local)

# Arrêter
docker compose -f docker-compose.dev.yml down

# Reconstruire après modification du code backend
docker compose -f docker-compose.dev.yml up -d --build app
```

---

## 🛠️ Commandes de Maintenance

```bash
# ─── Logs ───────────────────────────────────────────────────
docker compose logs -f              # Tous les services
docker compose logs -f app          # Application seulement
docker compose logs -f db           # MySQL seulement
docker compose logs -f nginx        # Nginx seulement

# ─── État & Santé ───────────────────────────────────────────
docker compose ps                   # Liste et état des conteneurs
docker stats                        # CPU / RAM en temps réel

# ─── Redémarrages ───────────────────────────────────────────
docker compose restart app          # Redémarrer l'application
docker compose restart nginx        # Recharger Nginx (après config)
docker compose down && docker compose up -d   # Tout redémarrer

# ─── Mise à jour de l'application ───────────────────────────
git pull                            # Récupérer les nouvelles versions
docker compose build --no-cache app
docker compose up -d --no-deps app  # Redémarrer l'app sans toucher db/nginx

# ─── Accès MySQL en ligne de commande ───────────────────────
docker compose exec db mysql -u tsa_admin -p smartworkforce

# ─── Sauvegarde de la base de données ───────────────────────
docker compose exec db mysqldump -u root -p smartworkforce > backup_$(date +%Y%m%d).sql

# ─── Restauration ───────────────────────────────────────────
docker compose exec -T db mysql -u root -p smartworkforce < backup_20260102.sql

# ─── Suppression complète (ATTENTION: perd les données!) ────
docker compose down -v              # Supprime aussi les volumes
docker rmi tsa-smartworkforce:latest
```

---

## 🌡️ Variables d'Environnement Docker (`.env`)

| Variable | Exemple | Description |
|---|---|---|
| `NODE_ENV` | `production` | Mode Node.js |
| `PORT` | `3000` | Port interne de l'app |
| `DB_HOST` | `db` | Nom du service MySQL (ne pas changer) |
| `DB_NAME` | `smartworkforce` | Nom de la base de données |
| `DB_USER` | `tsa_admin` | Utilisateur MySQL |
| `DB_PASSWORD` | `Votre_Mdp!` | **Changez impérativement** |
| `MYSQL_ROOT_PASSWORD` | `Root_Mdp!` | **Changez impérativement** |
| `JWT_SECRET` | `clé_64_chars` | **Changez impérativement** |
| `DOMAIN` | `tsa.example.com` | Votre domaine Hostinger |

---

## 🔐 Sécurité — Checklist Production

- [ ] Mots de passe MySQL changés dans `.env`
- [ ] `JWT_SECRET` remplacé par une clé aléatoire de 64 caractères
- [ ] SSL Let's Encrypt actif (HTTPS)
- [ ] MySQL non exposé publiquement (`127.0.0.1:3306` uniquement)
- [ ] Firewall UFW activé (ports 22, 80, 443 seulement)
- [ ] Renouvellement SSL automatique configuré (cron)
- [ ] Sauvegardes automatiques configurées

---

## ⚠️ Résolution de Problèmes

| Symptôme | Cause probable | Solution |
|---|---|---|
| `app` ne démarre pas | MySQL pas encore prêt | Attendre 30s, vérifier `docker compose logs db` |
| `502 Bad Gateway` | App en cours de démarrage | `docker compose logs app` → chercher erreur |
| `SSL_ERROR` | Certificat manquant | Régénérer Certbot, copier dans `nginx/ssl/` |
| `Access denied` MySQL | Mauvais mot de passe dans `.env` | Vérifier `DB_PASSWORD` = `MYSQL_PASSWORD` |
| Page blanche | Fichier HTML manquant | Vérifier dossier `frontend/` dans le container |

```bash
# Entrer dans le container de l'app pour déboguer
docker compose exec app sh
ls /app/frontend/    # Vérifier que les fichiers HTML sont là
ls /app/data/        # Vérifier le dossier data
```
