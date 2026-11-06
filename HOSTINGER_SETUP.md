# 🌐 Configuration Hostinger MySQL

Guide pour configurer votre application avec la base de données MySQL Hostinger.

## 📋 Informations de Connexion

D'après votre capture d'écran Hostinger :

```
Nom de la base de données : u954610625_db_8FSN1oDM
Nom d'utilisateur        : u954610625_usr_8FSN1oDM
Mot de passe             : c+0Um2JJo
Hôte                     : localhost (depuis Hostinger)
```

## 🚀 Configuration Rapide

### Étape 1 : Créer les Tables dans phpMyAdmin

1. **Accédez à phpMyAdmin** depuis votre panneau Hostinger
2. **Sélectionnez** la base de données `u954610625_db_8FSN1oDM`
3. **Cliquez** sur l'onglet "SQL"
4. **Copiez** le contenu du fichier `backend/hostinger_database.sql`
5. **Collez** dans la zone SQL et **Exécutez**

### Étape 2 : Configurer les Variables d'Environnement

Utilisez le fichier `.env.hostinger` déjà créé :

```bash
# Copier la configuration Hostinger
cp backend/.env.hostinger backend/.env
```

Ou créez manuellement `backend/.env` avec :

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

# JWT Secret
JWT_SECRET=swa_enterprise_biometric_token_2026_hostinger_secure_key
```

### Étape 3 : Installer les Dépendances

```bash
cd backend
npm install
```

Cela installera automatiquement `mysql2` et `pg` (support des deux bases de données).

### Étape 4 : Démarrer l'Application

```bash
# En local pour tester
npm start

# Ou avec Docker (configuré pour MySQL)
docker-compose up -d
```

## 🔄 Basculer entre MySQL et PostgreSQL

Le projet supporte maintenant **les deux** :

### Utiliser MySQL (Hostinger)
```env
DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
```

### Utiliser PostgreSQL (Docker)
```env
DB_DRIVER=postgresql
DB_HOST=postgres
DB_PORT=5432
```

## 📝 Fichiers SQL Disponibles

| Fichier | Usage |
|---------|-------|
| `backend/database.sql` | Schéma PostgreSQL (pour Docker) |
| `backend/hostinger_database.sql` | Schéma MySQL (pour Hostinger) |
| `backend/migrate_mysql_to_postgres.md` | Guide de migration |

## 🔧 Configuration Docker pour MySQL

Si vous voulez utiliser Docker avec MySQL au lieu de PostgreSQL :

### docker-compose.mysql.yml

Créez ce fichier :

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: smart-workforce-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: smart_workforce
      MYSQL_USER: smartworkforce
      MYSQL_PASSWORD: smartworkforce2026
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/hostinger_database.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - smart-workforce-network

  app:
    build: .
    container_name: smart-workforce-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      NODE_ENV: production
      DB_DRIVER: mysql
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: smart_workforce
      DB_USER: smartworkforce
      DB_PASSWORD: smartworkforce2026
      JWT_SECRET: swa_token_key
    depends_on:
      - mysql
    networks:
      - smart-workforce-network

volumes:
  mysql_data:

networks:
  smart-workforce-network:
    driver: bridge
```

Démarrer avec :
```bash
docker-compose -f docker-compose.mysql.yml up -d
```

## 🔍 Vérification de la Connexion

### Test de Connexion

Créez `backend/test_connection.js` :

```javascript
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Connexion MySQL réussie !');
    
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM employees');
    console.log(`📊 Nombre d'employés : ${rows[0].count}`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Erreur de connexion :', error.message);
  }
}

testConnection();
```

Exécuter :
```bash
node backend/test_connection.js
```

## 📊 Structure des Tables MySQL

Les tables créées :
- ✅ `employees` - Employés
- ✅ `hr_users` - Utilisateurs RH
- ✅ `attendance_records` - Pointages
- ✅ `leaves` - Congés
- ✅ `payroll` - Paie
- ✅ `missions` - Missions terrain

## 🔐 Sécurité

⚠️ **Important** : Ne commitez JAMAIS le fichier `.env` avec vos vrais identifiants !

Le fichier `.gitignore` inclut déjà :
```
.env
.env.*
!.env.example
```

## 🆘 Dépannage

### Erreur : Access Denied

Vérifiez que :
- Le nom d'utilisateur est correct
- Le mot de passe est exact (attention aux caractères spéciaux)
- L'hôte est `localhost` si vous êtes sur Hostinger

### Erreur : Unknown Database

La base de données n'existe pas encore. Créez-la dans phpMyAdmin ou utilisez :

```sql
CREATE DATABASE IF NOT EXISTS `u954610625_db_8FSN1oDM` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### Erreur : Table doesn't exist

Exécutez le script SQL `hostinger_database.sql` dans phpMyAdmin.

## 📞 Support

Pour toute question :
- 📖 Documentation MySQL : https://dev.mysql.com/doc/
- 🌐 Support Hostinger : https://www.hostinger.fr/contact
- 📧 Panneau Hostinger : https://hpanel.hostinger.com

---

**Smart Workforce AI v1.0.0** | Compatible MySQL & PostgreSQL 🚀
