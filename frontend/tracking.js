// SmartWorkforce AI — GPS Tracking & Geofencing Radar

let map;
let markers = {};
let isSimulating = false;
let simulationInterval = null;

let agentsData = [
  { id: 1, name: 'Moussa Diop', role: 'Superviseur Logistique', department: 'Operations', lat: 48.8584, lng: 2.3475, speed: '38 km/h', battery: 86, status: 'En livraison', mission: 'Livraison Client ABC', address: '14 Boulevard Haussmann, Paris', alert: null },
  { id: 2, name: 'Jean Dupont', role: 'Architecte Cloud', department: 'IT', lat: 48.8738, lng: 2.2950, speed: '0 km/h (Sur site)', battery: 95, status: 'Audit en cours', mission: 'Audit Datacenter Étoile', address: '12 Avenue de la Grande Armée, Paris', alert: null },
  { id: 4, name: 'Daniel Gomis', role: 'Chauffeur Poids Lourd', department: 'Logistics', lat: 48.8350, lng: 2.3800, speed: '52 km/h', battery: 64, status: 'Transit Entrepôt', mission: 'Transfert Hub Logistique Sud', address: 'Quai de Bercy, Paris', alert: 'Vitesse calculée élevée' },
  { id: 5, name: 'Lucas Mercier', role: 'Account Executive', department: 'Sales', lat: 48.8606, lng: 2.3376, speed: '4 km/h (À pied)', battery: 78, status: 'Rendez-vous Client', mission: 'Démonstration Grand Compte', address: 'Rue de Rivoli, Paris', alert: null }
];

function showToast(message, type = 'info') {
  const container = document.getElementById('trackingToastContainer');
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

// Initialize Leaflet Map
function initMap() {
  map = L.map('map', {
    zoomControl: false
  }).setView([48.8566, 2.3522], 13);

  // Modern Clean CartoDB Voyager Tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors, © CartoDB',
    maxZoom: 19
  }).addTo(map);

  // Zoom control top-right
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Add Geofence Zones
  addGeofencingZones();

  // Load and place agents
  fetchAgents();
}

function addGeofencingZones() {
  // Green Zone: Centre Logistique Paris
  L.circle([48.8584, 2.3475], {
    color: '#059669',
    fillColor: '#10B981',
    fillOpacity: 0.12,
    weight: 2,
    radius: 2500
  }).bindPopup('<b>Zone Verte : Périmètre Autorisé Paris Centre</b>').addTo(map);

  // Orange Zone: Hub Logistique Bercy
  L.circle([48.8350, 2.3800], {
    color: '#D97706',
    fillColor: '#F59E0B',
    fillOpacity: 0.15,
    weight: 2,
    radius: 1400
  }).bindPopup('<b>Zone Orange : Hub Fret & Transit Bercy</b>').addTo(map);

  // Red Zone: Périmètre Non Autorisé
  L.polygon([
    [48.8900, 2.3900],
    [48.9100, 2.3900],
    [48.9100, 2.4200],
    [48.8900, 2.4200]
  ], {
    color: '#DC2626',
    fillColor: '#EF4444',
    fillOpacity: 0.15,
    weight: 2
  }).bindPopup('<b>Zone Rouge : Zone Interdite (Alerte Déclenchée)</b>').addTo(map);
}

async function fetchAgents() {
  try {
    const res = await fetch('/api/tracking/agents');
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      agentsData = data.data;
    }
  } catch (e) {
    console.log("Using local agent telemetry data");
  }

  renderAgentMarkers();
  renderAgentRoster();
}

function renderAgentMarkers() {
  agentsData.forEach(agent => {
    // Custom HTML Marker Icon
    const isAlert = agent.alert !== null;
    const markerColor = isAlert ? '#EF4444' : agent.speed === '0 km/h (Sur site)' ? '#3B82F6' : '#10B981';
    
    const icon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="background:${markerColor}; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:3px solid white; box-shadow:0 4px 14px rgba(0,0,0,0.3); font-weight:bold; font-size:12px; cursor:pointer;" class="${isAlert ? 'pin-pulse' : ''}">
          ${agent.name.split(' ').map(n=>n[0]).join('')}
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    if (markers[agent.id]) {
      markers[agent.id].setLatLng([agent.lat, agent.lng]);
    } else {
      const marker = L.marker([agent.lat, agent.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif; padding:4px;">
          <h4 style="font-weight:bold; font-size:13px; margin:0 0 2px 0;">${agent.name}</h4>
          <p style="font-size:11px; color:#64748B; margin:0 0 6px 0;">${agent.role} (${agent.department})</p>
          <div style="font-size:11px; background:#F1F5F9; padding:6px 8px; border-radius:6px; margin-bottom:6px;">
            <strong>Mission :</strong> ${agent.mission}<br/>
            <strong>Vitesse :</strong> ${agent.speed}<br/>
            <strong>Batterie :</strong> ${agent.battery}%
          </div>
          <p style="font-size:10px; color:#475569; margin:0;">📍 ${agent.address}</p>
        </div>
      `);
      markers[agent.id] = marker;
    }
  });
}

function renderAgentRoster() {
  const container = document.getElementById('agentRosterList');
  if (!container) return;
  container.innerHTML = '';

  agentsData.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'pt-3 pb-1 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition';
    card.onclick = () => focusOnAgent(agent.id);

    const isAlert = agent.alert !== null;
    const badgeColor = isAlert ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800';

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full ${isAlert ? 'bg-rose-600' : 'bg-indigo-600'} text-white flex items-center justify-center font-bold text-xs shadow-sm">
            ${agent.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div>
            <p class="font-bold text-xs text-slate-900">${agent.name}</p>
            <p class="text-[11px] text-slate-400">${agent.role}</p>
          </div>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}">
          ${agent.status}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2 mt-2.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <div><strong>Vitesse :</strong> ${agent.speed}</div>
        <div><strong>Batterie :</strong> ${agent.battery}%</div>
      </div>

      <p class="text-[10px] text-slate-400 mt-1 truncate">📍 ${agent.address}</p>
    `;
    container.appendChild(card);
  });
}

function focusOnAgent(id) {
  const agent = agentsData.find(a => a.id === id);
  if (agent && map) {
    map.flyTo([agent.lat, agent.lng], 16, { duration: 1.2 });
    if (markers[id]) markers[id].openPopup();
    showToast(`Zoom sur ${agent.name} (${agent.speed})`, 'info');
  }
}

function resetMapView() {
  if (map) {
    map.flyTo([48.8566, 2.3522], 13);
  }
}

function toggleSimulatedMovement() {
  const btn = document.getElementById('simMovementBtn');
  if (!isSimulating) {
    isSimulating = true;
    btn.className = 'px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition';
    btn.innerHTML = '<span class="material-symbols-outlined text-base">pause</span><span>Arrêter Simulation</span>';
    showToast('Simulation de navigation GPS en direct activée', 'success');

    simulationInterval = setInterval(() => {
      agentsData.forEach(agent => {
        if (agent.speed !== '0 km/h (Sur site)') {
          // Slight realistic drift
          agent.lat += (Math.random() - 0.5) * 0.0012;
          agent.lng += (Math.random() - 0.5) * 0.0012;
          agent.battery = Math.max(10, agent.battery - 0.1);
        }
      });
      renderAgentMarkers();
      renderAgentRoster();
    }, 2000);
  } else {
    isSimulating = false;
    clearInterval(simulationInterval);
    btn.className = 'px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition';
    btn.innerHTML = '<span class="material-symbols-outlined text-base">directions_car</span><span>Simuler Déplacement GPS</span>';
    showToast('Simulation arrêtée', 'info');
  }
}

document.addEventListener('DOMContentLoaded', initMap);
