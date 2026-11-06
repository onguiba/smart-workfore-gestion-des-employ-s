// SmartWorkforce AI — Missions Management Client

let missionsList = [
  { id: 1, title: 'Livraison Express Client ABC', status: 'inProgress', progress: 65, dueTime: '16:00', location: 'Zone Industrielle Nord, Paris', assignee: 'Moussa Diop', priority: 'Haute' },
  { id: 2, title: 'Audit Système & Sécurité IT', status: 'completed', progress: 100, dueTime: '17:00', location: 'Siège Social - Bâtiment C', assignee: 'Jean Dupont', priority: 'Normale' },
  { id: 3, title: 'Session de Formation RH & Onboarding', status: 'pending', progress: 20, dueTime: '15:30', location: 'Salle de formation 4B', assignee: 'Marie Martin', priority: 'Moyenne' },
  { id: 4, title: 'Réapprovisionnement Hub Logistique Sud', status: 'inProgress', progress: 40, dueTime: '18:00', location: 'Entrepôt Bercy 75012', assignee: 'Daniel Gomis', priority: 'Urgente' }
];

function showToast(message, type = 'success') {
  const container = document.getElementById('missionsToastContainer');
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

async function loadMissionsData() {
  try {
    const res = await fetch('/api/missions');
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      missionsList = data.data;
    }
  } catch (e) {
    console.log("Using local missions dataset");
  }

  renderMissionsGrid(missionsList);
  updateKpiStrip();
}

function updateKpiStrip() {
  const inProg = missionsList.filter(m => m.status === 'inProgress').length;
  const done = missionsList.filter(m => m.status === 'completed').length;
  const act = document.getElementById('kpiActiveMissions');
  const comp = document.getElementById('kpiCompletedMissions');
  if (act) act.textContent = inProg;
  if (comp) comp.textContent = done;
}

function renderMissionsGrid(list) {
  const container = document.getElementById('missionsGridContainer');
  if (!container) return;
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<div class="col-span-full p-12 text-center text-slate-400">Aucune mission ne correspond à ce filtre.</div>';
    return;
  }

  list.forEach(m => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between';

    let statusPill = '';
    let barColor = 'bg-blue-600';
    if (m.status === 'completed') {
      statusPill = '<span class="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">Terminée</span>';
      barColor = 'bg-emerald-600';
    } else if (m.status === 'inProgress') {
      statusPill = '<span class="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">En cours</span>';
      barColor = 'bg-blue-600';
    } else {
      statusPill = '<span class="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">En attente</span>';
      barColor = 'bg-amber-500';
    }

    const isUrgent = m.priority === 'Urgente' || m.priority === 'Haute';

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-3">
          ${statusPill}
          <span class="text-[10px] font-bold uppercase tracking-wider ${isUrgent ? 'text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded' : 'text-slate-400'}">
            ${m.priority || 'Normale'}
          </span>
        </div>

        <h3 class="font-bold text-slate-900 text-base mb-1">${m.title}</h3>
        <p class="text-xs text-slate-500 flex items-center gap-1 mb-4">
          <span class="material-symbols-outlined text-sm text-slate-400">location_on</span>
          <span>${m.location}</span>
        </p>

        <!-- Progress meter -->
        <div class="space-y-1.5 mb-4">
          <div class="flex justify-between text-xs">
            <span class="text-slate-500">Avancement</span>
            <span class="font-extrabold text-slate-900">${m.progress || 0}%</span>
          </div>
          <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="${barColor} h-full rounded-full transition-all duration-500" style="width: ${m.progress || 0}%;"></div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
          <div><strong>Assigné :</strong> ${m.assignee}</div>
          <div><strong>Échéance :</strong> ${m.dueTime}</div>
        </div>
      </div>

      <div class="space-y-2 pt-2 border-t border-slate-100">
        ${m.status !== 'completed' ? `
          <div class="grid grid-cols-2 gap-2">
            <button onclick="advanceMissionStep(${m.id})" class="py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition">
              +20% Étape
            </button>
            <button onclick="completeMissionNow(${m.id})" class="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm">
              Terminer
            </button>
          </div>
        ` : `
          <div class="p-2 bg-emerald-50 text-emerald-800 text-center rounded-xl text-xs font-bold">
            ✓ Mission clôturée avec succès
          </div>
        `}
        <a href="tracking.html" class="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-center text-[11px] font-semibold block transition">
          Localiser sur la carte GPS
        </a>
      </div>
    `;

    container.appendChild(card);
  });
}

function filterMissions() {
  const filter = document.getElementById('missionFilterSelect')?.value || 'ALL';
  if (filter === 'ALL') {
    renderMissionsGrid(missionsList);
  } else {
    const filtered = missionsList.filter(m => m.status === filter);
    renderMissionsGrid(filtered);
  }
}

async function advanceMissionStep(id) {
  const m = missionsList.find(item => item.id === id);
  if (m) {
    m.progress = Math.min(100, (m.progress || 0) + 20);
    if (m.progress >= 100) {
      m.status = 'completed';
      showToast(`✓ Mission "${m.title}" achevée à 100% !`, 'success');
    } else {
      showToast(`Progression mise à jour : ${m.progress}%`);
    }

    try {
      await fetch('/api/missions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: id, progress: m.progress, status: m.status })
      });
    } catch(e) {}

    renderMissionsGrid(missionsList);
    updateKpiStrip();
  }
}

async function completeMissionNow(id) {
  const m = missionsList.find(item => item.id === id);
  if (m) {
    m.progress = 100;
    m.status = 'completed';

    try {
      await fetch('/api/missions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: id, progress: 100, status: 'completed' })
      });
    } catch(e) {}

    showToast(`✓ Mission clôturée avec succès !`, 'success');
    renderMissionsGrid(missionsList);
    updateKpiStrip();
  }
}

function openNewMissionModal() {
  document.getElementById('newMissionModal').classList.add('active');
}

function closeNewMissionModal() {
  document.getElementById('newMissionModal').classList.remove('active');
}

async function handleCreateMission(e) {
  e.preventDefault();
  const title = document.getElementById('modalMisTitle').value;
  const assignee = document.getElementById('modalMisAssignee').value;
  const priority = document.getElementById('modalMisPriority').value;
  const location = document.getElementById('modalMisLocation').value;
  const dueTime = document.getElementById('modalMisDue').value;

  const newMis = {
    id: missionsList.length + 1,
    title,
    assignee,
    priority,
    location,
    dueTime,
    status: 'inProgress',
    progress: 10
  };

  try {
    await fetch('/api/missions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMis)
    });
  } catch(e) {}

  missionsList.unshift(newMis);
  renderMissionsGrid(missionsList);
  updateKpiStrip();
  closeNewMissionModal();
  showToast(`✓ Mission "${title}" assignée à ${assignee}`, 'success');
}

document.addEventListener('DOMContentLoaded', loadMissionsData);
