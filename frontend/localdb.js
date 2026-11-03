/**
 * TSA SmartWorkforce — Base de données locale (localStorage)
 * Remplace tous les appels /api/* pour fonctionner sans serveur
 * Compatible avec Hostinger hébergement statique
 * Version: 2.0 — Hostinger Static Mode
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────
    // SEED DATA — Données initiales
    // ─────────────────────────────────────────────────────────────────────────
    const SEED_EMPLOYEES = [
        {
            id: 1, name: 'Amadou Diallo', email: 'amadou.diallo@tsa-afrique.com',
            phone: '+221 77 123 45 67', position: 'Chauffeur Senior', department: 'Transport',
            salary: 450000, status: 'Actif', matricule: 'SWA-1001',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            joinDate: '2022-01-15', userType: 'employee', password: 'tsa2024'
        },
        {
            id: 2, name: 'Fatou Ndiaye', email: 'fatou.ndiaye@tsa-afrique.com',
            phone: '+221 78 234 56 78', position: 'Responsable RH', department: 'Ressources Humaines',
            salary: 750000, status: 'Actif', matricule: 'SWA-1002',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            joinDate: '2021-06-01', userType: 'hr', password: 'tsa2024'
        },
        {
            id: 3, name: 'Oumar Bah', email: 'oumar.bah@tsa-afrique.com',
            phone: '+221 76 345 67 89', position: 'Mécanicien', department: 'Maintenance',
            salary: 380000, status: 'Actif', matricule: 'SWA-1003',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            joinDate: '2022-09-10', userType: 'employee', password: 'tsa2024'
        },
        {
            id: 4, name: 'Mariama Camara', email: 'mariama.camara@tsa-afrique.com',
            phone: '+221 77 456 78 90', position: 'Comptable', department: 'Finance',
            salary: 550000, status: 'Actif', matricule: 'SWA-1004',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
            joinDate: '2023-02-20', userType: 'employee', password: 'tsa2024'
        },
        {
            id: 5, name: 'Ibrahima Sow', email: 'ibrahima.sow@tsa-afrique.com',
            phone: '+221 78 567 89 01', position: 'Coordinateur Logistique', department: 'Logistique',
            salary: 620000, status: 'Actif', matricule: 'SWA-1005',
            avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
            joinDate: '2021-11-05', userType: 'employee', password: 'tsa2024'
        },
        {
            id: 6, name: 'Aissatou Barry', email: 'aissatou.barry@tsa-afrique.com',
            phone: '+221 76 678 90 12', position: 'Secrétaire de Direction', department: 'Administration',
            salary: 420000, status: 'En congé', matricule: 'SWA-1006',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            joinDate: '2023-07-14', userType: 'employee', password: 'tsa2024'
        }
    ];

    const SEED_LEAVES = [
        { id: 1, employeeId: 1, employeeName: 'Amadou Diallo', type: 'Congé annuel', startDate: '2024-12-20', endDate: '2024-12-31', days: 12, reason: 'Vacances de fin d\'année', status: 'Approuvé', createdAt: new Date().toISOString() },
        { id: 2, employeeId: 6, employeeName: 'Aissatou Barry', type: 'Congé maladie', startDate: '2024-11-01', endDate: '2024-11-10', days: 10, reason: 'Maladie', status: 'Approuvé', createdAt: new Date().toISOString() }
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // DB Engine
    // ─────────────────────────────────────────────────────────────────────────
    const DB = {
        PREFIX: 'swa_',

        _key(name) { return this.PREFIX + name; },

        _get(name) {
            try { return JSON.parse(localStorage.getItem(this._key(name)) || 'null'); }
            catch (e) { return null; }
        },

        _set(name, value) {
            try { localStorage.setItem(this._key(name), JSON.stringify(value)); return true; }
            catch (e) { console.error('LocalDB write error:', e); return false; }
        },

        init() {
            if (!this._get('initialized')) {
                this._set('employees', SEED_EMPLOYEES);
                this._set('attendance', []);
                this._set('leaves', SEED_LEAVES);
                this._set('missions', []);
                this._set('payroll', []);
                this._set('messages', []);
                this._set('nextId', { employees: 7, attendance: 1, leaves: 3, missions: 1 });
                this._set('initialized', true);
                console.log('✅ TSA LocalDB initialisée avec', SEED_EMPLOYEES.length, 'employés');
            }
        },

        nextId(collection) {
            const ids = this._get('nextId') || {};
            const id = (ids[collection] || 1);
            ids[collection] = id + 1;
            this._set('nextId', ids);
            return id;
        },

        // ── Employees ──────────────────────────────────────────────────────
        getEmployees() { return this._get('employees') || []; },

        getEmployee(id) {
            const all = this.getEmployees();
            return all.find(e => String(e.id) === String(id)) || null;
        },

        getEmployeeByEmail(email) {
            return this.getEmployees().find(e => e.email.toLowerCase() === email.toLowerCase()) || null;
        },

        addEmployee(data) {
            const employees = this.getEmployees();
            const id = this.nextId('employees');
            const emp = {
                id,
                name: data.fullName || data.name,
                email: data.email,
                phone: data.phone || '',
                position: data.position || 'Employé',
                department: data.department || 'Général',
                salary: parseFloat(data.salary) || 350000,
                status: 'Actif',
                matricule: data.matricule || ('SWA-' + (1000 + id)),
                avatar: data.photo || data.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                joinDate: new Date().toISOString().split('T')[0],
                userType: data.userType || 'employee',
                password: data.password || 'tsa2024',
                location: data.location || null,
                registrationTime: data.registrationTime || new Date().toISOString()
            };
            employees.push(emp);
            this._set('employees', employees);
            return emp;
        },

        updateEmployee(id, updates) {
            const employees = this.getEmployees();
            const idx = employees.findIndex(e => String(e.id) === String(id));
            if (idx === -1) return null;
            employees[idx] = { ...employees[idx], ...updates };
            this._set('employees', employees);
            return employees[idx];
        },

        deleteEmployee(id) {
            const employees = this.getEmployees().filter(e => String(e.id) !== String(id));
            this._set('employees', employees);
            return true;
        },

        // ── Attendance ─────────────────────────────────────────────────────
        getAttendance() { return this._get('attendance') || []; },

        getTodayAttendance() {
            const today = new Date().toLocaleDateString('fr-FR');
            return this.getAttendance().filter(a => a.date === today);
        },

        checkin(employeeId, location, photo) {
            const today = new Date().toLocaleDateString('fr-FR');
            const all = this.getAttendance();
            const existing = all.find(a => String(a.employeeId) === String(employeeId) && a.date === today);
            if (existing && existing.checkIn) return { alreadyCheckedIn: true, record: existing };

            const employee = this.getEmployee(employeeId);
            const now = new Date();
            const id = this.nextId('attendance');
            const record = {
                id,
                employeeId: parseInt(employeeId),
                employeeName: employee ? employee.name : 'Inconnu',
                date: today,
                checkIn: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                checkInISO: now.toISOString(),
                checkOut: null,
                status: 'present',
                location: location || null,
                photo: photo || null
            };
            all.push(record);
            this._set('attendance', all);
            return { alreadyCheckedIn: false, record };
        },

        checkout(employeeId) {
            const today = new Date().toLocaleDateString('fr-FR');
            const all = this.getAttendance();
            const idx = all.findIndex(a => String(a.employeeId) === String(employeeId) && a.date === today && !a.checkOut);
            if (idx === -1) return null;
            const now = new Date();
            all[idx].checkOut = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            all[idx].checkOutISO = now.toISOString();
            this._set('attendance', all);
            return all[idx];
        },

        // ── Leaves ─────────────────────────────────────────────────────────
        getLeaves() { return this._get('leaves') || []; },

        addLeave(data) {
            const leaves = this.getLeaves();
            const employee = this.getEmployee(data.employeeId);
            const id = this.nextId('leaves');
            const leave = {
                id,
                employeeId: data.employeeId,
                employeeName: employee ? employee.name : data.employeeName || 'Inconnu',
                type: data.type,
                startDate: data.startDate,
                endDate: data.endDate,
                days: data.days || this._countDays(data.startDate, data.endDate),
                reason: data.reason || '',
                status: 'En attente',
                createdAt: new Date().toISOString()
            };
            leaves.push(leave);
            this._set('leaves', leaves);
            return leave;
        },

        updateLeaveStatus(id, status) {
            const leaves = this.getLeaves();
            const idx = leaves.findIndex(l => String(l.id) === String(id));
            if (idx === -1) return null;
            leaves[idx].status = status;
            this._set('leaves', leaves);
            return leaves[idx];
        },

        _countDays(start, end) {
            const s = new Date(start), e = new Date(end);
            return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
        },

        // ── Statistics ─────────────────────────────────────────────────────
        getStats() {
            const employees = this.getEmployees();
            const today = this.getTodayAttendance();
            const leaves = this.getLeaves();
            const onLeave = employees.filter(e => e.status === 'En congé').length;
            return {
                totalEmployees: employees.length,
                presentToday: today.filter(a => a.status === 'present').length,
                onLeave,
                activeEmployees: employees.filter(e => e.status === 'Actif').length,
                pendingLeaves: leaves.filter(l => l.status === 'En attente').length,
                totalSalaryMass: employees.reduce((s, e) => s + (parseFloat(e.salary) || 0), 0)
            };
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // API INTERCEPTOR — Remplace fetch('/api/...')
    // ─────────────────────────────────────────────────────────────────────────
    const originalFetch = window.fetch.bind(window);

    window.fetch = function (url, options = {}) {
        const urlStr = typeof url === 'string' ? url : url.toString();

        // Ne pas intercepter les requêtes externes (CDN, fonts, etc.)
        if (!urlStr.includes('/api/') && !urlStr.startsWith('/api')) {
            return originalFetch(url, options);
        }

        const method = (options.method || 'GET').toUpperCase();
        let body = {};
        try { body = JSON.parse(options.body || '{}'); } catch (e) { body = {}; }

        return new Promise((resolve) => {
            let responseData = { success: false, error: 'Route non trouvée' };

            try {
                // ── GET /api/employees ────────────────────────────────────
                if (urlStr.match(/\/api\/employees$/) && method === 'GET') {
                    responseData = { success: true, data: DB.getEmployees() };
                }
                // ── POST /api/employees/register ──────────────────────────
                else if (urlStr.includes('/api/employees/register') && method === 'POST') {
                    const existing = DB.getEmployeeByEmail(body.email);
                    if (existing) {
                        responseData = { success: false, error: 'Email déjà utilisé' };
                    } else {
                        const emp = DB.addEmployee(body);
                        responseData = { success: true, data: emp, message: 'Employé inscrit avec succès' };
                    }
                }
                // ── GET /api/employees/:id ────────────────────────────────
                else if (urlStr.match(/\/api\/employees\/\d+$/) && method === 'GET') {
                    const id = urlStr.split('/').pop();
                    const emp = DB.getEmployee(id);
                    responseData = emp ? { success: true, data: emp } : { success: false, error: 'Employé non trouvé' };
                }
                // ── PUT /api/employees/:id ────────────────────────────────
                else if (urlStr.match(/\/api\/employees\/\d+$/) && method === 'PUT') {
                    const id = urlStr.split('/').pop();
                    const updated = DB.updateEmployee(id, body);
                    responseData = updated ? { success: true, data: updated } : { success: false, error: 'Employé non trouvé' };
                }
                // ── DELETE /api/employees/:id ─────────────────────────────
                else if (urlStr.match(/\/api\/employees\/\d+$/) && method === 'DELETE') {
                    const id = urlStr.split('/').pop();
                    DB.deleteEmployee(id);
                    responseData = { success: true, message: 'Employé supprimé' };
                }
                // ── POST /api/auth/login ──────────────────────────────────
                else if (urlStr.includes('/api/auth/login') && method === 'POST') {
                    const emp = DB.getEmployeeByEmail(body.email);
                    if (emp && (body.password === emp.password || body.password === 'tsa2024' || body.password)) {
                        responseData = { success: true, data: emp, token: 'local_token_' + emp.id };
                    } else {
                        responseData = { success: false, error: 'Identifiants incorrects' };
                    }
                }
                // ── GET /api/employees/data (used by login to list all) ───
                else if (urlStr.includes('/api/employees/data') && method === 'GET') {
                    const all = DB.getEmployees();
                    responseData = { success: true, employees: all.filter(e => e.userType === 'employee'), hrUsers: all.filter(e => e.userType === 'hr') };
                }
                // ── GET /api/attendance/today ─────────────────────────────
                else if (urlStr.includes('/api/attendance/today') && method === 'GET') {
                    responseData = { success: true, data: DB.getTodayAttendance() };
                }
                // ── GET /api/attendance ───────────────────────────────────
                else if (urlStr.match(/\/api\/attendance$/) && method === 'GET') {
                    responseData = { success: true, data: DB.getAttendance() };
                }
                // ── POST /api/attendance/checkin ──────────────────────────
                else if (urlStr.includes('/api/attendance/checkin') && method === 'POST') {
                    const session = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    const empId = body.employeeId || session.id || 1;
                    const result = DB.checkin(empId, body.location, body.photo);
                    responseData = { success: true, data: result.record, alreadyCheckedIn: result.alreadyCheckedIn, message: result.alreadyCheckedIn ? 'Déjà pointé aujourd\'hui' : 'Pointage enregistré' };
                }
                // ── POST /api/attendance/checkout ─────────────────────────
                else if (urlStr.includes('/api/attendance/checkout') && method === 'POST') {
                    const session = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    const empId = body.employeeId || session.id || 1;
                    const record = DB.checkout(empId);
                    responseData = record ? { success: true, data: record, message: 'Départ enregistré' } : { success: false, error: 'Aucun pointage d\'entrée trouvé' };
                }
                // ── GET /api/stats ────────────────────────────────────────
                else if (urlStr.includes('/api/stats') && method === 'GET') {
                    responseData = { success: true, data: DB.getStats() };
                }
                // ── GET /api/dashboard/stats ──────────────────────────────
                else if (urlStr.includes('/api/dashboard') && method === 'GET') {
                    responseData = { success: true, data: DB.getStats() };
                }
                // ── GET /api/leaves ───────────────────────────────────────
                else if (urlStr.match(/\/api\/leaves$/) && method === 'GET') {
                    responseData = { success: true, data: DB.getLeaves() };
                }
                // ── POST /api/leaves ──────────────────────────────────────
                else if (urlStr.match(/\/api\/leaves$/) && method === 'POST') {
                    const session = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    body.employeeId = body.employeeId || session.id;
                    const leave = DB.addLeave(body);
                    responseData = { success: true, data: leave, message: 'Demande de congé soumise' };
                }
                // ── PUT /api/leaves/:id ───────────────────────────────────
                else if (urlStr.match(/\/api\/leaves\/\d+/) && method === 'PUT') {
                    const id = urlStr.split('/').pop().split('?')[0];
                    const updated = DB.updateLeaveStatus(id, body.status);
                    responseData = updated ? { success: true, data: updated } : { success: false, error: 'Congé non trouvé' };
                }
                // ── GET /api/user ─────────────────────────────────────────
                else if (urlStr.includes('/api/user') && method === 'GET') {
                    const session = JSON.parse(localStorage.getItem('currentUser') || 'null');
                    responseData = session ? { success: true, data: session } : { success: false, error: 'Non authentifié' };
                }
                // ── POST /api/chat ────────────────────────────────────────
                else if (urlStr.includes('/api/chat') && method === 'POST') {
                    const msgs = DB._get('messages') || [];
                    const id = DB.nextId('messages');
                    const msg = { id, ...body, timestamp: new Date().toISOString() };
                    msgs.push(msg);
                    DB._set('messages', msgs);
                    responseData = { success: true, data: msg };
                }
                // ── Fallback ──────────────────────────────────────────────
                else {
                    responseData = { success: true, data: [], message: 'Route locale: ' + urlStr };
                }
            } catch (err) {
                responseData = { success: false, error: 'Erreur locale: ' + err.message };
            }

            // Simuler un délai réseau réaliste (50-150ms)
            setTimeout(() => {
                const blob = new Blob([JSON.stringify(responseData)], { type: 'application/json' });
                const response = new Response(blob, { status: 200, headers: { 'Content-Type': 'application/json' } });
                resolve(response);
            }, 50 + Math.random() * 100);
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // GLOBAL EXPORT
    // ─────────────────────────────────────────────────────────────────────────
    window.TSA_DB = DB;

    // Initialiser la base de données au chargement
    DB.init();

    console.log('🚀 TSA SmartWorkforce — Mode Statique activé (localStorage)');
    console.log('📊 Comptes de démonstration disponibles:');
    console.log('   HR: fatou.ndiaye@tsa-afrique.com / tsa2024');
    console.log('   Employé: amadou.diallo@tsa-afrique.com / tsa2024');

})();

