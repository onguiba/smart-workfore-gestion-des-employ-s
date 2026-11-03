# 🚀 Guide de Déploiement sur Hostinger - Smart Workforce TSA

## 📋 Prérequis Hostinger

- Hébergement Web avec support Node.js
- Accès FTP ou File Manager
- Node.js version 16+ activé dans le panneau Hostinger

## 📦 Fichiers à Télécharger

### Structure complète à uploader :

```
smart-workforce-tsa/
├── backend/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── *.html (tous les fichiers HTML)
│   ├── *.css
│   ├── *.js
│   └── image/
│       └── tsa.jpeg
├── database.json          ⭐ FICHIER DE BASE DE DONNÉES
├── .htaccess             ⭐ CONFIGURATION APACHE
├── package.json
└── .env
```

## 🗄️ Base de Données

**Fichier principal :** `database.json`

Ce fichier contient toutes les données de l'application :
- Employés
- Utilisateurs RH
- Pointages
- Congés
- Paie
- Missions

**Important :** Ce fichier sera lu/écrit par l'application pour persister les données.

## 📝 Configuration Hostinger

### Étape 1 : Créer un fichier .env

Créez un fichier `.env` à la racine avec :

```env
PORT=3000
NODE_ENV=production
DATABASE_FILE=./database.json
```

### Étape 2 : Configuration Node.js dans Hostinger

1. Allez dans **Panneau de contrôle > Advanced > Node.js**
2. Créez une nouvelle application Node.js :
   - **Version Node.js :** 16.x ou supérieur
   - **Mode :** Production
   - **Dossier :** `/public_html` (ou votre dossier)
   - **Fichier de démarrage :** `backend/server.js`
   - **Commande de démarrage :** `node backend/server.js`

### Étape 3 : Installer les dépendances

Via SSH ou Terminal Hostinger :

```bash
cd /home/votreuser/public_html
npm install
```

### Étape 4 : Démarrer l'application

```bash
npm start
# ou
node backend/server.js
```

## 🌐 Configuration Domaine

### Option A : Domaine principal
Votre application sera accessible sur : `https://votredomaine.com`

### Option B : Sous-domaine
Créez un sous-domaine : `tsa.votredomaine.com`

## 📤 Méthodes de Upload

### Méthode 1 : File Manager Hostinger (Recommandé)

1. Téléchargez le ZIP depuis GitHub
2. Allez dans **File Manager** dans Hostinger
3. Uploadez le fichier ZIP
4. Extrayez-le dans `/public_html`
5. **IMPORTANT :** Vérifiez que `database.json` est bien présent

### Méthode 2 : FTP (FileZilla)

1. Téléchargez FileZilla
2. Connectez-vous avec les identifiants FTP Hostinger
3. Uploadez tous les fichiers dans `/public_html`
4. Vérifiez les permissions :
   - `database.json` : 644 (lecture/écriture)
   - Dossiers : 755

### Méthode 3 : Git Deploy (Avancé)

```bash
# Sur Hostinger via SSH
cd /home/votreuser/public_html
git clone https://github.com/votre-username/smart-workforce-tsa.git .
npm install
node backend/server.js
```

## ✅ Vérification Post-Déploiement

1. **Test de base :**
   - Accédez à `https://votredomaine.com`
   - Vous devriez voir la page d'accueil TSA

2. **Test API :**
   - `https://votredomaine.com/api/employees`
   - Devrait retourner les employés

3. **Test inscription :**
   - Allez sur `/register.html`
   - Inscrivez un nouvel employé
   - Vérifiez qu'il apparaît dans la base de données

## 🔧 Dépannage

### Problème : "Cannot find database.json"

**Solution :**
```bash
# Vérifier que le fichier existe
ls -la database.json

# Vérifier les permissions
chmod 644 database.json
```

### Problème : "Port 3000 already in use"

**Solution :** Modifiez le port dans `.env` ou laissez Hostinger l'assigner automatiquement.

### Problème : Page blanche

**Solution :**
1. Vérifiez les logs Node.js dans le panneau Hostinger
2. Vérifiez que toutes les dépendances sont installées
3. Vérifiez le fichier `.htaccess`

## 📊 Monitoring

- **Logs Node.js :** Panneau Hostinger > Node.js > Logs
- **Base de données :** Téléchargez `database.json` via FTP pour backup

## 🔒 Sécurité

1. **Changez les mots de passe par défaut** dans `database.json`
2. **Activez HTTPS** (Let's Encrypt gratuit sur Hostinger)
3. **Sauvegardez régulièrement** `database.json`

## 📞 Support

- Hostinger Support : https://www.hostinger.fr/support
- Documentation Node.js Hostinger : https://support.hostinger.com/en/articles/1583245-how-to-set-up-node-js

## 🎉 C'est Prêt !

Votre application Smart Workforce TSA est maintenant en ligne !

URL d'accès : `https://votredomaine.com`

---

**Développé pour TSA - Transport & Services d'Afrique** 🚛
