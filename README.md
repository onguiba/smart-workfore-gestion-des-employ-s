# 🏢 Smart Workforce TSA

> Application web moderne de gestion des employés pour **TSA - Transport & Services d'Afrique** avec pointage biométrique, géolocalisation GPS et suivi en temps réel.

[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Hostinger Ready](https://img.shields.io/badge/Hostinger-Ready-orange.svg)](README_HOSTINGER.md)

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Déploiement Hostinger](#-déploiement-hostinger)
- [Utilisation](#-utilisation)
- [API](#-api)
- [Technologies](#-technologies)
- [Contribution](#-contribution)

## 🚀 Déploiement Hostinger

✨ **Cette application est prête pour Hostinger !**

📖 **Guide complet :** [README_HOSTINGER.md](README_HOSTINGER.md)

### Installation rapide sur Hostinger

1. **Téléchargez le ZIP** depuis GitHub
2. **Uploadez** dans File Manager Hostinger
3. **Extrayez** le contenu
4. **Vérifiez** que `database.json` est présent
5. **Configurez Node.js** dans le panneau Hostinger
6. **Démarrez** l'application

C'est tout ! 🎉

## ✨ Fonctionnalités

### 👤 Gestion des Employés
- ✅ Inscription avec capture photo (webcam)
- ✅ Géolocalisation GPS automatique
- ✅ Génération automatique de matricule et email
- ✅ Espace personnel pour chaque employé
- ✅ Dashboard RH avec demandes de congé
- ✅ Assistant RH IA avec réponses automatiques

### ⏰ Pointage Intelligent
- ✅ Pointage arrivée/départ avec photo
- ✅ Enregistrement GPS précis
- ✅ Validation faciale sans email obligatoire
- ✅ Heure exacte et date
- ✅ Historique des pointages

### 📊 Tableau de Bord
- ✅ Vue d'ensemble des employés
- ✅ Statistiques en temps réel
- ✅ Taux de présence
- ✅ Rafraîchissement automatique

### 🔐 Connexion Simple
- ✅ Inscription = Connexion automatique
- ✅ Session persistante (localStorage)
- ✅ Déconnexion rapide

## 🏗️ Architecture

```
smart-workforce-ai/
├── frontend/              # Interface utilisateur
│   ├── home.html         # Page d'accueil
│   ├── register.html     # Inscription
│   ├── attendance.html   # Pointage
│   ├── mon-compte.html   # Espace personnel
│   ├── dashboard.html    # Tableau de bord
│   ├── chat.html        # Assistant RH
│   ├── tracking.html    # Suivi GPS
│   ├── payroll.html     # Gestion paie
│   ├── leaves.html      # Gestion congés
│   ├── missions.html    # Suivi missions
│   └── *.js / *.css     # Scripts et styles
│
├── backend/              # Serveur et logique
│   ├── server.js        # Serveur Node.js
│   └── package.json     # Dépendances
│
├── start.bat            # Démarrage Windows
├── start.sh             # Démarrage Linux/Mac
├── .gitignore          # Fichiers ignorés
└── README.md           # Cette documentation
```

## 🚀 Installation

### Prérequis
- [Node.js](https://nodejs.org/) (>= 16.0.0)
- Navigateur moderne (Chrome, Firefox, Edge)
- Webcam (pour la capture photo)
- GPS activé

### Installation rapide

```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/smart-workforce-ai.git
cd smart-workforce-ai

# 2. Installer les dépendances (optionnel)
cd backend
npm install
cd ..

# 3. Démarrer le serveur
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

### Accès à l'application
Ouvrez votre navigateur : **http://localhost:3000**

## 📖 Utilisation

### 1️⃣ Inscription d'un employé

1. Allez sur http://localhost:3000
2. Cliquez sur **"Nouvel Employé"**
3. Remplissez le formulaire
4. Activez la caméra et prenez votre photo
5. Attendez la détection GPS
6. Cliquez **"Finaliser l'inscription"**
7. ✅ Vous êtes automatiquement connecté !

### 2️⃣ Connexion (employé existant)

**Option A : Page d'accueil**
- Entrez votre email dans "Déjà inscrit ?"
- Cliquez "Se connecter"

**Option B : Via le pointage**
- Allez sur `/attendance.html`
- Prenez votre photo + Entrez votre email

### 3️⃣ Pointage quotidien

**Arrivée (matin)**
1. Allez sur http://localhost:3000/attendance.html
2. Prenez votre photo
3. Entrez votre email
4. Cliquez **"Arrivée"**

**Départ (soir)**
1. Même processus
2. Cliquez **"Départ"**

## 🔌 API

### Endpoints disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/employees` | GET | Liste des employés |
| `/api/employees/register` | POST | Inscription employé |
| `/api/employees/identify` | POST | Identification par email |
| `/api/attendance/checkin` | POST | Pointage arrivée |
| `/api/attendance/checkout` | POST | Pointage départ |
| `/api/attendance/history` | GET | Historique pointages |

### Exemple de requête

```javascript
// Inscription
fetch('/api/employees/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: "Jean Dupont",
    email: "jean@exemple.com",
    phone: "+33612345678",
    position: "Développeur",
    department: "IT",
    salary: 3500,
    photo: "data:image/jpeg;base64,...",
    location: { latitude: 48.8566, longitude: 2.3522 }
  })
})
```

## 🛠️ Technologies

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Geolocation API
- MediaDevices API (Webcam)

### Backend
- Node.js (serveur HTTP natif)
- Stockage en mémoire (mockData)

### À venir
- Base de données (PostgreSQL/MongoDB)
- Authentification JWT
- Reconnaissance faciale IA

## 📦 Déploiement

### Variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```env
PORT=3000
NODE_ENV=production
```

### Production

Pour la production, il est recommandé de :
- Migrer vers une vraie base de données
- Implémenter une authentification sécurisée
- Utiliser HTTPS
- Ajouter des tokens JWT

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

Développé avec ❤️ pour la gestion moderne des employés.

## 🐛 Bugs & Suggestions

Ouvrez une [issue](https://github.com/votre-username/smart-workforce-ai/issues) sur GitHub.

---

**Smart Workforce AI** - L'IA au service de la gestion des employés 💡
