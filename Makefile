# Makefile pour Smart Workforce AI
# Usage: make [command]

.PHONY: help build up down restart logs status clean backup restore

# Commande par défaut
.DEFAULT_GOAL := help

# Variables
COMPOSE := docker-compose
COMPOSE_DEV := docker-compose -f docker-compose.dev.yml

help: ## Afficher l'aide
	@echo "╔════════════════════════════════════════════╗"
	@echo "║   Smart Workforce AI - Makefile           ║"
	@echo "╚════════════════════════════════════════════╝"
	@echo ""
	@echo "Commandes disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ==========================================
# PRODUCTION
# ==========================================

build: ## Construire les images Docker (production)
	@echo "🔨 Construction des images..."
	$(COMPOSE) build

up: ## Démarrer les services (production)
	@echo "🚀 Démarrage des services en production..."
	$(COMPOSE) up -d
	@echo "✅ Services démarrés!"
	@echo "📱 Application: http://localhost"
	@make status

down: ## Arrêter les services
	@echo "⏹️  Arrêt des services..."
	$(COMPOSE) down

restart: ## Redémarrer les services
	@echo "🔄 Redémarrage des services..."
	$(COMPOSE) restart

# ==========================================
# DÉVELOPPEMENT
# ==========================================

dev: ## Démarrer en mode développement (hot-reload)
	@echo "🔧 Démarrage en mode développement..."
	$(COMPOSE_DEV) up -d
	@echo "✅ Services de développement démarrés!"
	@echo "📱 Application: http://localhost:3000"
	@echo "🔄 Hot-reload activé"

dev-down: ## Arrêter le mode développement
	@echo "⏹️  Arrêt du mode développement..."
	$(COMPOSE_DEV) down

dev-logs: ## Voir les logs (développement)
	$(COMPOSE_DEV) logs -f

# ==========================================
# LOGS & MONITORING
# ==========================================

logs: ## Voir les logs (production)
	$(COMPOSE) logs -f

logs-app: ## Voir les logs de l'application
	$(COMPOSE) logs -f app

logs-mysql: ## Voir les logs MySQL
	$(COMPOSE) logs -f mysql

logs-nginx: ## Voir les logs Nginx
	$(COMPOSE) logs -f nginx

status: ## Vérifier l'état des services
	@echo "📊 État des services:"
	@$(COMPOSE) ps

stats: ## Voir l'utilisation des ressources
	@echo "📈 Utilisation des ressources:"
	@docker stats --no-stream

# ==========================================
# BASE DE DONNÉES
# ==========================================

db-backup: ## Sauvegarder la base de données PostgreSQL
	@echo "💾 Sauvegarde de la base de données..."
	@mkdir -p backups
	@docker-compose exec -T postgres pg_dump -U smartworkforce smart_workforce > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Sauvegarde terminée dans backups/"

db-restore: ## Restaurer la base de données (usage: make db-restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Veuillez spécifier un fichier: make db-restore FILE=backup.sql"; \
		exit 1; \
	fi
	@echo "📥 Restauration de la base de données depuis $(FILE)..."
	@docker-compose exec -T postgres psql -U smartworkforce smart_workforce < $(FILE)
	@echo "✅ Restauration terminée!"

db-shell: ## Ouvrir un shell PostgreSQL
	@echo "🔗 Connexion à PostgreSQL..."
	@docker-compose exec postgres psql -U smartworkforce smart_workforce

db-reset: ## Réinitialiser la base de données (⚠️ supprime toutes les données)
	@echo "⚠️  ATTENTION: Cette action va supprimer toutes les données!"
	@read -p "Êtes-vous sûr? [y/N] " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "🗑️  Réinitialisation de la base de données..."; \
		$(COMPOSE) down -v; \
		$(COMPOSE) up -d; \
		echo "✅ Base de données réinitialisée!"; \
	else \
		echo "❌ Annulé"; \
	fi

# ==========================================
# NETTOYAGE
# ==========================================

clean: ## Nettoyer les conteneurs arrêtés et images non utilisées
	@echo "🧹 Nettoyage..."
	@docker system prune -f
	@echo "✅ Nettoyage terminé!"

clean-all: ## Nettoyer tout (⚠️ supprime volumes et données)
	@echo "⚠️  ATTENTION: Cette action va supprimer tous les volumes et données!"
	@read -p "Êtes-vous sûr? [y/N] " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "🗑️  Suppression complète..."; \
		$(COMPOSE) down -v; \
		$(COMPOSE_DEV) down -v; \
		docker system prune -af --volumes; \
		echo "✅ Nettoyage complet terminé!"; \
	else \
		echo "❌ Annulé"; \
	fi

# ==========================================
# SHELL & DEBUG
# ==========================================

shell: ## Ouvrir un shell dans le conteneur app
	@echo "🔗 Connexion au conteneur app..."
	@docker-compose exec app sh

shell-mysql: ## Ouvrir un shell dans le conteneur MySQL
	@echo "🔗 Connexion au conteneur MySQL..."
	@docker-compose exec mysql bash

# ==========================================
# TESTS
# ==========================================

test: ## Exécuter les tests (si disponibles)
	@echo "🧪 Exécution des tests..."
	@docker-compose exec app npm test || echo "Aucun test configuré"

# ==========================================
# INSTALLATION
# ==========================================

install: ## Installation initiale complète
	@echo "📦 Installation de Smart Workforce AI..."
	@if [ ! -f .env ]; then \
		echo "📝 Création du fichier .env..."; \
		cp .env.example .env; \
		echo "⚠️  N'oubliez pas de modifier .env avec vos valeurs!"; \
	fi
	@echo "🔨 Construction des images..."
	@$(COMPOSE) build
	@echo "🚀 Démarrage des services..."
	@$(COMPOSE) up -d
	@echo ""
	@echo "✅ Installation terminée!"
	@echo ""
	@echo "📱 Application accessible sur: http://localhost"
	@echo "🔧 Pour le développement: make dev"
	@echo "📚 Pour voir toutes les commandes: make help"

# ==========================================
# PRODUCTION AVANCÉE
# ==========================================

deploy: ## Déploiement production complet avec sauvegarde
	@echo "🚀 Déploiement en production..."
	@make db-backup
	@git pull
	@$(COMPOSE) build
	@$(COMPOSE) up -d
	@echo "✅ Déploiement terminé!"

update: ## Mettre à jour l'application
	@echo "🔄 Mise à jour de l'application..."
	@make db-backup
	@git pull
	@$(COMPOSE) down
	@$(COMPOSE) build
	@$(COMPOSE) up -d
	@echo "✅ Mise à jour terminée!"
