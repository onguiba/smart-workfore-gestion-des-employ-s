# 🚀 TSA SmartWorkforce AI™ — Déploiement Hostinger Simple

Ce dépôt contient l'application complète, nettoyée et prête pour Hostinger.

## 📦 Comment déployer en 3 étapes :

### 1. Télécharger le ZIP depuis GitHub
- Cliquez sur le bouton vert **`<> Code`** en haut à droite sur GitHub.
- Cliquez sur **`Download ZIP`**.

### 2. Uploader sur Hostinger
1. Connectez-vous à votre panneau **Hostinger (hPanel)**.
2. Ouvrez le **Gestionnaire de fichiers** (`public_html`).
3. Uploadez le fichier ZIP téléchargé.
4. Faites un clic droit sur le fichier ZIP > **Extraire**.
5. Déplacez si besoin les fichiers directement à la racine de `public_html` :
   - `.htaccess`
   - `index.php`
   - `index.html`
   - `api/`
   - `backend/`
   - `frontend/`

### 3. Base de données MySQL
Le fichier `api/config.php` est déjà configuré avec les identifiants de votre base Hostinger :
- **Base :** `u954610625_db_6LxveS47`
- **Utilisateur :** `u954610625_usr_6LxveS47`

Si vous souhaitez importer la structure SQL complète :
- Allez dans **phpMyAdmin** sur Hostinger.
- Sélectionnez la base de données.
- Cliquez sur **Importer** et choisissez le fichier `backend/hostinger_database.sql`.
