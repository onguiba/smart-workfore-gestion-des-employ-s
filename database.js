// Database Manager 100% JSON Persistant - Autonome (Aucun MySQL requis)
const fs = require('fs');
const path = require('path');

// Emplacement du fichier de base de données JSON
const dataDir = path.join(__dirname, 'data');
const dataPath = path.join(dataDir, 'database.json');

// Vérifier et créer le dossier data si nécessaire
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Données initiales si database.json n'existe pas encore
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
    },
    {
      id: 3,
      name: "Marie Martin",
      email: "marie.martin@smartworkforce.ai",
      phone: "+33 6 98 76 54 32",
      position: "Responsable RH",
      role: "Responsable Recrutement & Talents",
      department: "HR",
      salary: 48000,
      status: "late",
      matricule: "SWA-3301",
      userType: "employee",
      joinDate: "2021-11-10",
      checkInTime: "09:42",
      checkOutTime: "-",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: 4,
      name: "Daniel Gomis",
      email: "daniel.gomis@smartworkforce.ai",
      phone: "+33 6 55 44 33 22",
      position: "Chauffeur Poids Lourd",
      role: "Chauffeur Poids Lourd",
      department: "Logistics",
      salary: 42000,
      status: "present",
      matricule: "SWA-7219",
      userType: "employee",
      joinDate: "2023-03-01",
      checkInTime: "07:50",
      checkOutTime: "-",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: 5,
      name: "Lucas Mercier",
      email: "lucas.mercier@smartworkforce.ai",
      phone: "+33 6 77 88 99 00",
      position: "Account Executive B2B",
      role: "Account Executive B2B",
      department: "Sales",
      salary: 50000,
      status: "present",
      matricule: "SWA-5541",
      userType: "employee",
      joinDate: "2023-06-15",
      checkInTime: "08:40",
      checkOutTime: "-",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: 6,
      name: "Sarah Perez",
      email: "sarah.perez@smartworkforce.ai",
      phone: "+33 6 33 22 11 00",
      position: "Chef de Produit IA",
      role: "Chef de Produit IA",
      department: "Marketing",
      salary: 47000,
      status: "absent",
      matricule: "SWA-6022",
      userType: "employee",
      joinDate: "2022-09-01",
      checkInTime: "-",
      checkOutTime: "-",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
    }
  ],
  hrUsers: [
    {
      id: 1,
      name: "Sophie Laurent",
      email: "sophie.laurent@smartworkforce.ai",
      role: "Directrice des Ressources Humaines",
      department: "Direction RH",
      phone: "+33 6 10 20 30 40",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      userType: "hr",
      matricule: "SWA-DIR-01"
    },
    {
      id: 2,
      name: "Marie Martin",
      email: "marie.martin@smartworkforce.ai",
      role: "Responsable Recrutement & Talents",
      department: "Ressources Humaines",
      phone: "+33 6 98 76 54 32",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      userType: "hr",
      matricule: "SWA-HR-02"
    }
  ],
  attendance: {
    present: 150,
    absent: 8,
    onMission: 24,
    late: 12,
    rate: 94.7
  },
  attendanceRecords: [],
  missions: [
    {
      id: 1,
      title: "Livraison Convoi Sécurisé Dakar-Saint-Louis",
      description: "Transport de matériel critique pour filiale portuaire",
      agent: "Daniel Gomis",
      destination: "Saint-Louis, Sénégal",
      status: "inProgress",
      priority: "high",
      progress: 68,
      eta: "18:45"
    },
    {
      id: 2,
      title: "Audit Sécurité & Biométrie Hub Abidjan",
      description: "Mise à niveau des terminaux de pointage facial",
      agent: "Jean Dupont",
      destination: "Abidjan, Côte d'Ivoire",
      status: "inProgress",
      priority: "medium",
      progress: 42,
      eta: "Demain 10:00"
    }
  ],
  leaves: [
    {
      id: 1,
      employeeId: 2,
      employeeName: "Jean Dupont",
      type: "Congés annuels",
      startDate: "2026-06-15",
      endDate: "2026-06-25",
      days: 10,
      reason: "Congés estivaux",
      status: "approved"
    }
  ],
  leaveBalance: {
    annual: { total: 25, taken: 5, remaining: 20 },
    rtt: { total: 10, taken: 2, remaining: 8 }
  },
  payroll: [
    {
      id: 1,
      month: "Mai 2026",
      grossSalary: 3500,
      netSalary: 2750,
      bonuses: 250,
      overtimeHours: 180
    }
  ],
  fraudAlerts: [
    {
      id: 1,
      employee: "Daniel Gomis",
      type: "Pointage hors périmètre",
      time: "08:14",
      location: "Paris 12ème (Zone non autorisée)",
      severity: "warning",
      resolved: false
    }
  ],
  chatMessages: [
    {
      role: "assistant",
      text: "Bonjour ! Je suis l'Assistant RH IA SmartWorkforce. Comment puis-je vous aider aujourd'hui ?"
    }
  ]
};

// Charger les données depuis database.json ou initialiser avec defaultData
function loadData() {
  try {
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('⚠️ Erreur lecture database.json, initialisation :', err.message);
  }
  saveData(defaultData);
  return defaultData;
}

// Sauvegarde synchrone atomique et persistante
function saveData(dataToSave) {
  try {
    const jsonString = JSON.stringify(dataToSave, null, 2);
    fs.writeFileSync(dataPath, jsonString, 'utf8');
    return true;
  } catch (err) {
    console.error('❌ Erreur écriture database.json :', err.message);
    return false;
  }
}

const currentData = loadData();

module.exports = {
  driver: 'json',
  init: async () => true,
  data: currentData,
  dataPath: dataPath,

  // M�thodes d'ajout pour pointages et persistence
  addAttendanceRecord: async (record) => {
    currentData.attendanceRecords = currentData.attendanceRecords || [];
    currentData.attendanceRecords.unshift(record);
    saveData(currentData);
    return record;
  },
  saveData: () => saveData(currentData),
  saveDataDirect: (newData) => {
    Object.assign(currentData, newData);
    return saveData(currentData);
  },
  initDatabase: async () => {
    console.log('📦 Base de Données : Mode 100% JSON Autonome Actif');
    console.log(`📁 Fichier : ${dataPath}`);
    console.log('⚡ Aucun serveur MySQL externe requis !');
    return currentData;
  }
};
