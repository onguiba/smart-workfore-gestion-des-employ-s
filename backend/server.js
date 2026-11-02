const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const db = require('./db.js');

// Database layer: initialize with persistent data from db.js & Hostinger MySQL
let mockData = {
  user: null,
  hrUsers: db.getHRUsers().length > 0 ? db.getHRUsers() : [
    {
      id: 'hr-1',
      name: 'Sophie Laurent',
      email: 'sophie.laurent@smartworkforce.ai',
      role: 'Directrice des Ressources Humaines',
      department: 'Direction RH',
      phone: '+33 6 10 20 30 40',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      userType: 'hr',
      matricule: 'SWA-DIR-01'
    },
    {
      id: 'hr-2',
      name: 'Marie Martin',
      email: 'marie.martin@smartworkforce.ai',
      role: 'Responsable Recrutement & Talents',
      department: 'Ressources Humaines',
      phone: '+33 6 98 76 54 32',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      userType: 'hr',
      matricule: 'SWA-HR-02'
    }
  ],
  employees: db.getEmployees().length > 0 ? db.getEmployees() : [
    { id: 1, name: 'Moussa Diop', role: 'Superviseur Logistique', department: 'Operations', status: 'present', email: 'moussa.diop@smartworkforce.ai', phone: '+33 6 45 89 12 30', joinDate: '2023-01-15', salary: 45000, checkinTime: '08:24', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', userType: 'employee', matricule: 'SWA-8842' },
    { id: 2, name: 'Jean Dupont', role: 'Architecte Cloud & Systèmes', department: 'IT', status: 'present', email: 'jean.dupont@smartworkforce.ai', phone: '+33 6 12 34 56 78', joinDate: '2022-05-20', salary: 52000, checkinTime: '08:55', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', userType: 'employee', matricule: 'SWA-4910' },
    { id: 3, name: 'Marie Martin', role: 'Responsable Recrutement & Talents', department: 'HR', status: 'late', email: 'marie.martin@smartworkforce.ai', phone: '+33 6 98 76 54 32', joinDate: '2023-03-10', salary: 48000, checkinTime: '09:42', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', userType: 'employee', matricule: 'SWA-3301' },
    { id: 4, name: 'Daniel Gomis', role: 'Chauffeur Poids Lourd', department: 'Logistics', status: 'present', email: 'daniel.gomis@smartworkforce.ai', phone: '+33 6 55 44 33 22', joinDate: '2023-06-01', salary: 42000, checkinTime: '07:50', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', userType: 'employee', matricule: 'SWA-7219' },
    { id: 5, name: 'Lucas Mercier', role: 'Account Executive B2B', department: 'Sales', status: 'present', email: 'lucas.mercier@smartworkforce.ai', phone: '+33 6 77 88 99 00', joinDate: '2023-07-15', salary: 50000, checkinTime: '08:40', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', userType: 'employee', matricule: 'SWA-5541' },
    { id: 6, name: 'Sarah Perez', role: 'Chef de Produit IA', department: 'Marketing', status: 'absent', email: 'sarah.perez@smartworkforce.ai', phone: '+33 6 33 22 11 00', joinDate: '2023-08-20', salary: 47000, checkinTime: '-', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', userType: 'employee', matricule: 'SWA-6022' }
  ],
  attendanceRecords: (db.data && db.data.attendanceRecords) || [],
  attendance: (db.data && db.data.attendanceSummary) || {
    present: 142,
    absent: 8,
    onMission: 24,
    late: 12,
    rate: 94.7
  },
  trackingAgents: db.getTrackingAgents(),
  missions: db.getMissions(),
  leaves: db.getLeaves(),
  leaveBalance: db.getLeaveBalance(),
  performance: {
    punctuality: 96,
    productivity: 91,
    teamwork: 94,
    overall: 94,
    week: [90, 92, 95, 94, 96]
  },
  payroll: db.getPayroll(),
  fraudAlerts: db.getFraudAlerts(),
  chatMessages: [
    { role: 'assistant', text: 'Bonjour ! Je suis l\'Assistant RH IA SmartWorkforce. Comment puis-je vous aider aujourd\'hui (congés, pointage, fiches de paie, missions, plannings) ?' }
  ]
};

const server = http.createServer((req, res) => {
  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // API Routes
  if (pathname.startsWith('/api/')) {
    handleAPI(pathname, req, res);
    return;
  }

  // Serve static files
  if (pathname === '/') {
    pathname = '/home.html';
  }

  const filePath = path.join(FRONTEND_DIR, pathname);

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - File Not Found</h1>');
      return;
    }

    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.readFile(indexPath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - Not Found</h1>');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }

    // Read file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 - Internal Server Error</h1>');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'text/plain';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

// Handle API Routes
function handleAPI(pathname, req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Endpoints - Authentication & Biometrics
  if (pathname === '/api/auth/accounts') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      employees: mockData.employees,
      hrUsers: mockData.hrUsers
    }));
  }
  else if (pathname === '/api/auth/me') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      authenticated: !!mockData.user,
      data: mockData.user
    }));
  }
  else if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { email, role, name, userType, faceValidated } = payload;

        if (!email || !role) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: 'Email et travail/rôle obligatoires' }));
          return;
        }

        if (!faceValidated) {
          res.writeHead(403);
          res.end(JSON.stringify({ success: false, error: 'Scan facial 3D obligatoire avant d\'accéder à la base de données' }));
          return;
        }

        // Search in hrUsers or employees
        let matchedUser = null;
        if (userType === 'hr') {
          matchedUser = mockData.hrUsers.find(h => h.email.toLowerCase() === email.toLowerCase()) ||
                        mockData.hrUsers.find(h => h.role.toLowerCase().includes(role.toLowerCase()));
        } else {
          matchedUser = mockData.employees.find(e => e.email.toLowerCase() === email.toLowerCase()) ||
                        mockData.employees.find(e => e.role.toLowerCase().includes(role.toLowerCase()));
        }

        const authenticatedUser = {
          id: matchedUser ? matchedUser.id : (userType === 'hr' ? 'hr-' + Date.now() : 'emp-' + Date.now()),
          name: name || (matchedUser ? matchedUser.name : (userType === 'hr' ? 'Responsable RH' : 'Collaborateur')),
          email: email,
          role: role || (matchedUser ? matchedUser.role : (userType === 'hr' ? 'Direction RH' : 'Opérations')),
          department: matchedUser ? matchedUser.department : (userType === 'hr' ? 'Ressources Humaines' : 'Opérations'),
          avatar: matchedUser ? matchedUser.avatar : (userType === 'hr' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
          matricule: matchedUser ? matchedUser.matricule : (userType === 'hr' ? 'SWA-DIR-' + Math.floor(1000 + Math.random()*9000) : 'SWA-' + Math.floor(1000 + Math.random()*9000)),
          phone: matchedUser ? matchedUser.phone : '+33 6 12 34 56 78',
          userType: userType || (matchedUser ? matchedUser.userType : 'employee'),
          faceValidated: true,
          biometricScore: '99.8%',
          authTimestamp: new Date().toISOString(),
          sessionToken: 'swa_sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
        };

        mockData.user = authenticatedUser;

        // If employee is present, mark as checked in
        const existingEmp = mockData.employees.find(e => e.email.toLowerCase() === email.toLowerCase());
        if (existingEmp) {
          existingEmp.status = 'present';
          existingEmp.checkinTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Authentification faciale réussie. Accès à la base de données autorisé.',
          data: authenticatedUser
        }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'Données de connexion invalides' }));
      }
    });
  }
  else if (pathname === '/api/auth/logout' && req.method === 'POST') {
    mockData.user = null;
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'Déconnexion effectuée avec succès. Accès à la base de données révoqué.'
    }));
  }
  else if (pathname === '/api/user') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: mockData.user }));
  } 
  else if (pathname === '/api/employees') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: mockData.employees }));
  }
  else if (pathname === '/api/employees/count') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: { total: mockData.employees.length } }));
  }
  else if (pathname === '/api/attendance/summary') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: mockData.attendance }));
  }
  else if (pathname === '/api/attendance/today') {
    const presentEmployees = mockData.employees.filter(e => e.status === 'present');
    const absentEmployees = mockData.employees.filter(e => e.status === 'absent');
    const lateEmployees = mockData.employees.filter(e => e.status === 'late');
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      data: { 
        present: presentEmployees,
        absent: absentEmployees,
        late: lateEmployees,
        summary: mockData.attendance
      } 
    }));
  }
  else if (pathname === '/api/missions') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: mockData.missions }));
  }
  else if (pathname.match(/^\/api\/missions\/\d+$/)) {
    const id = parseInt(pathname.split('/').pop());
    const mission = mockData.missions.find(m => m.id === id);
    if (mission) {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data: mission }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, error: 'Mission not found' }));
    }
  }
  else if (pathname === '/api/attendance/checkin') {
    if (req.method === 'POST') {
      mockData.attendance.present++;
      res.writeHead(200);
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Check-in recorded successfully',
        timestamp: new Date().toISOString()
      }));
    }
  } 
  else if (pathname === '/api/attendance/checkout') {
    if (req.method === 'POST') {
      res.writeHead(200);
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Check-out recorded successfully',
        timestamp: new Date().toISOString()
      }));
    }
  }
  else if (pathname === '/api/leaves') {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: mockData.leaves }));
  }
  else if (pathname === '/api/leaves/balance') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      data: mockData.leaveBalance
    }));
  }
  else if (pathname === '/api/leaves/request') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = JSON.parse(body);
        const newLeave = {
          id: mockData.leaves.length + 1,
          type: data.type,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'pending',
          days: data.days || 1,
          reason: data.reason
        };
        mockData.leaves.push(newLeave);
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, message: 'Leave request submitted', data: newLeave }));
      });
    }
  }
  else if (pathname === '/api/performance') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      data: mockData.performance
    }));
  }
  else if (pathname === '/api/payroll') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      data: mockData.payroll
    }));
  }
  else if (pathname === '/api/payroll/calculate') {
    if (req.method === 'POST') {
      res.writeHead(200);
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Payroll calculated successfully',
        data: mockData.payroll
      }));
    }
  }
  else if (pathname === '/api/fraud/alerts') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      data: mockData.fraudAlerts
    }));
  }
  else if (pathname === '/api/fraud/alerts/resolve') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = JSON.parse(body);
        const alert = mockData.fraudAlerts.find(a => a.id === data.alertId);
        if (alert) {
          alert.resolved = true;
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, message: 'Alert resolved' }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ success: false, error: 'Alert not found' }));
        }
      });
    }
  }
  else if (pathname === '/api/tracking/agents') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      data: mockData.trackingAgents 
    }));
  }
  else if (pathname === '/api/employees' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const newEmployee = {
          id: mockData.employees.length + 1,
          name: data.name || 'Nouvel Employé',
          role: data.role || 'Collaborateur',
          department: data.department || 'Operations',
          status: 'present',
          email: data.email || `employe${mockData.employees.length + 1}@smartworkforce.ai`,
          phone: data.phone || '+33 6 00 00 00 00',
          joinDate: new Date().toISOString().split('T')[0],
          salary: parseInt(data.salary) || 40000,
          checkinTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        mockData.employees.unshift(newEmployee);
        mockData.attendance.present++;
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, message: 'Employé ajouté avec succès', data: newEmployee }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'Données invalides' }));
      }
    });
  }
  else if (pathname === '/api/missions/create' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const newMission = {
          id: mockData.missions.length + 1,
          title: data.title || 'Nouvelle Mission Terrain',
          status: 'inProgress',
          progress: 10,
          dueTime: data.dueTime || '18:00',
          location: data.location || 'Paris Centre',
          assignee: data.assignee || 'Moussa Diop',
          priority: data.priority || 'Normale'
        };
        mockData.missions.unshift(newMission);
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, message: 'Mission planifiée avec succès', data: newMission }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'Données invalides' }));
      }
    });
  }
  else if (pathname === '/api/missions/update' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const mission = mockData.missions.find(m => m.id === parseInt(data.missionId));
        if (mission) {
          if (data.status) mission.status = data.status;
          if (data.progress !== undefined) mission.progress = parseInt(data.progress);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, message: 'Mission mise à jour', data: mission }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ success: false, error: 'Mission introuvable' }));
        }
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'Erreur lors de la mise à jour' }));
      }
    });
  }
  else if (pathname === '/api/leaves/approve' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const leave = mockData.leaves.find(l => l.id === parseInt(data.leaveId));
        if (leave) {
          leave.status = data.status || 'approved';
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, message: `Demande ${leave.status}`, data: leave }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ success: false, error: 'Demande introuvable' }));
        }
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'Données invalides' }));
      }
    });
  }
  else if (pathname === '/api/fraud/scan' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      message: 'Scan IA terminé',
      results: {
        scoreSecurite: 98.4,
        anomaliesDetectees: mockData.fraudAlerts.filter(a => !a.resolved).length,
        statutReseau: 'Optimal',
        horodatage: new Date().toISOString()
      }
    }));
  }
  else if (pathname === '/api/chatbot/message') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const userMessage = (data.message || '').toLowerCase();
          
          let response = "Je suis l'assistant intelligent SmartWorkforce AI. Je peux vous renseigner sur les absences, le pointage biométrique, les congés, vos bulletins de paie, les missions et le suivi terrain.";
          
          if (userMessage.includes('absent') || userMessage.includes('absence')) {
            const absents = mockData.employees.filter(e => e.status === 'absent').map(e => e.name).join(', ') || 'aucun';
            response = `📊 Bilan présence : Il y a ${mockData.attendance.absent} employés absents aujourd'hui (${absents}). Les équipes sont informées pour le rééquilibrage de charge.`;
          } else if (userMessage.includes('retard') || userMessage.includes('ponctualité')) {
            response = `⏰ ${mockData.attendance.late} retards signalés aujourd'hui (notamment Marie Martin, arrivée à 09:42). Taux de ponctualité global : ${mockData.performance.punctuality}%.`;
          } else if (userMessage.includes('mission') || userMessage.includes('tâche')) {
            const inProg = mockData.missions.filter(m => m.status === 'inProgress');
            response = `🚀 Actuellement ${inProg.length} missions en cours d'exécution. Dont "Livraison Express Client ABC" par Moussa Diop (progression: 65%). Tout est dans les temps !`;
          } else if (userMessage.includes('congé') || userMessage.includes('conge') || userMessage.includes('vacance') || userMessage.includes('rtt')) {
            response = `🌴 Vous disposez actuellement de ${mockData.leaveBalance.annual.remaining} jours de congés payés et ${mockData.leaveBalance.rtt.remaining} jours de RTT restants. Souhaitez-vous déposer une demande dès maintenant via l'onglet Congés ?`;
          } else if (userMessage.includes('performance') || userMessage.includes('score') || userMessage.includes('productiv')) {
            response = `⭐ Votre score de performance globale est de ${mockData.performance.overall}% (Ponctualité: ${mockData.performance.punctuality}%, Productivité: ${mockData.performance.productivity}%). Félicitations pour votre régularité !`;
          } else if (userMessage.includes('salaire') || userMessage.includes('paie') || userMessage.includes('bulletin') || userMessage.includes('virement')) {
            response = `💰 Votre salaire net du mois de Mai 2026 s'élève à ${mockData.payroll[0].netSalary} € (Brut : ${mockData.payroll[0].grossSalary} € + 250 € primes + 180 € heures sup). Le bulletin de paie certifié est téléchargeable dans l'Espace Paie.`;
          } else if (userMessage.includes('fraude') || userMessage.includes('sécurité') || userMessage.includes('alerte')) {
            const activeAlerts = mockData.fraudAlerts.filter(a => !a.resolved);
            response = `🛡️ Sécurité IA : ${activeAlerts.length} alerte(s) active(s) nécessitent votre attention (dont une alerte Fake GPS sur Daniel Gomis). Vous pouvez les investiguer dans le module Anti-Fraude.`;
          } else if (userMessage.includes('bonjour') || userMessage.includes('salut') || userMessage.includes('coucou')) {
            response = `Bonjour ${mockData.user.name} ! C'est un plaisir de vous assister. Comment puis-je vous aider aujourd'hui ?`;
          } else if (userMessage.includes('pointage') || userMessage.includes('pointer') || userMessage.includes('présence')) {
            response = `✅ Vous pouvez pointer votre présence instantanément via la reconnaissance faciale Face ID ou le scan QR code depuis la page d'accueil ou l'espace employé. Dernier pointage enregistré : 08:24.`;
          }
          
          mockData.chatMessages.push({ role: 'user', text: data.message });
          mockData.chatMessages.push({ role: 'assistant', text: response });
          
          res.writeHead(200);
          res.end(JSON.stringify({ 
            success: true, 
            message: response,
            messages: mockData.chatMessages
          }));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: 'Erreur message' }));
        }
      });
    }
  }
  else if (pathname === '/api/chatbot/messages') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      data: mockData.chatMessages
    }));
  }
  else if (pathname === '/api/analytics/summary') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      data: {
        totalEmployees: mockData.employees.length,
        presentToday: mockData.attendance.present,
        absentToday: mockData.attendance.absent,
        lateToday: mockData.attendance.late,
        activeMissions: mockData.missions.filter(m => m.status === 'inProgress').length,
        fraudAlerts: mockData.fraudAlerts.filter(a => !a.resolved).length,
        avgPerformance: mockData.performance.overall
      }
    }));
  }
  else if (pathname === '/api/reports/generate') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = JSON.parse(body);
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Rapport officiel généré avec succès',
          reportType: data.reportType || 'Rapport RH Mensuel',
          fileName: 'rapport_smartworkforce_' + Date.now() + '.pdf'
        }));
      });
    }
  }
  else if (pathname.startsWith('/api/employees/search')) {
    const query = pathname.split('?q=')[1] || '';
    const results = mockData.employees.filter(e => 
      e.name.toLowerCase().includes(decodeURIComponent(query).toLowerCase()) ||
      e.department.toLowerCase().includes(decodeURIComponent(query).toLowerCase())
    );
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: results }));
  }
  // NOUVELLE API: Inscription d'employé avec photo et localisation
  else if (pathname === '/api/employees/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // Vérifier si l'email existe déjà
        const existingEmployee = mockData.employees.find(e => e.email === data.email);
        if (existingEmployee) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: 'Cet email est déjà enregistré' }));
          return;
        }
        
        // Créer le nouvel employé
        const newEmployee = {
          id: mockData.employees.length + 1,
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          position: data.position,
          role: data.position,
          department: data.department,
          salary: data.salary,
          photo: data.photo, // Photo en base64
          joinDate: data.registrationDate || new Date().toLocaleDateString('fr-FR'),
          registrationTime: data.registrationHour,
          registrationLocation: data.location,
          status: 'present',
          matricule: 'SWA-' + Math.floor(1000 + Math.random() * 9000),
          userType: 'employee',
          avatar: data.photo, // Utiliser la photo capturée comme avatar
          checkInTime: data.registrationHour,
          checkInLocation: data.location,
          createdAt: new Date().toISOString()
        };
        
        mockData.employees.push(newEmployee);
        mockData.attendance.present++;
        if (db && db.data) {
          db.data.employees = mockData.employees;
          db.saveToDisk();
        }
        
        console.log(`✅ Nouvel employé inscrit: ${newEmployee.name} (${newEmployee.email})`);
        console.log(`📍 Localisation: Lat ${data.location.latitude}, Long ${data.location.longitude}`);
        console.log(`⏰ Heure d'inscription: ${data.registrationHour}`);
        
        res.writeHead(201);
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Inscription réussie',
          data: newEmployee
        }));
      } catch (err) {
        console.error('Erreur inscription:', err);
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'Données d\'inscription invalides' }));
      }
    });
  }
  // NOUVELLE API: Identifier un employé par email (pour le pointage)
  else if (pathname === '/api/employees/identify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const employee = mockData.employees.find(e => e.email.toLowerCase() === data.email.toLowerCase());
        
        if (employee) {
          res.writeHead(200);
          res.end(JSON.stringify({ 
            success: true, 
            employee: employee
          }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ 
            success: false, 
            error: 'Employé non trouvé. Veuillez vous inscrire d\'abord.' 
          }));
        }
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'Erreur d\'identification' }));
      }
    });
  }
  // MISE À JOUR API: Pointage d'arrivée avec photo et localisation
  else if (pathname === '/api/attendance/checkin' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // Créer l'enregistrement de pointage
        const attendanceRecord = {
          id: mockData.attendanceRecords.length + 1,
          employeeId: data.employeeId,
          employeeEmail: data.employeeEmail,
          type: 'checkin',
          checkInTime: data.checkInTime,
          checkInTimeFormatted: data.checkInTimeFormatted,
          checkInDate: data.checkInDate,
          location: data.location,
          photo: data.photo,
          timestamp: new Date().toISOString()
        };
        
        mockData.attendanceRecords.push(attendanceRecord);
        
        // Mettre à jour l'employé
        const employee = mockData.employees.find(e => e.email === data.employeeEmail);
        if (employee) {
          employee.checkInTime = data.checkInTimeFormatted;
          employee.checkInLocation = data.location;
          employee.status = 'present';
        }
        
        mockData.attendance.present++;
        if (db && db.data) {
          db.data.attendanceRecords = mockData.attendanceRecords;
          db.data.employees = mockData.employees;
          db.saveToDisk();
        }
        
        console.log(`✅ Pointage arrivée: ${data.employeeEmail}`);
        console.log(`⏰ Heure: ${data.checkInTimeFormatted}`);
        console.log(`📍 Position: Lat ${data.location.latitude}, Long ${data.location.longitude}`);
        
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Arrivée enregistrée',
          timestamp: new Date().toISOString(),
          data: attendanceRecord
        }));
      } catch (err) {
        console.error('Erreur check-in:', err);
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'Erreur lors du pointage' }));
      }
    });
  }
  // MISE À JOUR API: Pointage de départ avec photo et localisation
  else if (pathname === '/api/attendance/checkout' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // Créer l'enregistrement de pointage
        const attendanceRecord = {
          id: mockData.attendanceRecords.length + 1,
          employeeId: data.employeeId,
          employeeEmail: data.employeeEmail,
          type: 'checkout',
          checkOutTime: data.checkOutTime,
          checkOutTimeFormatted: data.checkOutTimeFormatted,
          checkOutDate: data.checkOutDate,
          location: data.location,
          photo: data.photo,
          timestamp: new Date().toISOString()
        };
        
        mockData.attendanceRecords.push(attendanceRecord);
        
        // Mettre à jour l'employé
        const employee = mockData.employees.find(e => e.email === data.employeeEmail);
        if (employee) {
          employee.checkOutTime = data.checkOutTimeFormatted;
          employee.checkOutLocation = data.location;
          employee.status = 'absent';
        }
        
        if (db && db.data) {
          db.data.attendanceRecords = mockData.attendanceRecords;
          db.data.employees = mockData.employees;
          db.saveToDisk();
        }
        
        console.log(`🚪 Pointage départ: ${data.employeeEmail}`);
        console.log(`⏰ Heure: ${data.checkOutTimeFormatted}`);
        console.log(`📍 Position: Lat ${data.location.latitude}, Long ${data.location.longitude}`);
        
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Départ enregistré',
          timestamp: new Date().toISOString(),
          data: attendanceRecord
        }));
      } catch (err) {
        console.error('Erreur check-out:', err);
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'Erreur lors du pointage' }));
      }
    });
  }
  // NOUVELLE API: Obtenir l'historique des pointages
  else if (pathname === '/api/attendance/history') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      data: mockData.attendanceRecords 
    }));
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Point de terminaison API introuvable' }));
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║       🎉 Smart Workforce AI - NOUVEAU SYSTÈME ! 🎉                 ║
║                                                                    ║
║   🌐 URL: http://localhost:${PORT}                            ║
║                                                                    ║
║   ✨ NOUVEAUTÉS :                                                  ║
║   ├─ 📸 /register.html       - Inscription (Caméra + GPS)          ║
║   └─ ⏰ /attendance.html      - Pointage Arrivée/Départ            ║
║                                                                    ║
║   📱 Pages Disponibles :                                           ║
║   ├─ /                       - Accueil Hub Principal               ║
║   ├─ /chat.html              - Assistant RH IA Copilot             ║
║   ├─ /tracking.html          - Suivi GPS & Cartographie            ║
║   ├─ /payroll.html           - Rémunérations & Paie                ║
║   ├─ /leaves.html            - Soldes & Congés                     ║
║   ├─ /missions.html          - Dispatching des Missions            ║
║   └─ /fraud-detection.html   - Centre Anti-Fraude SOC              ║
║                                                                    ║
║   ℹ️  Ctrl+C pour arrêter le serveur                               ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
  `);
  console.log(`✅ Serveur lancé avec succès !`);
  console.log(`🔗 Ouvrez votre navigateur sur : http://localhost:${PORT}`);
  console.log(``);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎯 NOUVEAU : Plus de comptes de test !`);
  console.log(`   1. Inscrivez-vous : http://localhost:${PORT}/register.html`);
  console.log(`   2. Pointez : http://localhost:${PORT}/attendance.html`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(``);
});

// Handle errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} déjà utilisé. Essayez un autre port.`);
  } else {
    console.error('Erreur serveur:', err);
  }
});
