# 🌐 Guide de Déploiement sur Hostinger

Guide complet pour déployer Smart Workforce AI sur votre hébergement Hostinger avec base de données MySQL.

## 📋 Prérequis

✅ Compte Hostinger actif  
✅ Base de données MySQL créée dans hPanel  
✅ Accès FTP ou File Manager  
✅ Accès phpMyAdmin  

## 🔐 Informations de Connexion (Votre Configuration)

D'après votre capture d'écran :

```
Base de données : u954610625_db_8FSN1oDM
Utilisateur     : u954610625_usr_8FSN1oDM
Mot de passe    : c+0Um2JJo
Hôte            : localhost
Port            : 3306
```

## 🚀 Étapes de Déploiement

### Étape 1 : Préparer les Fichiers en Local

```bash
# 1. Cloner le projet (si ce n'est pas déjà fait)
cd Desktop
git clone https://github.com/onguiba/smart-workfore-gestion-des-employ-s.git
cd smart-workfore-gestion-des-employ-s-main

# 2. Configurer les variables d'environnement
cp backend/.env.hostinger backend/.env

# 3. Vérifier le fichier backend/.env
cat backend/.env
```

Le fichier `backend/.env` doit contenir :

```env
PORT=3000
NODE_ENV=production

# Base de données MySQL Hostinger
DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u954610625_db_8FSN1oDM
DB_USER=u954610625_usr_8FSN1oDM
DB_PASSWORD=c+0Um2JJo

# JWT Secret (changez cette valeur pour la sécurité)
JWT_SECRET=swa_enterprise_biometric_token_2026_hostinger_secure_key
```

### Étape 2 : Créer les Tables dans la Base de Données

1. **Accédez à phpMyAdmin** depuis votre hPanel Hostinger
2. **Sélectionnez** la base de données `u954610625_db_8FSN1oDM`
3. **Cliquez** sur l'onglet **"SQL"**
4. **Ouvrez** le fichier `backend/hostinger_database.sql` en local
5. **Copiez** tout le contenu du fichier
6. **Collez** dans la zone de texte SQL de phpMyAdmin
7. **Cliquez** sur **"Exécuter"**

✅ Vous devriez voir un message de succès indiquant que les tables ont été créées.

### Étape 3 : Vérifier les Tables Créées

Dans phpMyAdmin, vous devriez voir ces tables :

- ✅ `employees` (employés)
- ✅ `hr_users` (utilisateurs RH)
- ✅ `attendance_records` (pointages)
- ✅ `leaves` (congés)
- ✅ `payroll` (paie)
- ✅ `missions` (missions terrain)

Avec des données de démonstration déjà insérées.

### Étape 4 : Tester la Connexion en Local (Optionnel mais Recommandé)

```bash
# Installer les dépendances
cd backend
npm install

# Tester la connexion MySQL
npm run test:db
```

Vous devriez voir :
```
✅ Connexion MySQL réussie !
📊 Tables disponibles (6) :
  - employees
  - hr_users
  - attendance_records
  - leaves
  - payroll
  - missions
👥 Nombre d'employés : 3
```

Si ça fonctionne, passez à l'étape suivante. Sinon, vérifiez vos identifiants.

### Étape 5 : Transférer les Fichiers sur Hostinger

#### Option A : Via FTP (FileZilla, WinSCP)

1. **Connectez-vous** à votre serveur Hostinger via FTP
2. **Naviguez** vers le dossier `public_html` (ou votre dossier racine)
3. **Créez** un dossier `smart-workforce` (ou utilisez le dossier racine)
4. **Uploadez** ces dossiers et fichiers :
   - 📁 `frontend/` (tous les fichiers HTML, CSS, JS)
   - 📁 `backend/` (server.js, database.js, .env, package.json, etc.)
   - 📄 `.htaccess` (si vous l'avez)

#### Option B : Via File Manager Hostinger

1. **Connectez-vous** à hPanel
2. **Accédez** à **File Manager**
3. **Uploadez** les dossiers `frontend/` et `backend/`

### Étape 6 : Installer Node.js sur Hostinger

Hostinger supporte Node.js. Vérifiez dans votre hPanel :

1. **Accédez** à **"Advanced" > "Node.js"**
2. **Créez** une nouvelle application Node.js
3. **Configurez** :
   - **Application root** : `/domains/votre-domaine.com/public_html/backend`
   - **Application URL** : `https://votre-domaine.com`
   - **Application startup file** : `server.js`
   - **Node.js version** : 18.x ou supérieure

4. **Installez** les dépendances :
   ```bash
   npm install
   ```

5. **Démarrez** l'application

### Étape 7 : Configurer .htaccess (Si Nécessaire)

Créez ou modifiez le fichier `.htaccess` à la racine :

```apache
# Redirection vers le frontend
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # API requests vers le backend Node.js
    RewriteCond %{REQUEST_URI} ^/api/
    RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
    
    # Fichiers statiques frontend
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /frontend/$1 [L]
    
    # Page d'accueil
    DirectoryIndex home.html index.html
</IfModule>

# Sécurité
<FilesMatch "\.(env|json|md)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### Étape 8 : Vérifier le Déploiement

1. **Accédez** à votre site : `https://votre-domaine.com`
2. **Testez** la page d'accueil : `https://votre-domaine.com/home.html`
3. **Testez** l'API : `https://votre-domaine.com/api/employees`

Si tout fonctionne, vous devriez voir l'application !

## 🔍 Dépannage

### Erreur : "Cannot connect to database"

**Cause** : Identifiants MySQL incorrects

**Solution** :
1. Vérifiez `backend/.env`
2. Vérifiez que `DB_HOST=localhost` (pas une adresse IP)
3. Vérifiez que le mot de passe ne contient pas d'espaces

### Erreur : "Table doesn't exist"

**Cause** : Le script SQL n'a pas été exécuté

**Solution** :
1. Retournez dans phpMyAdmin
2. Exécutez `backend/hostinger_database.sql`
3. Vérifiez que toutes les tables sont créées

### Erreur 500 : Internal Server Error

**Cause** : Problème avec Node.js ou permissions

**Solution** :
1. Vérifiez les logs Node.js dans hPanel
2. Vérifiez que `npm install` a bien installé les packages
3. Vérifiez les permissions des fichiers (644 pour les fichiers, 755 pour les dossiers)

### L'API ne répond pas

**Cause** : Node.js n'est pas démarré ou mal configuré

**Solution** :
1. Vérifiez que l'application Node.js est "Running" dans hPanel
2. Redémarrez l'application
3. Vérifiez les logs pour voir les erreurs

## 📊 Structure Finale sur Hostinger

```
public_html/
├── frontend/
│   ├── home.html
│   ├── login.html
│   ├── dashboard.html
│   ├── styles.css
│   └── ...
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── .env (IMPORTANT : contient vos identifiants)
│   ├── package.json
│   └── node_modules/
├── .htaccess
└── index.html (redirection optionnelle)
```

## 🔐 Sécurité Important

⚠️ **CRITIQUE** : Le fichier `.env` contient vos identifiants de base de données !

**Protégez-le avec .htaccess** :

```apache
<FilesMatch "^\.env">
    Order allow,deny
    Deny from all
</FilesMatch>
```

**Ou placez-le en dehors de public_html** :

```
/home/u954610625/
├── .env (ici, en dehors de public_html)
└── public_html/
    ├── frontend/
    └── backend/
```

Puis modifiez `backend/database.js` :

```javascript
require('dotenv').config({ path: '../.env' });
```

## 🎯 Checklist Finale

- [ ] Base de données MySQL créée dans hPanel
- [ ] Script SQL exécuté dans phpMyAdmin
- [ ] Tables créées et visibles dans phpMyAdmin
- [ ] Fichier `.env` configuré avec les bons identifiants
- [ ] Fichiers uploadés sur Hostinger
- [ ] Application Node.js créée et démarrée dans hPanel
- [ ] npm install exécuté
- [ ] API accessible : `/api/employees` retourne des données
- [ ] Frontend accessible : `/home.html` s'affiche
- [ ] Fichier .env protégé par .htaccess

## 🌟 Fonctionnalités Disponibles Après Déploiement

Une fois déployé, vous aurez accès à :

- ✅ Authentification biométrique (Face ID)
- ✅ Tableau de bord RH en temps réel
- ✅ Gestion des employés avec photos
- ✅ Pointage check-in/check-out avec géolocalisation
- ✅ Gestion des congés
- ✅ Module paie
- ✅ Suivi des missions terrain
- ✅ Chat IA intelligent
- ✅ Détection de fraude

## 📞 Support

En cas de problème :

1. **Documentation** : [HOSTINGER_SETUP.md](HOSTINGER_SETUP.md)
2. **Support Hostinger** : https://www.hostinger.fr/contact
3. **GitHub Issues** : https://github.com/onguiba/smart-workfore-gestion-des-employ-s/issues

## 🚀 Prochaines Étapes

1. **Testez** toutes les fonctionnalités
2. **Personnalisez** les données de démonstration
3. **Configurez** un nom de domaine personnalisé
4. **Activez** HTTPS (SSL gratuit avec Hostinger)
5. **Sauvegardez** régulièrement votre base de données

---

**Smart Workforce AI v1.0.0** | Déployé avec ❤️ sur Hostinger 🚀
