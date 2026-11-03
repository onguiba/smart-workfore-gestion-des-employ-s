# 🚀 Guide Simple de Déploiement sur Hostinger

## ✅ Étapes Rapides (10 minutes)

### 1️⃣ Créer la Base de Données MySQL

1. **Connectez-vous à hPanel** (panneau Hostinger)
2. **Allez dans "Bases de données MySQL"**
3. **Créez une nouvelle base de données** (les identifiants vous seront donnés automatiquement)
4. **Notez bien** :
   - Nom de la base : `u954610625_db_OhzWYKBo` (exemple)
   - Utilisateur : `u954610625_usr_OhzWYKBo` (exemple)
   - Mot de passe : `S@SuF-db` (exemple)

### 2️⃣ Importer la Structure SQL

1. **Ouvrez phpMyAdmin** depuis hPanel
2. **Sélectionnez votre base de données**
3. **Allez dans l'onglet "SQL"**
4. **Copiez le contenu du fichier `database.sql`**
5. **Collez et exécutez**
6. ✅ Les tables et données de démo sont créées !

### 3️⃣ Configurer la Connexion

1. **Ouvrez le fichier `api/config.php`**
2. **Remplacez les valeurs** par vos identifiants Hostinger :

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'VOTRE_BASE_DE_DONNÉES');
define('DB_USER', 'VOTRE_UTILISATEUR');
define('DB_PASS', 'VOTRE_MOT_DE_PASSE');
```

### 4️⃣ Uploader les Fichiers

**Option A : File Manager (Simple)**
1. Connectez-vous à hPanel
2. Allez dans **"Gestionnaire de fichiers"**
3. Ouvrez le dossier **`public_html`**
4. **Uploadez TOUS les fichiers** du projet :
   - ✅ Dossier `frontend/` (avec tous les fichiers HTML, CSS, JS)
   - ✅ Dossier `api/` (avec config.php et employees.php)
   - ✅ Fichier `index.php`
   - ✅ Fichier `.htaccess`

**Option B : FTP (FileZilla)**
1. Ouvrez FileZilla
2. Connectez-vous avec vos identifiants FTP Hostinger
3. Glissez-déposez tous les fichiers dans `/public_html`

### 5️⃣ Configurer .htaccess pour API

Créez/modifiez le fichier `.htaccess` dans `public_html` :

```apache
# Redirection vers index.php si le fichier n'existe pas
RewriteEngine On
RewriteBase /

# API routing
RewriteRule ^api/employees$ api/employees.php [L]
RewriteRule ^api/employees/register$ api/employees.php [L]

# Redirection par défaut
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^$ index.php [L]
```

### 6️⃣ Tester l'Application

1. **Ouvrez votre domaine** : `https://votredomaine.com`
2. **Vous devriez voir** la page d'accueil TSA
3. **Testez l'inscription** : `/frontend/register.html`
4. **Testez l'API** : `/api/employees` (devrait afficher du JSON)

## 🎯 Structure Finale sur Hostinger

```
public_html/
├── api/
│   ├── config.php          ⭐ Configuration BDD
│   └── employees.php       ⭐ API employés
├── frontend/
│   ├── home.html
│   ├── register.html
│   ├── mon-compte.html
│   ├── *.js
│   ├── *.css
│   └── image/
│       └── tsa.jpeg
├── index.php              ⭐ Point d'entrée
└── .htaccess              ⭐ Routing
```

## 🔧 Configuration Frontend

Modifiez les appels API dans les fichiers JavaScript pour pointer vers `/api/` au lieu de `/api/employees` :

**Dans `register.js` :**
```javascript
const response = await fetch('/api/employees', {
    method: 'POST',
    // ...
});
```

## ✅ Checklist de Vérification

- [ ] Base de données MySQL créée
- [ ] Script SQL exécuté dans phpMyAdmin
- [ ] `api/config.php` configuré avec vos identifiants
- [ ] Tous les fichiers uploadés dans `public_html`
- [ ] `.htaccess` configuré
- [ ] Page d'accueil accessible
- [ ] API répond : `/api/employees`
- [ ] Inscription fonctionne

## 🆘 Dépannage

### "Erreur de connexion à la base de données"
- Vérifiez les identifiants dans `api/config.php`
- Vérifiez que la base de données existe dans phpMyAdmin

### "Page non trouvée" pour les API
- Vérifiez que le fichier `.htaccess` est présent
- Vérifiez que mod_rewrite est activé (demandez au support Hostinger)

### Images ne s'affichent pas
- Vérifiez que le dossier `frontend/image/` est bien uploadé
- Vérifiez les permissions (644 pour les fichiers, 755 pour les dossiers)

## 📞 Support

- **Hostinger Support** : https://www.hostinger.fr/support
- **phpMyAdmin** : Accessible depuis hPanel

---

✨ **Votre application TSA sera en ligne en quelques minutes !**
