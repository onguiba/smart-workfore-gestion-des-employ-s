# Dockerfile pour Smart Workforce AI
FROM node:18-alpine

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json
COPY backend/package*.json ./backend/

# Installer les dépendances
WORKDIR /app/backend
RUN npm install --production

# Revenir à la racine et copier tout le projet
WORKDIR /app
COPY . .

# Exposer le port de l'application
EXPOSE 3000

# Variables d'environnement par défaut
ENV PORT=3000
ENV NODE_ENV=production

# Démarrer l'application
CMD ["node", "backend/server.js"]
