#!/bin/bash
# ============================================================
# TSA SmartWorkforce AI™ — Script de Déploiement Docker
# Hostinger VPS Ubuntu 22.04
# Usage : chmod +x deploy.sh && ./deploy.sh
# ============================================================

set -euo pipefail

# ─── Couleurs ────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

TSA_BANNER="${BLUE}${BOLD}
╔══════════════════════════════════════════════════════════════╗
║          TSA — Transport & Services d'Afrique                ║
║     SmartWorkforce AI™ — Déploiement Docker Hostinger        ║
╚══════════════════════════════════════════════════════════════╝${RESET}
"

echo -e "$TSA_BANNER"

# ─── Configuration ────────────────────────────────────────────
APP_DIR="/opt/tsa-smartworkforce"
DOMAIN="${DOMAIN:-votre-domaine.com}"
EMAIL="${CERTBOT_EMAIL:-admin@votre-domaine.com}"

# ─── Fonctions ────────────────────────────────────────────────
log()     { echo -e "${GREEN}✅ $1${RESET}"; }
info()    { echo -e "${CYAN}ℹ️  $1${RESET}"; }
warn()    { echo -e "${YELLOW}⚠️  $1${RESET}"; }
error()   { echo -e "${RED}❌ $1${RESET}"; exit 1; }
section() { echo -e "\n${BOLD}${BLUE}── $1 ──${RESET}"; }

# ─── Vérification Root ────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
    error "Ce script doit être exécuté en tant que root : sudo ./deploy.sh"
fi

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 1 : Mise à jour du système
# ═══════════════════════════════════════════════════════════════
section "Étape 1/8 — Mise à jour du système Ubuntu"
apt-get update -qq && apt-get upgrade -y -qq
log "Système mis à jour"

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 2 : Installation de Docker
# ═══════════════════════════════════════════════════════════════
section "Étape 2/8 — Installation de Docker & Docker Compose"

if ! command -v docker &>/dev/null; then
    info "Installation de Docker Engine..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    log "Docker installé : $(docker --version)"
else
    log "Docker déjà installé : $(docker --version)"
fi

if ! command -v docker-compose &>/dev/null && ! docker compose version &>/dev/null 2>&1; then
    info "Installation de Docker Compose Plugin..."
    apt-get install -y docker-compose-plugin
fi
log "Docker Compose : $(docker compose version --short 2>/dev/null || docker-compose --version)"

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 3 : Dossier de l'application
# ═══════════════════════════════════════════════════════════════
section "Étape 3/8 — Préparation du répertoire d'application"

mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/nginx/ssl"
mkdir -p "$APP_DIR/nginx/certbot/www"
mkdir -p "$APP_DIR/nginx/conf.d"
mkdir -p "$APP_DIR/data"

# Copier les fichiers du projet vers /opt/tsa-smartworkforce
# (Si vous êtes déjà dans le bon dossier, utilisez cp -r . "$APP_DIR/")
if [ -f "docker-compose.yml" ]; then
    cp -r . "$APP_DIR/"
    log "Fichiers du projet copiés vers $APP_DIR"
else
    warn "Lancez ce script depuis le dossier racine du projet TSA"
fi

cd "$APP_DIR"

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 4 : Fichier .env
# ═══════════════════════════════════════════════════════════════
section "Étape 4/8 — Configuration du fichier .env"

if [ ! -f ".env" ]; then
    if [ -f ".env.docker" ]; then
        cp .env.docker .env
        warn "Fichier .env créé depuis .env.docker"
        warn "IMPORTANT : Editez .env et changez les mots de passe !"
        warn "  nano .env"
    else
        error ".env.docker introuvable — impossible de créer .env"
    fi
else
    log "Fichier .env déjà présent"
fi

# Charger les variables d'environnement
source .env 2>/dev/null || true
DOMAIN="${DOMAIN:-votre-domaine.com}"

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 5 : Firewall
# ═══════════════════════════════════════════════════════════════
section "Étape 5/8 — Configuration du Firewall (UFW)"

if command -v ufw &>/dev/null; then
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    log "Firewall configuré : ports 22, 80, 443 ouverts"
fi

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 6 : Build & Lancement des conteneurs
# ═══════════════════════════════════════════════════════════════
section "Étape 6/8 — Build et démarrage des conteneurs Docker"

# Build de l'image de l'application
info "Construction de l'image Docker TSA SmartWorkforce..."
docker compose build --no-cache app

# Démarrage sans Nginx d'abord (pour Certbot HTTP challenge)
info "Démarrage de l'application (HTTP seulement pour le moment)..."
docker compose up -d db app

# Attendre que la base de données soit prête
info "Attente initialisation MySQL (30s)..."
sleep 30

# Vérification santé de l'app
MAX_WAIT=60
ELAPSED=0
until docker compose exec app wget -qO- http://localhost:3000/api/employees > /dev/null 2>&1; do
    sleep 3
    ELAPSED=$((ELAPSED+3))
    if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
        warn "L'application met du temps à démarrer — vérifiez les logs :"
        warn "  docker compose logs app"
        break
    fi
    echo -n "."
done
log "Application TSA SmartWorkforce opérationnelle !"

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 7 : SSL Let's Encrypt (Certbot)
# ═══════════════════════════════════════════════════════════════
section "Étape 7/8 — Certificat SSL Let's Encrypt"

if command -v certbot &>/dev/null; then
    info "Certbot déjà installé"
elif apt-get install -y certbot; then
    log "Certbot installé"
fi

if [ "$DOMAIN" != "votre-domaine.com" ] && [ ! -f "$APP_DIR/nginx/ssl/fullchain.pem" ]; then
    info "Génération du certificat SSL pour $DOMAIN..."

    # Nginx temporaire pour le challenge ACME
    docker run --rm -d --name nginx_tmp \
        -p 80:80 \
        -v "$APP_DIR/nginx/certbot/www:/var/www/certbot" \
        nginx:alpine

    certbot certonly --webroot \
        -w "$APP_DIR/nginx/certbot/www" \
        -d "$DOMAIN" -d "www.$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos --no-eff-email --non-interactive || true

    docker stop nginx_tmp 2>/dev/null || true

    # Copier les certificats dans le dossier nginx/ssl
    if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$APP_DIR/nginx/ssl/"
        cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$APP_DIR/nginx/ssl/"
        log "Certificat SSL généré pour $DOMAIN"

        # Lancer Nginx maintenant que le SSL est prêt
        docker compose up -d nginx
        log "Nginx démarré avec HTTPS"
    else
        warn "Certificat SSL non généré. Nginx lancé en HTTP uniquement."
        warn "Assurez-vous que $DOMAIN pointe vers ce serveur puis relancez :"
        warn "  certbot certonly --webroot -w $APP_DIR/nginx/certbot/www -d $DOMAIN --email $EMAIL --agree-tos"
    fi
else
    warn "Domaine non configuré ou certificat déjà présent. Nginx non démarré."
    warn "Configurez votre domaine dans .env puis relancez : docker compose up -d nginx"
fi

# Auto-renouvellement SSL
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker compose -f $APP_DIR/docker-compose.yml exec nginx nginx -s reload") | sort -u | crontab -
log "Renouvellement SSL automatique configuré (cron quotidien)"

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 8 : Service systemd (démarrage automatique au reboot)
# ═══════════════════════════════════════════════════════════════
section "Étape 8/8 — Service systemd (démarrage automatique)"

cat > /etc/systemd/system/tsa-smartworkforce.service << EOF
[Unit]
Description=TSA SmartWorkforce AI — Docker Stack
Requires=docker.service
After=docker.service network.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable tsa-smartworkforce
log "Service systemd activé — démarrage automatique au reboot"

# ═══════════════════════════════════════════════════════════════
# RÉSUMÉ FINAL
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         🎉  DÉPLOIEMENT TSA DOCKER RÉUSSI !  🎉             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${RESET}"
echo -e "${CYAN}📡 Accès à votre application :${RESET}"
echo -e "   🌐 HTTP  → http://$DOMAIN"
echo -e "   🔒 HTTPS → https://$DOMAIN (si SSL configuré)"
echo -e "   🏠 Local → http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo -e "${CYAN}🐳 Commandes Docker utiles :${RESET}"
echo -e "   docker compose logs -f app     # Logs de l'application"
echo -e "   docker compose logs -f db      # Logs MySQL"
echo -e "   docker compose ps              # État des conteneurs"
echo -e "   docker compose restart app     # Redémarrer l'app"
echo -e "   docker compose down            # Arrêter tout"
echo -e "   docker compose up -d           # Relancer tout"
echo ""
echo -e "${YELLOW}⚠️  Actions requises si ce n'est pas déjà fait :${RESET}"
echo -e "   1. nano $APP_DIR/.env          # Changez les mots de passe !"
echo -e "   2. Configurez $DOMAIN → $(hostname -I | awk '{print $1}') dans votre DNS Hostinger"
echo -e "   3. docker compose up -d nginx  # Activer Nginx + HTTPS"
echo ""
