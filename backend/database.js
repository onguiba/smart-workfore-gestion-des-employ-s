// Database Manager Universal - Support MySQL et PostgreSQL
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const DB_DRIVER = process.env.DB_DRIVER || 'json';
const dataPath = path.join(__dirname, 'data', 'database.json');

// Mock data par défaut
const defaultData = {
  user: null,
  employees: [
    {
      id: 1,
      name: "Moussa Diop",
      email: "moussa.diop@smartworkforce.ai",
      phone: "+33 6 45 89 12 30",
      position: "Superviseur Logistique",
      role: "Superviseur Logistique",
      department: "Operations",
      salary: 45000,
      status: "present",
      matricule: "SWA-8842",
      userType: "employee",
      joinDate: "2023-01-15",
      checkInTime: "08:24",
      checkOutTime: "-",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      name: "Jean Dupont",
      email: "jean.dupont@smartworkforce.ai",
      phone: "+33 6 12 34 56 78",
      position: "Architecte Cloud",
      role: "Architecte Cloud & Systèmes",
      department: "IT",
      salary: 52000,
      status: "present",
      matricule: "SWA-4910",
      userType: "employee",
      joinDate: "2022-05-20",
      checkInTime: "08:55",
      checkOutTime: "-",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    }
  ],
  hrUsers: [
    {
      id: 1,
      name: "Sophie Laurent",
      email: "sophie.laurent@smartworkforce.ai",
      phone: "+33 6 10 20 30 40",
      role: "Directrice des Ressources Humaines",
      department: "Direction RH",
      matricule: "SWA-DIR-01",
      userType: "hr",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    }
  ],
  attendance: {
    present: 2,
    absent: 0,
    late: 0,
    onMission: 0
  },
  missions: [
    {
      id: 1,
      title: "Livraison Express Client ABC",
      status: "inProgress",
      progress: 65,
      dueTime: "17:30",
      location: "Paris 15ème",
      assignee: "Moussa Diop",
      priority: "Haute"
    }
  ],
  leaves: [],
  leaveBalance: {
    annual: { total: 25, taken: 10, remaining: 15 },
    rtt: { total: 11, taken: 3, remaining: 8 },
    sick: { taken: 2 }
  },
  performance: {
    overall: 92,
    punctuality: 95,
    productivity: 88
  },
  payroll: [
    {
      id: 1,
      employee: "Moussa Diop",
      matricule: "SWA-8842",
      role: "Superviseur Logistique",
      department: "Operations",
      grossSalary: "3 750.00 €",
      bonuses: "250.00 €",
      overtime: "180.00 €",
      deductions: "450.00 €",
      netSalary: "3 730.00 €",
      month: "Mai 2026",
      status: "Payé"
    }
  ],
  fraudAlerts: [],
  trackingAgents: [],
  attendanceRecords: [],
  chatMessages: []
};

// Fonction pour charger/sauvegarder les données JSON
function loadData() {
  try {
    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(rawData);
    }
  } catch (err) {
    console.error('Erreur lors du chargement des données:', err);
  }
  return defaultData;
}

function saveData(data) {
  try {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Erreur lors de la sauvegarde des données:', err);
  }
}

// Database connection selon le driver
let db = null;

async function initDatabase() {
  if (DB_DRIVER === 'mysql') {
    // Configuration MySQL (pour Hostinger)
    try {
      const mysql = require('mysql2/promise');
      db = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      console.log('✅ Connecté à MySQL (Hostinger)');
      return db;
    } catch (error) {
      console.error('❌ Erreur de connexion MySQL:', error.message);
      console.log('⚠️  Utilisation du mode JSON de secours');
      return null;
    }
  } else if (DB_DRIVER === 'postgresql' || DB_DRIVER === 'postgres') {
    // Configuration PostgreSQL
    try {
      const { Pool } = require('pg');
      db = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      await db.query('SELECT 1');
      console.log('✅ Connecté à PostgreSQL');
      return db;
    } catch (error) {
      console.error('❌ Erreur de connexion PostgreSQL:', error.message);
      console.log('⚠️  Utilisation du mode JSON de secours');
      return null;
    }
  } else {
    console.log('📝 Mode JSON (sans base de données)');
    return null;
  }
}

// Fonction pour ajouter un employé
async function addEmployee(employee) {
  if (db && DB_DRIVER === 'mysql') {
    try {
      const [result] = await db.execute(
        `INSERT INTO employees (name, email, phone, position, role, department, salary, photo, matricule, user_type, join_date, registration_time, registration_location) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee.name,
          employee.email,
          employee.phone,
          employee.position,
          employee.role || employee.position,
          employee.department,
          employee.salary,
          employee.photo,
          employee.matricule,
          employee.userType || 'employee',
          employee.joinDate,
          employee.registrationTime,
          JSON.stringify(employee.location)
        ]
      );
      employee.id = result.insertId;
    } catch (error) {
      console.error('Erreur MySQL addEmployee:', error);
    }
  } else if (db && (DB_DRIVER === 'postgresql' || DB_DRIVER === 'postgres')) {
    try {
      const result = await db.query(
        `INSERT INTO employees (name, email, phone, position, role, department, salary, photo, matricule, user_type, join_date, registration_time, registration_location) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
        [
          employee.name,
          employee.email,
          employee.phone,
          employee.position,
          employee.role || employee.position,
          employee.department,
          employee.salary,
          employee.photo,
          employee.matricule,
          employee.userType || 'employee',
          employee.joinDate,
          employee.registrationTime,
          JSON.stringify(employee.location)
        ]
      );
      employee.id = result.rows[0].id;
    } catch (error) {
      console.error('Erreur PostgreSQL addEmployee:', error);
    }
  } else {
    // Mode JSON
    const data = loadData();
    data.employees.push(employee);
    saveData(data);
  }
}

// Export
module.exports = {
  data: loadData(),
  initDatabase,
  addEmployee,
  saveData,
  loadData
};
