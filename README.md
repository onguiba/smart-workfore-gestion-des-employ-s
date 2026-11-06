# 🌐 TSA SmartWorkforce AI™ — Système Intelligent de Gestion RH

Application web complète de gestion RH et de pointage biométrique (Face ID & manuel) construite en **100% Node.js pur avec Base de Données JSON autonome**.

---

## 📁 ARCHITECTURE DU PROJET :

`	ext
smart-workfore-gestion-des-employ-s/
├── frontend/               👉 Tous les écrans et styles de l'interface
│   ├── home.html           (Accueil)
│   ├── attendance.html     (Pointage biométrique Face ID & manuel)
│   ├── dashboard.html      (Tableau de bord RH en direct avec heures et durées)
│   ├── employee-portal.html(Espace personnel employé)
│   ├── login.html, register.html
│   ├── leaves.html, payroll.html, missions.html, tracking.html, chat.html
│   ├── styles.css, professional-styles.css
│   └── image/tsa.jpeg, tsa-logo.svg
│
├── backend/                👉 Moteur serveur et données
│   ├── server.js           (Serveur Node.js natif et routes API)
│   ├── database.js         (Gestionnaire de données)
│   └── data/database.json  (Base de Données JSON persistante autonome - Zéro MySQL requis)
│
├── app.js                  👉 Lanceur racine Node.js
├── package.json            👉 Configuration npm
├── start.bat               👉 Démarrage direct en local
└── .htaccess               👉 Configuration Hostinger
`

---

## 📦 DÉPLOIEMENT HOSTINGER :
1. Téléchargez le ZIP : cliquez sur **<> Code** > **Download ZIP**.
2. Déposez et extrayez le ZIP dans votre dossier Hostinger (public_html).
3. Démarrez l'application Node.js avec **pp.js**.