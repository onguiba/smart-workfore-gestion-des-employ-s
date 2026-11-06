/**
 * TSA SmartWorkforce AI™ — Gestionnaire de Base de Données PostgreSQL & Fallback JSON
 * 
 * Fonctionnement :
 * 1. Si PostgreSQL est configuré via DATABASE_URL ou PGHOST, le module se connecte à PostgreSQL (pg Pool).
 * 2. Si les tables n'existent pas encore, il les initialise automatiquement.
 * 3. Si PostgreSQL n'est pas configuré ou indisponible, il bascule de manière transparente
 *    sur le fichier JSON local persistant (backend/data/database.json).
 */

const fs = require('fs');
const path = require('path');

// Chargement facultatif des variables .env
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
  dotenv.config({ path: path.join(__dirname, '.env') });
} catch (e) {
  // dotenv optionnel
}

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
        
        // Tester la connexion
        const client = await this.pgPool.connect();
        console.log('🐘 Connecté avec succès à la base de données PostgreSQL !');
        client.release();

        this.driver = 'postgres';
        await this.initPgTables();
        await this.syncPgData();
        return true;
      } catch (err) {
        console.warn('⚠️ Connexion PostgreSQL impossible (' + err.message + '). Basculement automatique sur la base JSON locale.');
        this.driver = 'json';
      }
    } else {
      console.log('ℹ️ Aucune variable PostgreSQL détectée. Mode Base de Données JSON actif.');
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
      console.log('✅ Tables PostgreSQL vérifiées et prêtes.');
    } catch (e) {
      console.error('Erreur initialisation tables PostgreSQL:', e.message);
    }
  }

  async syncPgData() {
    if (!this.pgPool) return;
    try {
      const res = await this.pgPool.query('SELECT * FROM employees ORDER BY id ASC');
      if (res.rows && res.rows.length > 0) {
        this.data.employees = res.rows.map(r => ({
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
    } catch (e) {
      console.warn('Erreur synchronisation PostgreSQL:', e.message);
    }
  }

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
