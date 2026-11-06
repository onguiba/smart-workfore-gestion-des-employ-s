# ==============================================================================
# TSA SmartWorkforce AI™ — Guide de Déploiement PostgreSQL & Node.js
# ==============================================================================

Ce projet supporte nativement **PostgreSQL** avec un moteur universel :
- Si l'URL PostgreSQL (DATABASE_URL) est configurée, les données sont sauvegardées dans PostgreSQL.
- Le fichier ackend/postgres_schema.sql contient le schéma complet de la base PostgreSQL.
- Si PostgreSQL n'est pas encore configuré, le système utilise sa base JSON locale sécurisée.

------------------------------------------------------------------------------
COMMENT CONFIGURER POSTGRESQL :
------------------------------------------------------------------------------

1. OBTENIR UNE BASE POSTGRESQL :
   Vous pouvez utiliser n'importe quel fournisseur PostgreSQL :
   - Neon.tech (Gratuit, instantané, sans carte bancaire)
   - Supabase (Gratuit)
   - Render / Railway / AWS RDS

2. CRÉER LES TABLES :
   - Ouvrez la console SQL de votre base PostgreSQL (ex: Neon Dashboard > SQL Editor)
   - Copiez et exécutez le script contenu dans : backend/postgres_schema.sql

3. CONFIGURER LES VARIABLES SUR HOSTINGER :
   Dans les variables d'environnement de votre hébergement Node.js :
     DATABASE_URL=postgresql://utilisateur:mot_de_passe@hote:5432/nom_de_base?sslmode=require
   Ou créez un fichier .env à la racine avec cette variable.

4. DÉMARRER L'APPLICATION :
   - Fichier de démarrage : app.js (ou backend/server.js)
   - Le serveur détectera automatiquement PostgreSQL au lancement !