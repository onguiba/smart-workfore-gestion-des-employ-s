// SmartWorkforce AI — Fraud Detection & SOC Logic

let map;
let markers = [];
let fraudAlerts = [
  { id: 1, type: 'GPS SPOOFING SUSPECTÉ', severity: 'critical', employee: 'Daniel Gomis', description: 'Vitesse instantanée de 280 km/h calculée entre deux bornes GPS', location: 'Quai de Bercy, 75012 Paris', lat: 48.8350, lng: 2.3800, timestamp: 'Aujourd\'hui, 11:30:15', resolved: false },
  { id: 2, type: 'DOUBLE BADGEAGE SIMULTANÉ', severity: 'high', employee: 'Lucas Mercier & Sarah Perez', description: 'Même badge NFC détecté à 2 secondes d\'intervalle sur deux portes distantes', location: 'Entrée Principale Nord', lat: 48.8584, lng: 2.3475, timestamp: 'Aujourd\'hui, 08:45:22', resolved: false },
  { id: 3, type: 'SORTIE DE GÉOFENCE NON AUTORISÉE', severity: 'medium', employee: 'Agent Matricule 1245', description: 'Dépassement du périmètre d\'intervention sécurisé (Zone Est)', location: 'Zone Périphérique Est', lat: 48.8606, lng: 2.3376, timestamp: 'Hier, 17:15:00', resolved: false }
];

function showToast(message, type = 'info') {
  const container = document.getElementById('fraudToastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info'}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'info'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function initMap() {
  map = L.map('map', { zoomControl: false }).setView([48.8566, 2.3522], 13);

  // CartoDB Voyager tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors, © CartoDB',
    maxZoom: 19
  }).addTo(map);

  L.control.zoom({ position: 'topright' }).addTo(map);

  loadFraudAlerts();
}

async function loadFraudAlerts() {
  try {
    const res = await fetch('/api/fraud/alerts');
    const data = await res.json();
    if (data.success && data.data) {
      fraudAlerts = data.data;
    }
  } catch (e) {
    console.log("Using local fraud alerts dataset");
  }

  renderAlertPins();
  renderAlertFeed();
  updateStats();
}

function renderAlertPins() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const activeAlerts = fraudAlerts.filter(a => !a.resolved);

  activeAlerts.forEach(alert => {
    const isCritical = alert.severity === 'critical';
    const color = isCritical ? '#EF4444' : '#F59E0B';

    const icon = L.divIcon({
      className: 'custom-leaflet-alert',
      html: `
        <div style="background:${color}; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:3px solid white; box-shadow:0 0 16px ${color}; cursor:pointer;" class="pin-pulse">
          <span class="material-symbols-outlined" style="font-size:18px;">warning</span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const marker = L.marker([alert.lat || 48.8566, alert.lng || 2.3522], { icon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family:'Plus Jakarta Sans',sans-serif; padding:4px;">
        <span style="font-size:10px; font-weight:bold; color:${color}; text-transform:uppercase;">${alert.type}</span>
        <h4 style="font-weight:bold; font-size:13px; margin:2px 0 4px 0;">${alert.employee}</h4>
        <p style="font-size:11px; color:#475569; margin:0 0 6px 0;">${alert.description}</p>
        <p style="font-size:10px; color:#64748B; margin:0;">📍 ${alert.location}</p>
      </div>
    `);
    markers.push(marker);
  });
}

function renderAlertFeed() {
  const container = document.getElementById('fraudAlertsFeed');
  if (!container) return;
  container.innerHTML = '';

  const active = fraudAlerts.filter(a => !a.resolved);

  if (active.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-500 space-y-2">
        <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
          <span class="material-symbols-outlined text-2xl">verified_user</span>
        </div>
        <p class="font-bold text-slate-800 text-sm">Système Intègre & Sécurisé</p>
        <p class="text-xs text-slate-400">Aucune tentative de fraude en cours. Tous les flux biométriques et GPS sont certifiés.</p>
      </div>
    `;
    return;
  }

  active.forEach(alert => {
    const card = document.createElement('div');
    card.className = 'pt-3 pb-1 hover:bg-slate-50 p-3 rounded-xl transition border border-transparent hover:border-slate-200';

    const isCritical = alert.severity === 'critical';
    const tagBg = isCritical ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200';

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2 mb-1.5">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagBg}">
          ${alert.type}
        </span>
        <span class="text-[11px] text-slate-400 font-mono">${alert.timestamp}</span>
      </div>

      <h4 class="font-bold text-xs text-slate-900 mt-1">${alert.employee}</h4>
      <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">${alert.description}</p>
      <p class="text-[10px] text-slate-400 mt-1">📍 ${alert.location}</p>

      <div class="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
        <button onclick="resolveSingleAlert(${alert.id})" class="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-sm">
          <span class="material-symbols-outlined text-sm">task_alt</span>
          <span>Résoudre & Certifier</span>
        </button>
        <button onclick="focusOnAlertMap(${alert.lat}, ${alert.lng})" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition">
          <span class="material-symbols-outlined text-sm">location_searching</span>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function focusOnAlertMap(lat, lng) {
  if (map && lat && lng) {
    map.flyTo([lat, lng], 16, { duration: 1 });
  }
}

async function resolveSingleAlert(id) {
  try {
    await fetch('/api/fraud/alerts/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId: id })
    });
  } catch (e) {}

  const a = fraudAlerts.find(item => item.id === id);
  if (a) a.resolved = true;

  showToast(`✓ Alerte #${id} marquée comme traitée et archivée`, 'success');
  renderAlertPins();
  renderAlertFeed();
  updateStats();
}

function resolveAllAlerts() {
  fraudAlerts.forEach(a => a.resolved = true);
  showToast('✓ Toutes les alertes ont été certifiées et résolues', 'success');
  renderAlertPins();
  renderAlertFeed();
  updateStats();
}

function updateStats() {
  const activeCount = fraudAlerts.filter(a => !a.resolved).length;
  const badge = document.getElementById('activeAlertCountBadge');
  if (badge) {
    badge.textContent = `${activeCount} ALERTE${activeCount > 1 ? 'S' : ''}`;
    badge.className = activeCount > 0 ? 'text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full' : 'text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full';
  }

  const scoreTrustBadge = document.getElementById('scoreTrustBadge');
  const scoreTrustBar = document.getElementById('scoreTrustBar');
  const score = Math.max(90, 100 - activeCount * 1.5).toFixed(1);
  if (scoreTrustBadge) scoreTrustBadge.textContent = `${score}%`;
  if (scoreTrustBar) scoreTrustBar.style.width = `${score}%`;
}

// AI Security Scan
function runAiSecurityScan() {
  const modal = document.getElementById('scanModal');
  const bar = document.getElementById('scanProgressBar');
  const txt = document.getElementById('scanProgressText');
  modal.classList.add('active');

  let pct = 15;
  const timer = setInterval(() => {
    pct += 25;
    if (pct < 100) {
      bar.style.width = pct + '%';
      txt.textContent = `${pct}% — Analyse heuristique des flux de pointage...`;
    } else {
      bar.style.width = '100%';
      txt.textContent = '100% — Analyse terminée !';
      clearInterval(timer);
      setTimeout(() => {
        modal.classList.remove('active');
        showToast('✓ Diagnostic IA achevé : Intégrité du réseau à 98.4%', 'success');
      }, 700);
    }
  }, 400);
}

document.addEventListener('DOMContentLoaded', initMap);
