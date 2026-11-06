/**
 * TSA SmartWorkforce AI™ — Module de Base de Données Universel
 * Source unique de vérité : PostgreSQL (Neon / Supabase / AWS / Render) ou Base JSON autonome
 * 
 * Toutes les données servies par l'API proviennent directement de la base active !
 */

const fs = require('fs');
const path = require('path');

// Chargement facultatif des variables .env
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
  dotenv.config({ path: path.join(__dirname, '.env') });
} catch (e) { }

const dataDir = path.join(__dirname, 'data');
const dataPath = path.join(dataDir, 'database.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function loadJsonData() {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (err) {
    console.warn('⚠️ Erreur lecture database.json :', err.message);
  }
  return {
    employees: [],
    hrUsers: [],
    attendance: { present: 0, absent: 0, onMission: 0, late: 0, rate: 0 },
    attendanceRecords: [],
    missions: [],
    leaves: [],
    payroll: [],
    fraudAlerts: [],
    chatMessages: []
  };
}

function saveJsonData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('❌ Erreur écriture database.json :', err.message);
    return false;
  }
}

class DatabaseManager {
  constructor() {
    this.driver = 'json';
    this.pgPool = null;
    this.data = loadJsonData();
  }

  async initDatabase() {
    return this.init();
  }

  async init() {
    const hasPgConfig = process.env.DATABASE_URL || process.env.PGHOST || process.env.POSTGRES_URL;

    if (hasPgConfig) {
      try {
        const { Pool } = require('pg');
        const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

        const poolConfig = connectionString
          ? {
            connectionString,
            ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false }
          }
          : {
            host: process.env.PGHOST || 'localhost',
            port: parseInt(process.env.PGPORT || '5432'),
            database: process.env.PGDATABASE,
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
          };

        this.pgPool = new Pool(poolConfig);

        const client = await this.pgPool.connect();
        console.log('🐘 Connecté avec succès à la base de données PostgreSQL !');
        client.release();

        this.driver = 'postgres';
        await this.initPgTables();
        await this.syncAllFromPg();
        return true;
      } catch (err) {
        console.warn('⚠️ Connexion PostgreSQL impossible (' + err.message + '). Utilisation de la base JSON.');
        this.driver = 'json';
      }
    } else {
      console.log('📦 Source de données active : Base JSON (backend/data/database.json)');
      this.driver = 'json';
    }

    return true;
  }

  async initPgTables() {
    if (!this.pgPool) return;
    try {
      await this.pgPool.query(`
        CREATE TABLE IF NOT EXISTS employees (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          phone VARCHAR(50),
          position VARCHAR(100),
          role VARCHAR(100),
          department VARCHAR(100),
          salary NUMERIC(10, 2) DEFAULT 0.00,
          matricule VARCHAR(50) UNIQUE,
          user_type VARCHAR(30) DEFAULT 'employee',
          status VARCHAR(30) DEFAULT 'present',
          photo TEXT,
          avatar TEXT,
          join_date VARCHAR(50),
          checkin_time VARCHAR(20) DEFAULT '-',
          checkout_time VARCHAR(20) DEFAULT '-',
          location JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS attendance (
          id SERIAL PRIMARY KEY,
          employee_id INT,
          employee_email VARCHAR(150),
          employee_name VARCHAR(150),
          type VARCHAR(30) NOT NULL,
          check_time VARCHAR(50),
          check_time_formatted VARCHAR(20),
          check_date VARCHAR(50),
          duration VARCHAR(30),
          location JSONB,
          photo TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS leaves (
          id SERIAL PRIMARY KEY,
          employee_id INT,
          employee_email VARCHAR(150),
          employee_name VARCHAR(150),
          type VARCHAR(100) NOT NULL,
          start_date VARCHAR(50) NOT NULL,
          end_date VARCHAR(50) NOT NULL,
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
          destination VARCHAR(150),
          status VARCHAR(30) DEFAULT 'inProgress',
          priority VARCHAR(30) DEFAULT 'medium',
          progress INT DEFAULT 0,
          eta VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Si la table employees est vide, injecter les employés depuis JSON
      const checkEmp = await this.pgPool.query('SELECT COUNT(*) as count FROM employees');
      if (parseInt(checkEmp.rows[0].count) === 0 && this.data.employees && this.data.employees.length > 0) {
        console.log('🔄 Migration initiale des données vers PostgreSQL...');
        for (const e of this.data.employees) {
          await this.pgPool.query(
            `INSERT INTO employees (name, email, phone, position, role, department, salary, matricule, user_type, status, photo, avatar, join_date, checkin_time, checkout_time)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             ON CONFLICT (email) DO NOTHING`,
            [e.name, e.email, e.phone || '', e.position || e.role, e.role || e.position, e.department || 'Général', e.salary || 40000, e.matricule || `SWA-${e.id}`, e.userType || 'employee', e.status || 'present', e.photo || null, e.avatar || null, e.joinDate || null, e.checkInTime || '-', e.checkOutTime || '-']
          );
        }
      }
      console.log('✅ Synchronisation de la base PostgreSQL terminée.');
    } catch (e) {
      console.error('Erreur initialisation tables PostgreSQL:', e.message);
    }
  }

  // Synchronise toutes les données depuis PostgreSQL pour garantir que tout provient de la base
  async syncAllFromPg() {
    if (!this.pgPool) return;
    try {
      // 1. Employés
      const resEmp = await this.pgPool.query('SELECT * FROM employees ORDER BY id ASC');
      if (resEmp.rows) {
        this.data.employees = resEmp.rows.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          position: r.position,
          role: r.role,
          department: r.department,
          salary: parseFloat(r.salary) || 0,
          matricule: r.matricule,
          userType: r.user_type,
          status: r.status,
          photo: r.photo,
          avatar: r.avatar,
          joinDate: r.join_date,
          checkInTime: r.checkin_time,
          checkOutTime: r.checkout_time,
          location: r.location
        }));
      }

      // 2. Pointages
      const resAtt = await this.pgPool.query('SELECT * FROM attendance ORDER BY id DESC LIMIT 50');
      if (resAtt.rows) {
        this.data.attendanceRecords = resAtt.rows.map(r => ({
          id: r.id,
          employeeId: r.employee_id,
          employeeEmail: r.employee_email,
          employeeName: r.employee_name,
          type: r.type,
          checkInTime: r.check_time,
          checkOutTime: r.check_time,
          checkInTimeFormatted: r.check_time_formatted,
          checkOutTimeFormatted: r.check_time_formatted,
          checkInDate: r.check_date,
          checkOutDate: r.check_date,
          duration: r.duration,
          location: r.location,
          photo: r.photo,
          createdAt: r.created_at
        }));
      }

      // 3. Missions
      const resMis = await this.pgPool.query('SELECT * FROM missions ORDER BY id ASC');
      if (resMis.rows && resMis.rows.length > 0) {
        this.data.missions = resMis.rows;
      }

      // 4. Congés
      const resLea = await this.pgPool.query('SELECT * FROM leaves ORDER BY id DESC');
      if (resLea.rows && resLea.rows.length > 0) {
        this.data.leaves = resLea.rows.map(l => ({
          id: l.id,
          employeeId: l.employee_id,
          employeeEmail: l.employee_email,
          employeeName: l.employee_name,
          type: l.type,
          startDate: l.start_date,
          endDate: l.end_date,
          days: l.days,
          reason: l.reason,
          status: l.status
        }));
      }

      // Sauvegarde miroir local JSON
      saveJsonData(this.data);
    } catch (e) {
      console.warn('Erreur synchronisation PostgreSQL:', e.message);
    }
  }

  // Lecture de tous les employés directement depuis la base
  async getEmployees() {
    if (this.driver === 'postgres' && this.pgPool) {
      await this.syncAllFromPg();
    }
    return this.data.employees;
  }

  // Lecture des pointages du jour directement depuis la base
  async getAttendanceRecords() {
    if (this.driver === 'postgres' && this.pgPool) {
      await this.syncAllFromPg();
    }
    return this.data.attendanceRecords;
  }

  // Ajout et enregistrement d'un employé dans la base
  async addEmployee(emp) {
    if (this.driver === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `INSERT INTO employees (name, email, phone, position, role, department, salary, matricule, user_type, status, photo, avatar, join_date, checkin_time, checkout_time, location)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           RETURNING id`,
          [
            emp.name, emp.email, emp.phone || '', emp.position || emp.role, emp.role || emp.position,
            emp.department || 'Operations', emp.salary || 40000, emp.matricule || `SWA-${Date.now().toString().slice(-4)}`,
            emp.userType || 'employee', emp.status || 'present', emp.photo || null, emp.avatar || null,
            emp.joinDate || new Date().toISOString().split('T')[0], emp.checkInTime || '-', emp.checkOutTime || '-',
            emp.location ? JSON.stringify(emp.location) : null
          ]
        );
        emp.id = res.rows[0].id;
      } catch (err) {
        console.error('Erreur addEmployee PostgreSQL:', err.message);
      }
    } else {
      emp.id = this.data.employees.length + 1;
    }

    this.data.employees.unshift(emp);
    saveJsonData(this.data);
    return emp;
  }

  // Ajout et enregistrement d'un pointage (Arrivée / Départ) dans la base
  async addAttendanceRecord(record) {
    this.data.attendanceRecords = this.data.attendanceRecords || [];
    this.data.attendanceRecords.unshift(record);
    saveJsonData(this.data);

    if (this.driver === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO attendance (employee_id, employee_email, employee_name, type, check_time, check_time_formatted, check_date, duration, location, photo)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            record.employeeId || null,
            record.employeeEmail,
            record.employeeName,
            record.type,
            record.checkInTime || record.checkOutTime || '',
            record.checkInTimeFormatted || record.checkOutTimeFormatted || '',
            record.checkInDate || record.checkOutDate || '',
            record.duration || '',
            record.location ? JSON.stringify(record.location) : null,
            record.photo || null
          ]
        );

        if (record.employeeId) {
          const colTime = record.type === 'checkin' ? 'checkin_time' : 'checkout_time';
          const timeVal = record.checkInTimeFormatted || record.checkOutTimeFormatted || '-';
          const newStatus = record.type === 'checkin' ? 'present' : 'absent';
          await this.pgPool.query(
            `UPDATE employees SET status = $1, ${colTime} = $2 WHERE id = $3`,
            [newStatus, timeVal, record.employeeId]
          );
        }
      } catch (err) {
        console.error('Erreur écriture attendance PostgreSQL:', err.message);
      }
    }

    return record;
  }

  saveData() {
    return saveJsonData(this.data);
  }
}

const dbInstance = new DatabaseManager();

module.exports = dbInstance;
