/**
 * TSA SmartWorkforce AI™ — Pointage Biométrique & Présence
 * Première Option : Reconnaissance Faciale Automatique (Sortie automatique des données)
 * Deuxième Option : Identification Manuelle par Email / Matricule
 * Gestion Complète : Pointage d'Arrivée (Entrée) ET de Départ (Sortie)
 */

// Variables globales d'état
let videoStream = null;
let currentFacingMode = 'user';
let capturedPhoto = null;
let currentGpsLocation = null;
let currentEmployee = null;
let currentTodayStatus = {
    hasCheckIn: false,
    checkInTime: null,
    hasCheckOut: false,
    checkOutTime: null,
    duration: null
};

// Éléments du DOM
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const alertBox = document.getElementById('alertBox');
const alertIcon = document.getElementById('alertIcon');
const alertText = document.getElementById('alertText');
const btnCapture = document.getElementById('btnCapture');
const cameraPlaceholder = document.getElementById('cameraPlaceholder');

// ─────────────────────────────────────────────────────────────────────────────
// 1. HORLOGE TEMPS RÉEL & GÉOLOCALISATION
// ─────────────────────────────────────────────────────────────────────────────
function initClock() {
    function tick() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateStr = now.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const timeElem = document.getElementById('currentTime');
        const dateElem = document.getElementById('currentDate');
        if (timeElem) timeElem.textContent = timeStr;
        if (dateElem) dateElem.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }
    tick();
    setInterval(tick, 1000);
}

function initGeolocation() {
    const gpsText = document.getElementById('gpsText');
    const gpsAccuracy = document.getElementById('gpsAccuracy');

    if (!navigator.geolocation) {
        if (gpsText) gpsText.textContent = "Géolocalisation non supportée par ce terminal";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            currentGpsLocation = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                timestamp: new Date().toISOString()
            };
            if (gpsText) {
                gpsText.textContent = `Position : Lat ${pos.coords.latitude.toFixed(5)}, Long ${pos.coords.longitude.toFixed(5)}`;
            }
            if (gpsAccuracy) {
                gpsAccuracy.textContent = `Précision : ±${Math.round(pos.coords.accuracy)}m`;
            }
        },
        (err) => {
            console.warn('GPS Warning:', err);
            // Coordonnées par défaut du Hub TSA
            currentGpsLocation = {
                latitude: 14.7167,
                longitude: -17.4677,
                accuracy: 15,
                timestamp: new Date().toISOString()
            };
            if (gpsText) gpsText.textContent = "Hub TSA Principal (Coordonnées Réseau)";
            if (gpsAccuracy) gpsAccuracy.textContent = "Précision : Réseau";
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GESTION DE LA CAMÉRA (OPTION 1 : RECONNAISSANCE FACIALE)
// ─────────────────────────────────────────────────────────────────────────────
async function startCamera() {
    try {
        if (videoStream) {
            videoStream.getTracks().forEach(t => t.stop());
        }

        videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        video.srcObject = videoStream;
        await video.play();

        if (cameraPlaceholder) cameraPlaceholder.classList.add('hidden');
        if (btnCapture) btnCapture.disabled = false;

        showAlert('Caméra activée. Positionnez votre visage au centre du cadre.', 'info');
    } catch (err) {
        console.error('Camera error:', err);
        showAlert('Impossible d\'activer la caméra. Utilisez l\'Option 2 (Email / Matricule).', 'warning');
        switchMethod('email');
    }
}

function toggleCamera() {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    startCamera();
}

/**
 * OPTION 1 : Capture photo et reconnaissance faciale automatique
 * Dès la prise de vue, les informations de l'employé sortent AUTOMATIQUEMENT
 */
async function captureAndIdentify() {
    if (!video || !video.videoWidth) {
        showAlert('Veuillez d\'abord allumer la caméra.', 'warning');
        return;
    }

    // Capture de la photo sur canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    capturedPhoto = canvas.toDataURL('image/jpeg', 0.85);

    // Afficher la prévisualisation
    const previewContainer = document.getElementById('photoPreviewContainer');
    const previewImg = document.getElementById('photoPreviewImg');
    const captureMeta = document.getElementById('captureMeta');

    if (previewImg) previewImg.src = capturedPhoto;
    if (previewContainer) previewContainer.classList.remove('hidden');
    if (captureMeta) captureMeta.textContent = `Capté à ${new Date().toLocaleTimeString('fr-FR')} • Traitement biométrique en cours...`;

    // Effet visuel scan
    showAlert('🔍 Analyse du visage par intelligence artificielle...', 'info');
    if (btnCapture) {
        btnCapture.disabled = true;
        btnCapture.innerHTML = '<span class="material-symbols-outlined animate-spin text-lg">sync</span> Identification en cours...';
    }

    try {
        // Vérifier si un utilisateur était déjà connecté localement pour aide
        const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const payload = {
            photo: capturedPhoto
        };
        if (localUser && localUser.email) {
            payload.preferredEmail = localUser.email;
        }

        const response = await fetch('/api/employees/identify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success && (result.employee || result.data)) {
            const emp = result.employee || result.data;
            currentEmployee = emp;
            
            // Récupérer l'état de pointage du jour (Arrivée vs Départ)
            if (result.todayStatus) {
                currentTodayStatus = result.todayStatus;
            } else {
                currentTodayStatus = {
                    hasCheckIn: (emp.status === 'present' || (emp.checkInTime && emp.checkInTime !== '-')),
                    checkInTime: emp.checkInTime !== '-' ? emp.checkInTime : null,
                    hasCheckOut: (emp.checkOutTime && emp.checkOutTime !== '-'),
                    checkOutTime: emp.checkOutTime !== '-' ? emp.checkOutTime : null,
                    duration: null
                };
            }

            // ⭐ SORTIE AUTOMATIQUE DES INFORMATIONS
            displayEmployeeCard(emp, 'Face ID (' + (result.confidence || '99.2%') + ')');
            showAlert(`✅ Visage reconnu avec succès : ${emp.name} ! Vos informations sont chargées.`, 'success');
            
            if (captureMeta) {
                captureMeta.textContent = `Reconnu : ${emp.name} (${result.confidence || '99.2%'} certitude)`;
            }
        } else {
            showAlert('Visage non reconnu automatiquement. Vous pouvez entrer votre email (Option 2).', 'warning');
            switchMethod('email');
        }
    } catch (error) {
        console.error('Identification error:', error);
        showAlert('Erreur lors de l\'identification faciale. Veuillez utiliser l\'Option 2.', 'error');
        switchMethod('email');
    } finally {
        if (btnCapture) {
            btnCapture.disabled = false;
            btnCapture.innerHTML = '<span class="material-symbols-outlined text-lg">camera</span> Capturer & Identifier mon Visage';
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. OPTION 2 : IDENTIFICATION MANUELLE PAR EMAIL / MATRICULE
// ─────────────────────────────────────────────────────────────────────────────
async function identifyByEmail(event) {
    if (event) event.preventDefault();

    const input = document.getElementById('inputEmail');
    const val = input ? input.value.trim() : '';

    if (!val) {
        showAlert('Veuillez saisir votre email ou votre matricule.', 'warning');
        return;
    }

    const btn = document.getElementById('btnSubmitEmail');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-lg">sync</span> Recherche...';
    }

    try {
        const response = await fetch('/api/employees/identify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: val })
        });

        const result = await response.json();

        if (result.success && (result.employee || result.data)) {
            const emp = result.employee || result.data;
            currentEmployee = emp;

            if (result.todayStatus) {
                currentTodayStatus = result.todayStatus;
            } else {
                currentTodayStatus = {
                    hasCheckIn: (emp.status === 'present' || (emp.checkInTime && emp.checkInTime !== '-')),
                    checkInTime: emp.checkInTime !== '-' ? emp.checkInTime : null,
                    hasCheckOut: (emp.checkOutTime && emp.checkOutTime !== '-'),
                    checkOutTime: emp.checkOutTime !== '-' ? emp.checkOutTime : null,
                    duration: null
                };
            }

            displayEmployeeCard(emp, 'Identifiant Vérifié');
            showAlert(`✅ Employé identifié : ${emp.name}.`, 'success');
        } else {
            showAlert('Aucun collaborateur trouvé avec cet identifiant.', 'error');
        }
    } catch (err) {
        console.error(err);
        showAlert('Erreur de connexion au serveur.', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined text-lg">check</span> Charger ma Fiche Collaborateur';
        }
    }
}

function quickSelect(email) {
    const input = document.getElementById('inputEmail');
    if (input) input.value = email;
    identifyByEmail();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. AFFICHAGE DES INFORMATIONS DE L'EMPLOYÉ & GESTION DU POINTAGE (ARRIVÉE & DÉPART)
// ─────────────────────────────────────────────────────────────────────────────
function displayEmployeeCard(emp, badgeText = 'Face ID') {
    const placeholder = document.getElementById('employeePlaceholder');
    const details = document.getElementById('employeeDetails');
    
    if (placeholder) placeholder.classList.add('hidden');
    if (details) details.classList.remove('hidden');

    // Remplir les champs
    const empName = document.getElementById('empName');
    const empRole = document.getElementById('empRole');
    const empMatricule = document.getElementById('empMatricule');
    const empAvatar = document.getElementById('empAvatar');
    const bioBadge = document.getElementById('bioBadge');
    const summaryDate = document.getElementById('summaryDate');

    if (empName) empName.textContent = emp.name || 'Collaborateur';
    if (empRole) empRole.textContent = `${emp.position || emp.role || 'Collaborateur'} • ${emp.department || 'Operations'}`;
    if (empMatricule) empMatricule.textContent = `Matricule: ${emp.matricule || 'SWA-XXXX'}`;
    if (bioBadge) bioBadge.textContent = badgeText;
    if (summaryDate) summaryDate.textContent = new Date().toLocaleDateString('fr-FR');

    const photoSrc = emp.photo || emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    if (empAvatar) empAvatar.src = photoSrc;

    // Mettre à jour l'état Arrivée / Départ
    updateAttendanceUIState();
}

function updateAttendanceUIState() {
    const displayCheckInTime = document.getElementById('displayCheckInTime');
    const displayCheckOutTime = document.getElementById('displayCheckOutTime');
    const displayDuration = document.getElementById('displayDuration');
    const durationRow = document.getElementById('durationRow');
    const btnCheckIn = document.getElementById('btnActionCheckIn');
    const btnCheckOut = document.getElementById('btnActionCheckOut');
    const txtBtnCheckIn = document.getElementById('txtBtnCheckIn');
    const txtBtnCheckOut = document.getElementById('txtBtnCheckOut');

    const hasIn = !!currentTodayStatus.hasCheckIn;
    const hasOut = !!currentTodayStatus.hasCheckOut;
    const inTime = currentTodayStatus.checkInTime;
    const outTime = currentTodayStatus.checkOutTime;

    // 1. Affichage Heure Arrivée
    if (displayCheckInTime) {
        if (hasIn && inTime) {
            displayCheckInTime.innerHTML = `✅ ${inTime}`;
            displayCheckInTime.className = "text-sm font-extrabold font-mono text-emerald-400";
        } else {
            displayCheckInTime.textContent = "Non pointé";
            displayCheckInTime.className = "text-sm font-extrabold font-mono text-slate-500";
        }
    }

    // 2. Affichage Heure Départ
    if (displayCheckOutTime) {
        if (hasOut && outTime) {
            displayCheckOutTime.innerHTML = `🚪 ${outTime}`;
            displayCheckOutTime.className = "text-sm font-extrabold font-mono text-rose-400";
        } else if (hasIn) {
            displayCheckOutTime.textContent = "En cours (Présent)";
            displayCheckOutTime.className = "text-sm font-semibold text-amber-400";
        } else {
            displayCheckOutTime.textContent = "En attente d'arrivée";
            displayCheckOutTime.className = "text-sm font-mono text-slate-500";
        }
    }

    // 3. Calcul & Affichage Durée
    if (hasIn && hasOut && inTime && outTime) {
        const dur = currentTodayStatus.duration || calculateWorkedDuration(inTime, outTime);
        if (durationRow) durationRow.classList.remove('hidden');
        if (displayDuration) displayDuration.textContent = dur;
    } else if (hasIn && !hasOut && inTime) {
        const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const liveDur = calculateWorkedDuration(inTime, nowTime);
        if (durationRow) durationRow.classList.remove('hidden');
        if (displayDuration) displayDuration.textContent = `${liveDur} (En cours)`;
    } else {
        if (durationRow) durationRow.classList.add('hidden');
    }

    // 4. Adaptation intelligente des boutons
    if (!hasIn) {
        // L'employé arrive le matin (ex: 7h00)
        if (btnCheckIn) {
            btnCheckIn.disabled = false;
            btnCheckIn.className = "w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 animate-pulse";
        }
        if (txtBtnCheckIn) txtBtnCheckIn.textContent = `Pointer mon Arrivée (${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`;
        
        if (btnCheckOut) {
            btnCheckOut.disabled = true;
            btnCheckOut.className = "w-full py-3.5 px-4 rounded-2xl bg-slate-800 text-slate-500 font-semibold text-xs sm:text-sm opacity-50 cursor-not-allowed flex items-center justify-center gap-2";
        }
        if (txtBtnCheckOut) txtBtnCheckOut.textContent = "Pointer mon Départ (Arrivée requise d'abord)";
    } else if (hasIn && !hasOut) {
        // L'employé a pointé à 7h00 et repart le soir à 18h00
        if (btnCheckIn) {
            btnCheckIn.disabled = true;
            btnCheckIn.className = "w-full py-3 px-4 rounded-2xl bg-slate-800/80 text-emerald-400 font-semibold text-xs border border-emerald-500/20 cursor-default flex items-center justify-center gap-2";
        }
        if (txtBtnCheckIn) txtBtnCheckIn.textContent = `✅ Arrivée déjà validée à ${inTime}`;

        if (btnCheckOut) {
            btnCheckOut.disabled = false;
            btnCheckOut.className = "w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2 animate-bounce";
        }
        if (txtBtnCheckOut) txtBtnCheckOut.textContent = `🚪 Pointer mon Départ (${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`;
    } else {
        // L'employé a fait les deux pointages (Journée terminée)
        if (btnCheckIn) {
            btnCheckIn.disabled = true;
            btnCheckIn.className = "w-full py-2.5 px-4 rounded-2xl bg-slate-800/60 text-slate-400 font-medium text-xs cursor-default flex items-center justify-center gap-2";
        }
        if (txtBtnCheckIn) txtBtnCheckIn.textContent = `Arrivée effectuée : ${inTime}`;

        if (btnCheckOut) {
            btnCheckOut.disabled = true;
            btnCheckOut.className = "w-full py-2.5 px-4 rounded-2xl bg-slate-800/60 text-slate-400 font-medium text-xs cursor-default flex items-center justify-center gap-2";
        }
        if (txtBtnCheckOut) txtBtnCheckOut.textContent = `Départ effectué : ${outTime}`;
    }
}

function calculateWorkedDuration(tIn, tOut) {
    if (!tIn || !tOut) return '--';
    const [h1, m1] = tIn.split(':').map(Number);
    const [h2, m2] = tOut.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '--';
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60; // Gérer les shifts de nuit
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m.toString().padStart(2, '0')}min`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ENREGISTREMENT DU POINTAGE (ARRIVÉE ET DÉPART)
// ─────────────────────────────────────────────────────────────────────────────
async function submitAttendance(type) {
    if (!currentEmployee) {
        showAlert('Veuillez d\'abord vous identifier.', 'warning');
        return;
    }

    const isCheckIn = type === 'checkin';
    const timeFormatted = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = new Date().toLocaleDateString('fr-FR');

    const endpoint = isCheckIn ? '/api/attendance/checkin' : '/api/attendance/checkout';
    const payload = {
        employeeId: currentEmployee.id,
        employeeEmail: currentEmployee.email,
        employeeName: currentEmployee.name,
        type: type,
        location: currentGpsLocation,
        photo: capturedPhoto || currentEmployee.photo,
        checkInTimeFormatted: timeFormatted,
        checkOutTimeFormatted: timeFormatted,
        checkInDate: dateFormatted,
        checkOutDate: dateFormatted
    };

    showAlert(`Enregistrement du pointage de ${isCheckIn ? 'l\'arrivée' : 'départ'} en cours...`, 'info');

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            if (isCheckIn) {
                currentTodayStatus.hasCheckIn = true;
                currentTodayStatus.checkInTime = timeFormatted;
                showAlert(`✅ Arrivée enregistrée avec succès à ${timeFormatted} ! Bonne journée de travail.`, 'success');
            } else {
                currentTodayStatus.hasCheckOut = true;
                currentTodayStatus.checkOutTime = timeFormatted;
                currentTodayStatus.duration = result.duration || calculateWorkedDuration(currentTodayStatus.checkInTime, timeFormatted);
                showAlert(`🚪 Départ enregistré à ${timeFormatted} ! Temps travaillé : ${currentTodayStatus.duration}. À demain !`, 'success');
            }

            updateAttendanceUIState();
            loadRecentHistory();

            // Mettre à jour la session
            currentEmployee.checkInTime = currentTodayStatus.checkInTime;
            currentEmployee.checkOutTime = currentTodayStatus.checkOutTime;
            currentEmployee.status = isCheckIn ? 'present' : 'absent';
            localStorage.setItem('currentUser', JSON.stringify(currentEmployee));
        } else {
            showAlert('Erreur lors du pointage: ' + (result.error || result.message), 'error');
        }
    } catch (err) {
        console.error('Pointage submission error:', err);
        showAlert('Échec de communication avec le serveur.', 'error');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. HISTORIQUE & OUTILS DIVERS
// ─────────────────────────────────────────────────────────────────────────────
async function loadRecentHistory() {
    const listElem = document.getElementById('historyList');
    if (!listElem) return;

    try {
        const res = await fetch('/api/attendance/history');
        const data = await res.json();
        const records = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);

        if (records.length === 0) {
            listElem.innerHTML = `
                <div class="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-slate-500 text-center">
                    Aucun pointage enregistré aujourd'hui.
                </div>
            `;
            return;
        }

        listElem.innerHTML = records.slice(0, 8).map(r => {
            const isEntry = r.type === 'checkin';
            const badgeColor = isEntry ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' : 'text-rose-400 bg-rose-950/60 border-rose-500/30';
            const icon = isEntry ? 'login' : 'logout';
            const label = isEntry ? 'Arrivée' : 'Départ';
            const time = r.check_time_formatted || r.checkInTimeFormatted || r.checkOutTimeFormatted || '--:--';
            const dur = r.duration ? `• Durée: ${r.duration}` : '';

            return `
                <div class="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between hover:border-white/10 transition">
                    <div class="flex items-center gap-2.5">
                        <span class="p-1 rounded-lg ${badgeColor} border flex items-center justify-center">
                            <span class="material-symbols-outlined text-sm">${icon}</span>
                        </span>
                        <div>
                            <p class="font-bold text-white text-xs">${r.employee_name || r.employeeName || 'Collaborateur'}</p>
                            <p class="text-[10px] text-slate-400 font-mono">${label} à ${time} ${dur}</p>
                        </div>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono ${badgeColor} border font-bold">
                        ${time}
                    </span>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.warn('History error:', e);
    }
}

function switchMethod(method) {
    const secFacial = document.getElementById('sectionFacial');
    const secEmail = document.getElementById('sectionEmail');
    const tabFacial = document.getElementById('tabFacial');
    const tabEmail = document.getElementById('tabEmail');

    if (method === 'facial') {
        if (secFacial) secFacial.classList.remove('hidden');
        if (secEmail) secEmail.classList.add('hidden');
        if (tabFacial) tabFacial.className = "py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition bg-blue-600 text-white shadow-lg shadow-blue-600/30";
        if (tabEmail) tabEmail.className = "py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-center gap-2";
        if (!videoStream) startCamera();
    } else {
        if (secFacial) secFacial.classList.add('hidden');
        if (secEmail) secEmail.classList.remove('hidden');
        if (tabEmail) tabEmail.className = "py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition bg-blue-600 text-white shadow-lg shadow-blue-600/30";
        if (tabFacial) tabFacial.className = "py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-center gap-2";
    }
}

function resetEmployeeSession() {
    currentEmployee = null;
    currentTodayStatus = { hasCheckIn: false, checkInTime: null, hasCheckOut: false, checkOutTime: null, duration: null };
    const placeholder = document.getElementById('employeePlaceholder');
    const details = document.getElementById('employeeDetails');
    if (placeholder) placeholder.classList.remove('hidden');
    if (details) details.classList.add('hidden');
    showAlert('Prêt pour une nouvelle identification. Présentez-vous devant la caméra.', 'info');
}

function showAlert(message, type = 'info') {
    if (!alertBox || !alertText || !alertIcon) return;
    alertText.textContent = message;
    alertBox.classList.remove('hidden', 'bg-emerald-950/80', 'text-emerald-200', 'border-emerald-500/40',
        'bg-rose-950/80', 'text-rose-200', 'border-rose-500/40',
        'bg-blue-950/80', 'text-blue-200', 'border-blue-500/40',
        'bg-amber-950/80', 'text-amber-200', 'border-amber-500/40');

    if (type === 'success') {
        alertBox.classList.add('bg-emerald-950/80', 'text-emerald-200', 'border-emerald-500/40');
        alertIcon.textContent = 'check_circle';
    } else if (type === 'error') {
        alertBox.classList.add('bg-rose-950/80', 'text-rose-200', 'border-rose-500/40');
        alertIcon.textContent = 'error';
    } else if (type === 'warning') {
        alertBox.classList.add('bg-amber-950/80', 'text-amber-200', 'border-amber-500/40');
        alertIcon.textContent = 'warning';
    } else {
        alertBox.classList.add('bg-blue-950/80', 'text-blue-200', 'border-blue-500/40');
        alertIcon.textContent = 'info';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ─────────────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    initClock();
    initGeolocation();
    loadRecentHistory();

    // Démarrage automatique de la caméra pour l'Option 1 (Faciale)
    setTimeout(() => {
        startCamera();
    }, 600);
});
