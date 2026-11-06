#!/bin/bash

# Script de déploiement automatique - Smart Workforce AI
# Usage: ./deploy.sh [production|development|stop]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé. Veuillez l'installer depuis https://docker.com"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé."
        exit 1
    fi
    
    log_success "Docker et Docker Compose sont installés"
}

# Vérifier que les ports sont disponibles
check_ports() {
    local ports=("3000" "3306" "80")
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warning "Le port $port est déjà utilisé"
        fi
    done
}

# Déploiement en production
deploy_production() {
    log_info "🚀 Démarrage du déploiement en PRODUCTION..."
    
    # Arrêter les conteneurs existants
    log_info "Arrêt des conteneurs existants..."
    docker-compose down 2>/dev/null || true
    
    # Construire les images
    log_info "Construction des images Docker..."
    docker-compose build
    
    # Démarrer les services
    log_info "Démarrage des services..."
    docker-compose up -d
    
    # Attendre que les services soient prêts
    log_info "Attente que les services soient prêts..."
    sleep 10
    
    # Vérifier l'état
    docker-compose ps
    
    log_success "✅ Déploiement en production terminé avec succès!"
    log_info "📱 Application accessible sur:"
    log_info "   - Frontend: http://localhost"
    log_info "   - API: http://localhost/api"
    log_info "   - App directe: http://localhost:3000"
    log_info ""
    log_info "📊 Commandes utiles:"
    log_info "   - Voir les logs: docker-compose logs -f"
    log_info "   - Arrêter: docker-compose down"
    log_info "   - Redémarrer: docker-compose restart"
}

# Déploiement en développement
deploy_development() {
    log_info "🔧 Démarrage du déploiement en DÉVELOPPEMENT..."
    
    # Arrêter les conteneurs existants
    log_info "Arrêt des conteneurs existants..."
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    # Construire les images
    log_info "Construction des images Docker..."
    docker-compose -f docker-compose.dev.yml build
    
    # Démarrer les services
    log_info "Démarrage des services avec hot-reload..."
    docker-compose -f docker-compose.dev.yml up -d
    
    # Attendre que les services soient prêts
    log_info "Attente que les services soient prêts..."
    sleep 10
    
    # Vérifier l'état
    docker-compose -f docker-compose.dev.yml ps
    
    log_success "✅ Déploiement en développement terminé!"
    log_info "📱 Application accessible sur: http://localhost:3000"
    log_info "🔄 Hot-reload activé - Les modifications seront détectées automatiquement"
    log_info ""
    log_info "📊 Commandes utiles:"
    log_info "   - Voir les logs: docker-compose -f docker-compose.dev.yml logs -f"
    log_info "   - Arrêter: docker-compose -f docker-compose.dev.yml down"
}

# Arrêter tous les services
stop_services() {
    log_info "⏹️  Arrêt de tous les services..."
    
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    log_success "✅ Tous les services ont été arrêtés"
}

# Sauvegarder la base de données
backup_database() {
    log_info "💾 Sauvegarde de la base de données..."
    
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    docker-compose exec -T mysql mysqldump -u smartworkforce -psmartworkforce2026 smart_workforce > "$backup_file"
    
    log_success "✅ Base de données sauvegardée dans: $backup_file"
}

# Afficher l'aide
show_help() {
    echo "Smart Workforce AI - Script de Déploiement"
    echo ""
    echo "Usage: ./deploy.sh [COMMAND]"
    echo ""
    echo "Commandes disponibles:"
    echo "  production    Déployer en mode production (avec Nginx)"
    echo "  dev           Déployer en mode développement (avec hot-reload)"
    echo "  stop          Arrêter tous les services"
    echo "  backup        Sauvegarder la base de données"
    echo "  logs          Afficher les logs"
    echo "  status        Vérifier l'état des services"
    echo "  help          Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  ./deploy.sh production"
    echo "  ./deploy.sh dev"
    echo "  ./deploy.sh stop"
}

# Afficher les logs
show_logs() {
    log_info "📋 Affichage des logs..."
    docker-compose logs -f --tail=100
}

# Vérifier le statut
check_status() {
    log_info "🔍 Statut des services:"
    echo ""
    docker-compose ps
    echo ""
    log_info "📊 Utilisation des ressources:"
    docker stats --no-stream
}

# Main
main() {
    echo ""
    echo "╔════════════════════════════════════════════╗"
    echo "║   Smart Workforce AI - Deploy Script      ║"
    echo "║   Système de Gestion Intelligente         ║"
    echo "╚════════════════════════════════════════════╝"
    echo ""
    
    check_docker
    
    case "${1:-help}" in
        production|prod)
            check_ports
            deploy_production
            ;;
        development|dev)
            check_ports
            deploy_development
            ;;
        stop)
            stop_services
            ;;
        backup)
            backup_database
            ;;
        logs)
            show_logs
            ;;
        status)
            check_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Commande invalide: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
