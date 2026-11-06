/**
 * TSA SmartWorkforce AI™ — Module de Base de Données Universel
 * Supporte :
 * 1. PostgreSQL (Neon Cloud / Heroku / AWS)
 * 2. MySQL / MariaDB (Hostinger hPanel / Docker VPS)
 * 3. Fichier JSON Persistant (Fallback local résilient)
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DATA_DIR = fs.existsSync(path.join(__dirname, 'data')) 
  ? path.join(__dirname, 'data') 
  : path.join(__dirname, '..', 'data');
const JSON_DB_FILE = path.join(DATA_DIR, 'database.json');

// Données initiales de démarrage
const SEED_DATA = {
  hrUsers: [
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
  employees: [
    { id: 1, name: 'Moussa Diop', role: 'Superviseur Logistique', position: 'Superviseur Logistique', department: 'Operations', status: 'present', email: 'moussa.diop@smartworkforce.ai', phone: '+33 6 45 89 12 30', joinDate: '2023-01-15', salary: 45000, checkinTime: '08:24', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', userType: 'employee', matricule: 'SWA-8842' },
    { id: 2, name: 'Jean Dupont', role: 'Architecte Cloud & Systèmes', position: 'Architecte Cloud & Systèmes', department: 'IT', status: 'present', email: 'jean.dupont@smartworkforce.ai', phone: '+33 6 12 34 56 78', joinDate: '2022-05-20', salary: 52000, checkinTime: '08:55', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', userType: 'employee', matricule: 'SWA-4910' },
    { id: 3, name: 'Marie Martin', role: 'Responsable Recrutement & Talents', position: 'Responsable Recrutement & Talents', department: 'HR', status: 'late', email: 'marie.martin@smartworkforce.ai', phone: '+33 6 98 76 54 32', joinDate: '2023-03-10', salary: 48000, checkinTime: '09:42', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', userType: 'employee', matricule: 'SWA-3301' },
    { id: 4, name: 'Daniel Gomis', role: 'Chauffeur Poids Lourd', position: 'Chauffeur Poids Lourd', department: 'Logistics', status: 'present', email: 'daniel.gomis@smartworkforce.ai', phone: '+33 6 55 44 33 22', joinDate: '2023-06-01', salary: 42000, checkinTime: '07:50', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', userType: 'employee', matricule: 'SWA-7219' },
    { id: 5, name: 'Lucas Mercier', role: 'Account Executive B2B', position: 'Account Executive B2B', department: 'Sales', status: 'present', email: 'lucas.mercier@smartworkforce.ai', phone: '+33 6 77 88 99 00', joinDate: '2023-07-15', salary: 50000, checkinTime: '08:40', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', userType: 'employee', matricule: 'SWA-5541' },
    { id: 6, name: 'Sarah Perez', role: 'Chef de Produit IA', position: 'Chef de Produit IA', department: 'Marketing', status: 'absent', email: 'sarah.perez@smartworkforce.ai', phone: '+33 6 33 22 11 00', joinDate: '2023-08-20', salary: 47000, checkinTime: '-', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', userType: 'employee', matricule: 'SWA-6022' }
  ],
  attendanceRecords: [],
  attendance: {
    present: 142,
    absent: 8,
    onMission: 24,
    late: 12,
    rate: 94.7
  },
  attendanceSummary: {
    present: 142,
    absent: 8,
    onMission: 24,
    late: 12,
    rate: 94.7
  },
  missions: [
    { id: 1, title: 'Livraison Convoi Sécurisé Dakar-Saint-Louis', description: 'Transport de matériel critique pour filiale portuaire', agent: 'Daniel Gomis', destination: 'Saint-Louis, Sénégal', status: 'inProgress', priority: 'high', progress: 68, eta: '18:45' },
    { id: 2, title: 'Audit Sécurité & Biométrie Hub Abidjan', description: 'Mise à niveau des terminaux de pointage facial', agent: 'Jean Dupont', destination: 'Abidjan, Côte d\'Ivoire', status: 'inProgress', priority: 'medium', progress: 42, eta: 'Demain 10:00' }
  ],
  leaves: [
    { id: 1, employeeId: 2, employeeName: 'Jean Dupont', type: 'Congés annuels', startDate: '2026-06-15', endDate: '2026-06-25', days: 10, reason: 'Congés estivaux', status: 'approved' }
  ],
  leaveBalance: {
    annual: { total: 25, taken: 5, remaining: 20 },
    rtt: { total: 10, taken: 2, remaining: 8 }
  },
  payroll: [
    { id: 1, month: 'Mai 2026', grossSalary: 3500, netSalary: 2750, bonuses: 250, overtimeHours: 180 }
  ],
  fraudAlerts: [
    { id: 1, employee: 'Daniel Gomis', type: 'Pointage hors périmètre', time: '08:14', location: 'Paris 12ème (Zone non autorisée)', severity: 'warning', resolved: false }
  ],
  chatMessages: [
    { role: 'assistant', text: 'Bonjour ! Je suis l\'Assistant RH IA SmartWorkforce. Comment puis-je vous aider aujourd\'hui (congés, pointage, fiches de paie, missions, plannings) ?' }
  ]
};

class DatabaseManager {
  constructor() {
    this.driver = 'embedded'; // 'embedded' (défaut autonome), 'postgres', ou 'mysql'
    this.pgPool = null;
    this.mysqlPool = null;
    this.data = JSON.parse(JSON.stringify(SEED_DATA));
  }

  async init() {
    // S'assurer que le dossier data existe
    if (!fs.existsSync(DATA_DIR)) {
      try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) { }
    }

    // Charger les données de la base intégrée
    this.loadFromDisk();

    // 1. Tenter PostgreSQL UNIQUEMENT si explicitement demandé (DB_DRIVER=postgres)
    if (process.env.DB_DRIVER === 'postgres' && process.env.DATABASE_URL) {
      try {
        const { Pool } = require('pg');
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000
        });

        await pool.query('SELECT NOW()');
        this.pgPool = pool;
        this.driver = 'postgres';
        console.log('✅ Base de Données : Connecté à PostgreSQL (Neon Cloud)');
        await this.initPostgresSchema();
        await this.loadPostgresData();
        return;
      } catch (err) {
        console.warn('⚠️ Connexion PostgreSQL échouée, retour au mode intégré...', err.message);
      }
    }

    // 2. Tenter MySQL UNIQUEMENT si explicitement demandé (DB_DRIVER=mysql)
    if (process.env.DB_DRIVER === 'mysql' && process.env.DB_HOST) {
      try {
        const mysql = require('mysql2/promise');
        const pool = mysql.createPool({
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '3306', 10),
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'smartworkforce',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          connectTimeout: 5000
        });

        await pool.query('SELECT 1');
        this.mysqlPool = pool;
        this.driver = 'mysql';
        console.log(`✅ Base de Données : Connecté à MySQL (${process.env.DB_HOST})`);
        await this.initMySQLSchema();
        await this.loadMySQLData();
        return;
      } catch (err) {
        console.warn('⚠️ Connexion MySQL échouée, retour au mode intégré...', err.message);
      }
    }

    // 3. Mode par défaut : Base de données intégrée autonome à l'application
    this.driver = 'embedded';
    console.log('📦 Base de Données : Mode INTÉGRÉ à l\'application actif');
    console.log('📁 Fichier de données autonome : ' + JSON_DB_FILE);
    console.log('⚡ Fonctionne directement dans l\'application : aucune configuration externe requise !');
    this.saveToDisk();
  }

  // -------------------------------------------------------------
  // Gestion JSON Locale (Zéro Perte)
  // -------------------------------------------------------------
  loadFromDisk() {
    if (fs.existsSync(JSON_DB_FILE)) {
      try {
        const raw = fs.readFileSync(JSON_DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      } catch (e) {
        console.error('Erreur lecture database.json:', e);
      }
    } else {
      this.saveToDisk();
    }
  }

  saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(JSON_DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Erreur écriture database.json:', e);
    }
  }

  // -------------------------------------------------------------
  // PostgreSQL Schema & Sync
  // -------------------------------------------------------------
  async initPostgresSchema() {
    const schema = `
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(100) NOT NULL,
        department VARCHAR(100) DEFAULT 'Ressources Humaines',
        user_type VARCHAR(30) DEFAULT 'employee',
        matricule VARCHAR(50) UNIQUE,
        phone VARCHAR(30),
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(30),
        position VARCHAR(100),
        role VARCHAR(100),
        department VARCHAR(100),
        salary DECIMAL(10, 2) DEFAULT 0.00,
        matricule VARCHAR(50) UNIQUE,
        user_type VARCHAR(30) DEFAULT 'employee',
        status VARCHAR(30) DEFAULT 'present',
        photo TEXT,
        avatar TEXT,
        join_date VARCHAR(50),
        registration_hour VARCHAR(20),
        checkin_time VARCHAR(20) DEFAULT '-',
        location JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        employee_id INT,
        employee_email VARCHAR(150) NOT NULL,
        type VARCHAR(30) NOT NULL,
        check_time VARCHAR(50),
        check_time_formatted VARCHAR(20),
        check_date VARCHAR(30),
        location JSONB,
        photo TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leaves (
        id SERIAL PRIMARY KEY,
        employee_id INT,
        employee_email VARCHAR(150),
        employee_name VARCHAR(150),
        type VARCHAR(50) NOT NULL,
        start_date VARCHAR(30) NOT NULL,
        end_date VARCHAR(30) NOT NULL,
        days INT DEFAULT 1,
        reason TEXT,
        status VARCHAR(30) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS missions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        agent VARCHAR(150),
        destination VARCHAR(200),
        status VARCHAR(30) DEFAULT 'inProgress',
        priority VARCHAR(30) DEFAULT 'medium',
        progress INT DEFAULT 0,
        eta VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payroll (
        id SERIAL PRIMARY KEY,
        employee_id INT,
        employee_email VARCHAR(150),
        month VARCHAR(50) NOT NULL,
        gross_salary DECIMAL(10, 2) NOT NULL,
        net_salary DECIMAL(10, 2) NOT NULL,
        bonuses DECIMAL(10, 2) DEFAULT 0.00,
        overtime_hours INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fraud_alerts (
        id SERIAL PRIMARY KEY,
        employee_name VARCHAR(150),
        employee_email VARCHAR(150),
        type VARCHAR(100) NOT NULL,
        severity VARCHAR(30) DEFAULT 'medium',
        description TEXT,
        time VARCHAR(50),
        location JSONB,
        resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(150),
        role VARCHAR(30) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.pgPool.query(schema);

    // Initialiser les données si vides
    const empCheck = await this.pgPool.query('SELECT COUNT(*) FROM employees');
    if (parseInt(empCheck.rows[0].count, 10) === 0) {
      for (const e of SEED_DATA.employees) {
        await this.pgPool.query(
          `INSERT INTO employees (name, email, phone, position, role, department, salary, matricule, status, checkin_time, avatar, user_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (email) DO NOTHING`,
          [e.name, e.email, e.phone, e.position || e.role, e.role, e.department, e.salary, e.matricule, e.status, e.checkinTime, e.avatar, e.userType || 'employee']
        );
      }
    }

    const hrCheck = await this.pgPool.query('SELECT COUNT(*) FROM users');
    if (parseInt(hrCheck.rows[0].count, 10) === 0) {
      for (const h of SEED_DATA.hrUsers) {
        await this.pgPool.query(
          `INSERT INTO users (id, name, email, role, department, user_type, matricule, phone, avatar)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (email) DO NOTHING`,
          [h.id, h.name, h.email, h.role, h.department, h.userType, h.matricule, h.phone, h.avatar]
        );
      }
    }
  }

  async loadPostgresData() {
    try {
      const empRes = await this.pgPool.query('SELECT * FROM employees ORDER BY id ASC');
      if (empRes.rows.length > 0) {
        this.data.employees = empRes.rows.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          position: r.position,
          role: r.role,
          department: r.department,
          salary: parseFloat(r.salary) || 0,
          matricule: r.matricule,
          status: r.status,
          avatar: r.avatar || r.photo,
          photo: r.photo,
          checkinTime: r.checkin_time,
          joinDate: r.join_date,
          userType: r.user_type,
          location: r.location
        }));
      }

      const hrRes = await this.pgPool.query('SELECT * FROM users WHERE user_type = $1', ['hr']);
      if (hrRes.rows.length > 0) {
        this.data.hrUsers = hrRes.rows.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          role: r.role,
          department: r.department,
          phone: r.phone,
          avatar: r.avatar,
          userType: r.user_type,
          matricule: r.matricule
        }));
      }

      const attRes = await this.pgPool.query('SELECT * FROM attendance ORDER BY id ASC');
      this.data.attendanceRecords = attRes.rows.map(r => ({
        id: r.id,
        employeeId: r.employee_id,
        employeeEmail: r.employee_email,
        type: r.type,
        checkInTime: r.check_time,
        checkInTimeFormatted: r.check_time_formatted,
        checkInDate: r.check_date,
        checkOutTime: r.check_time,
        checkOutTimeFormatted: r.check_time_formatted,
        checkOutDate: r.check_date,
        location: r.location,
        photo: r.photo,
        timestamp: r.timestamp
      }));
    } catch (err) {
      console.error('Erreur chargement Postgres:', err);
    }
  }

  // -------------------------------------------------------------
  // MySQL Schema & Sync
  // -------------------------------------------------------------
  async initMySQLSchema() {
    const sqlFile = path.join(__dirname, '..', 'hostinger_database.sql');
    if (fs.existsSync(sqlFile)) {
      const sql = fs.readFileSync(sqlFile, 'utf8');
      const statements = sql
        .split(/;\s*$/m)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
      for (const stmt of statements) {
        try {
          await this.mysqlPool.query(stmt);
        } catch (e) {
          // Ignorer erreurs de table déjà existante
        }
      }
    }
  }

  async loadMySQLData() {
    try {
      const [empRows] = await this.mysqlPool.query('SELECT * FROM employees ORDER BY id ASC');
      if (empRows && empRows.length > 0) {
        this.data.employees = empRows.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          position: r.position,
          role: r.role,
          department: r.department,
          salary: parseFloat(r.salary) || 0,
          matricule: r.matricule,
          status: r.status,
          avatar: r.avatar || r.photo,
          photo: r.photo,
          checkinTime: r.checkin_time,
          joinDate: r.join_date,
          userType: r.user_type,
          location: typeof r.location === 'string' ? JSON.parse(r.location) : r.location
        }));
      }

      const [attRows] = await this.mysqlPool.query('SELECT * FROM attendance ORDER BY id ASC');
      if (attRows) {
        this.data.attendanceRecords = attRows.map(r => ({
          id: r.id,
          employeeId: r.employee_id,
          employeeEmail: r.employee_email,
          type: r.type,
          checkInTime: r.check_time,
          checkInTimeFormatted: r.check_time_formatted,
          checkInDate: r.check_date,
          checkOutTime: r.check_time,
          checkOutTimeFormatted: r.check_time_formatted,
          checkOutDate: r.check_date,
          location: typeof r.location === 'string' ? JSON.parse(r.location) : r.location,
          photo: r.photo,
          timestamp: r.timestamp
        }));
      }
    } catch (err) {
      console.error('Erreur chargement MySQL:', err);
    }
  }

  // -------------------------------------------------------------
  // Méthodes Métier CRUD Asynchrones
  // -------------------------------------------------------------
  async addEmployee(emp) {
    // 1. Mise à jour mémoire
    this.data.employees.push(emp);
    if (this.data.attendance) {
      this.data.attendance.present = (this.data.attendance.present || 0) + 1;
    }
    this.saveToDisk();

    // 2. Persistance PostgreSQL
    if (this.driver === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `INSERT INTO employees (name, email, phone, position, role, department, salary, matricule, status, photo, avatar, join_date, registration_hour, checkin_time, location, user_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           RETURNING id`,
          [
            emp.name,
            emp.email,
            emp.phone || '',
            emp.position || emp.role || '',
            emp.role || emp.position || '',
            emp.department || 'Operations',
            emp.salary || 0,
            emp.matricule,
            emp.status || 'present',
            emp.photo || null,
            emp.avatar || emp.photo || null,
            emp.joinDate || '',
            emp.registrationTime || '',
            emp.checkInTime || emp.checkinTime || '-',
            emp.registrationLocation ? JSON.stringify(emp.registrationLocation) : null,
            emp.userType || 'employee'
          ]
        );
        if (res.rows[0]) emp.id = res.rows[0].id;
      } catch (err) {
        console.error('Erreur insertion employé PostgreSQL:', err.message);
      }
    }

    // 3. Persistance MySQL
    if (this.driver === 'mysql' && this.mysqlPool) {
      try {
        const [res] = await this.mysqlPool.query(
          `INSERT INTO employees (name, email, phone, position, role, department, salary, matricule, status, photo, avatar, join_date, registration_hour, checkin_time, location, user_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            emp.name,
            emp.email,
            emp.phone || '',
            emp.position || emp.role || '',
            emp.role || emp.position || '',
            emp.department || 'Operations',
            emp.salary || 0,
            emp.matricule,
            emp.status || 'present',
            emp.photo || null,
            emp.avatar || emp.photo || null,
            emp.joinDate || '',
            emp.registrationTime || '',
            emp.checkInTime || emp.checkinTime || '-',
            emp.registrationLocation ? JSON.stringify(emp.registrationLocation) : null,
            emp.userType || 'employee'
          ]
        );
        if (res.insertId) emp.id = res.insertId;
      } catch (err) {
        console.error('Erreur insertion employé MySQL:', err.message);
      }
    }

    return emp;
  }

  async addAttendanceRecord(record) {
    this.data.attendanceRecords.push(record);

    // Mettre à jour l'employé correspondant en mémoire
    const emp = this.data.employees.find(e => e.email.toLowerCase() === record.employeeEmail.toLowerCase());
    if (emp) {
      if (record.type === 'checkin') {
        emp.status = 'present';
        emp.checkinTime = record.checkInTimeFormatted;
        emp.checkInTime = record.checkInTimeFormatted;
        emp.checkInLocation = record.location;
      } else {
        emp.status = 'absent';
        emp.checkOutTime = record.checkOutTimeFormatted;
        emp.checkOutLocation = record.location;
      }
    }

    this.saveToDisk();

    // Persistance PostgreSQL
    if (this.driver === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO attendance (employee_id, employee_email, type, check_time, check_time_formatted, check_date, location, photo)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            record.employeeId || (emp ? emp.id : null),
            record.employeeEmail,
            record.type,
            record.checkInTime || record.checkOutTime || '',
            record.checkInTimeFormatted || record.checkOutTimeFormatted || '',
            record.checkInDate || record.checkOutDate || '',
            record.location ? JSON.stringify(record.location) : null,
            record.photo || null
          ]
        );

        if (emp && emp.id) {
          await this.pgPool.query(
            `UPDATE employees SET status = $1, checkin_time = $2 WHERE id = $3`,
            [emp.status, emp.checkinTime || '-', emp.id]
          );
        }
      } catch (err) {
        console.error('Erreur attendance PostgreSQL:', err.message);
      }
    }

    // Persistance MySQL
    if (this.driver === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO attendance (employee_id, employee_email, type, check_time, check_time_formatted, check_date, location, photo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record.employeeId || (emp ? emp.id : null),
            record.employeeEmail,
            record.type,
            record.checkInTime || record.checkOutTime || '',
            record.checkInTimeFormatted || record.checkOutTimeFormatted || '',
            record.checkInDate || record.checkOutDate || '',
            record.location ? JSON.stringify(record.location) : null,
            record.photo || null
          ]
        );

        if (emp && emp.id) {
          await this.mysqlPool.query(
            `UPDATE employees SET status = ?, checkin_time = ? WHERE id = ?`,
            [emp.status, emp.checkinTime || '-', emp.id]
          );
        }
      } catch (err) {
        console.error('Erreur attendance MySQL:', err.message);
      }
    }

    return record;
  }

  async addLeave(leave) {
    leave.id = this.data.leaves.length + 1;
    this.data.leaves.push(leave);
    this.saveToDisk();

    if (this.driver === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO leaves (employee_id, employee_email, employee_name, type, start_date, end_date, days, reason, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [leave.employeeId || null, leave.employeeEmail || '', leave.employeeName || '', leave.type, leave.startDate, leave.endDate, leave.days || 1, leave.reason || '', leave.status || 'pending']
        );
      } catch (e) {
        console.error('Erreur leave PostgreSQL:', e.message);
      }
    }

    if (this.driver === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO leaves (employee_id, employee_email, employee_name, type, start_date, end_date, days, reason, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [leave.employeeId || null, leave.employeeEmail || '', leave.employeeName || '', leave.type, leave.startDate, leave.endDate, leave.days || 1, leave.reason || '', leave.status || 'pending']
        );
      } catch (e) {
        console.error('Erreur leave MySQL:', e.message);
      }
    }

    return leave;
  }

  async addMission(mission) {
    mission.id = this.data.missions.length + 1;
    this.data.missions.push(mission);
    this.saveToDisk();

    if (this.driver === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO missions (title, description, agent, destination, status, priority, progress, eta)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [mission.title, mission.description || '', mission.agent || '', mission.destination || '', mission.status || 'inProgress', mission.priority || 'medium', mission.progress || 0, mission.eta || '']
        );
      } catch (e) {
        console.error('Erreur mission PostgreSQL:', e.message);
      }
    }

    if (this.driver === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO missions (title, description, agent, destination, status, priority, progress, eta)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [mission.title, mission.description || '', mission.agent || '', mission.destination || '', mission.status || 'inProgress', mission.priority || 'medium', mission.progress || 0, mission.eta || '']
        );
      } catch (e) {
        console.error('Erreur mission MySQL:', e.message);
      }
    }

    return mission;
  }

  async addChatMessage(msg) {
    this.data.chatMessages.push(msg);
    this.saveToDisk();

    if (this.driver === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO chat_messages (user_email, role, text) VALUES ($1, $2, $3)`,
          [msg.email || '', msg.role, msg.text]
        );
      } catch (e) { }
    }

    if (this.driver === 'mysql' && this.mysqlPool) {
      try {
        await this.mysqlPool.query(
          `INSERT INTO chat_messages (user_email, role, text) VALUES (?, ?, ?)`,
          [msg.email || '', msg.role, msg.text]
        );
      } catch (e) { }
    }

    return msg;
  }
}

// Instance Singleton
const dbInstance = new DatabaseManager();

module.exports = dbInstance;
