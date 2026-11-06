// SmartWorkforce AI — Leaves Management Client

let leavesList = [
  { id: 1, employee: 'Moussa Diop', type: 'Congés Payés', startDate: '2026-05-15', endDate: '2026-05-24', status: 'approved', days: 10, reason: 'Vacances annuelles d\'été' },
  { id: 2, employee: 'Jean Dupont', type: 'Congé Maladie', startDate: '2026-04-10', endDate: '2026-04-11', status: 'approved', days: 2, reason: 'Certificat médical transmis' },
  { id: 3, employee: 'Marie Martin', type: 'RTT', startDate: '2026-06-02', endDate: '2026-06-02', status: 'pending', days: 1, reason: 'Récupération journée d\'astreinte' },
  { id: 4, employee: 'Sarah Perez', type: 'Sans Solde', startDate: '2026-07-01', endDate: '2026-07-05', status: 'pending', days: 5, reason: 'Projet personnel' }
];

let leaveBalance = {
  annual: { total: 30, used: 8, remaining: 22 },
  sick: { total: 10, used: 2, remaining: 8 },
  rtt: { total: 12, used: 3, remaining: 9 }
};

function showToast(message, type = 'success') {
  const container = document.getElementById('leavesToastContainer');
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

async function loadLeavesData() {
  try {
    const resBal = await fetch('/api/leaves/balance');
    const dataBal = await resBal.json();
    if (dataBal.success) {
      leaveBalance = dataBal.data;
      updateBalanceUI();
    }

    const resLeaves = await fetch('/api/leaves');
    const dataLeaves = await resLeaves.json();
    if (dataLeaves.success && dataLeaves.data.length > 0) {
      leavesList = dataLeaves.data;
    }
  } catch (e) {
    console.log("Using local leave dataset");
  }

  updateBalanceUI();
  renderLeavesTable();
}

function updateBalanceUI() {
  const ann = document.getElementById('balAnnualRemaining');
  const sick = document.getElementById('balSickRemaining');
  const rtt = document.getElementById('balRttRemaining');

  if (ann) ann.textContent = leaveBalance.annual.remaining;
  if (sick) sick.textContent = leaveBalance.sick.remaining;
  if (rtt) rtt.textContent = leaveBalance.rtt ? leaveBalance.rtt.remaining : 9;
}

function renderLeavesTable() {
  const tbody = document.getElementById('leavesTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  leavesList.forEach(l => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-slate-50/80 transition';

    let statusPill = '';
    if (l.status === 'approved') {
      statusPill = '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Validé</span>';
    } else if (l.status === 'rejected') {
      statusPill = '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Refusé</span>';
    } else {
      statusPill = '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">En attente</span>';
    }

    row.innerHTML = `
      <td class="px-6 py-4">
        <p class="font-bold text-slate-900">${l.employee || 'Moussa Diop'}</p>
        <p class="text-[11px] text-slate-400">Demandeur certifié</p>
      </td>
      <td class="px-6 py-4 font-semibold text-purple-700">
        ${l.type}
      </td>
      <td class="px-6 py-4 text-slate-700">
        ${l.startDate} → ${l.endDate}
      </td>
      <td class="px-6 py-4 text-center font-bold text-slate-900">
        ${l.days} j
      </td>
      <td class="px-6 py-4 text-slate-500 italic">
        "${l.reason || 'Demande normale'}"
      </td>
      <td class="px-6 py-4 text-center">
        ${statusPill}
      </td>
      <td class="px-6 py-4 text-right">
        ${l.status === 'pending' ? `
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="changeLeaveStatus(${l.id}, 'approved')" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-sm">
              Valider
            </button>
            <button onclick="changeLeaveStatus(${l.id}, 'rejected')" class="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition">
              Refuser
            </button>
          </div>
        ` : `
          <span class="text-[11px] text-slate-400">Traité</span>
        `}
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function changeLeaveStatus(id, newStatus) {
  try {
    await fetch('/api/leaves/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaveId: id, status: newStatus })
    });
  } catch(e) {}

  const item = leavesList.find(l => l.id === id);
  if (item) item.status = newStatus;

  showToast(`✓ Demande de congé ${newStatus === 'approved' ? 'validée avec succès' : 'refusée'}`);
  renderLeavesTable();
}

function openNewLeaveModal() {
  const start = document.getElementById('modalLeaveStart');
  const end = document.getElementById('modalLeaveEnd');
  
  // Set default dates to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 5);

  if (start) start.value = tomorrow.toISOString().split('T')[0];
  if (end) end.value = nextWeek.toISOString().split('T')[0];
  autoCalcModalDuration();

  document.getElementById('newLeaveModal').classList.add('active');
}

function closeNewLeaveModal() {
  document.getElementById('newLeaveModal').classList.remove('active');
}

function autoCalcModalDuration() {
  const startVal = document.getElementById('modalLeaveStart')?.value;
  const endVal = document.getElementById('modalLeaveEnd')?.value;
  const display = document.getElementById('modalCalculatedDays');
  if (startVal && endVal && display) {
    const s = new Date(startVal);
    const e = new Date(endVal);
    const diffDays = Math.max(1, Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1);
    display.textContent = `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  }
}

async function handleLeaveSubmit(e) {
  e.preventDefault();
  const type = document.getElementById('modalLeaveType').value;
  const startDate = document.getElementById('modalLeaveStart').value;
  const endDate = document.getElementById('modalLeaveEnd').value;
  const reason = document.getElementById('modalLeaveReason').value || 'Demande de congés';

  const s = new Date(startDate);
  const ed = new Date(endDate);
  const diffDays = Math.max(1, Math.ceil(Math.abs(ed - s) / (1000 * 60 * 60 * 24)) + 1);

  const newLeave = {
    id: leavesList.length + 1,
    employee: 'Moussa Diop',
    type,
    startDate,
    endDate,
    days: diffDays,
    reason,
    status: 'pending'
  };

  try {
    await fetch('/api/leaves/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLeave)
    });
  } catch(err) {}

  leavesList.unshift(newLeave);
  renderLeavesTable();
  closeNewLeaveModal();
  showToast('✓ Demande soumise et transmise à la direction RH', 'success');
}

document.addEventListener('DOMContentLoaded', loadLeavesData);
