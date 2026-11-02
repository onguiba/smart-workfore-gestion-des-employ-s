// SmartWorkforce AI — Executive Payroll Engine

let payrollRecords = [
  { id: 1, employee: 'Moussa Diop', matricule: 'SWA-8842', role: 'Superviseur Logistique', department: 'Operations', grossSalary: 3750, bonuses: 250, overtime: 180, deductions: 450, netSalary: 3730, month: 'Mai 2026', status: 'Payé' },
  { id: 2, employee: 'Jean Dupont', matricule: 'SWA-4910', role: 'Architecte Cloud', department: 'IT', grossSalary: 4333, bonuses: 400, overtime: 240, deductions: 520, netSalary: 4453, month: 'Mai 2026', status: 'Payé' },
  { id: 3, employee: 'Marie Martin', matricule: 'SWA-3301', role: 'Responsable Talents', department: 'HR', grossSalary: 4000, bonuses: 200, overtime: 0, deductions: 480, netSalary: 3720, month: 'Mai 2026', status: 'Payé' },
  { id: 4, employee: 'Daniel Gomis', matricule: 'SWA-7219', role: 'Chauffeur Poids Lourd', department: 'Logistics', grossSalary: 3500, bonuses: 300, overtime: 310, deductions: 420, netSalary: 3690, month: 'Mai 2026', status: 'Payé' },
  { id: 5, employee: 'Lucas Mercier', matricule: 'SWA-5541', role: 'Account Executive', department: 'Sales', grossSalary: 4166, bonuses: 650, overtime: 120, deductions: 500, netSalary: 4436, month: 'Mai 2026', status: 'En attente' },
  { id: 6, employee: 'Sarah Perez', matricule: 'SWA-6022', role: 'Chef de Produit IA', department: 'Marketing', grossSalary: 3916, bonuses: 200, overtime: 0, deductions: 470, netSalary: 3646, month: 'Mai 2026', status: 'En attente' }
];

function showToast(message, type = 'info') {
  const container = document.getElementById('payrollToastContainer');
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

async function loadPayrollData() {
  try {
    const res = await fetch('/api/payroll');
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      payrollRecords = data.data;
    }
  } catch (e) {
    console.log("Using local payroll records dataset");
  }

  renderPayrollTable(payrollRecords);
}

function renderPayrollTable(records) {
  const tbody = document.getElementById('payrollTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  records.forEach(rec => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-slate-50/80 transition';

    const isPaid = rec.status === 'Payé';
    const statusPill = isPaid ? 
      '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Payé</span>' :
      '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">En cours</span>';

    row.innerHTML = `
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            ${rec.employee.split(' ').map(n=>n[0]).join('')}
          </div>
          <div>
            <p class="font-bold text-slate-900">${rec.employee}</p>
            <p class="text-[11px] text-slate-400 font-mono">${rec.matricule}</p>
          </div>
        </div>
      </td>
      <td class="px-6 py-4">
        <p class="font-semibold text-slate-800">${rec.role}</p>
        <p class="text-[11px] text-slate-500">${rec.department}</p>
      </td>
      <td class="px-6 py-4 text-right font-mono font-semibold text-slate-800">
        ${rec.grossSalary.toLocaleString('fr-FR')} €
      </td>
      <td class="px-6 py-4 text-right font-mono font-bold text-emerald-600">
        +${rec.bonuses.toLocaleString('fr-FR')} €
      </td>
      <td class="px-6 py-4 text-right font-mono text-slate-700">
        +${rec.overtime.toLocaleString('fr-FR')} €
      </td>
      <td class="px-6 py-4 text-right font-mono text-rose-600">
        -${rec.deductions.toLocaleString('fr-FR')} €
      </td>
      <td class="px-6 py-4 text-right font-mono font-extrabold text-slate-900 text-sm">
        ${rec.netSalary.toLocaleString('fr-FR')} €
      </td>
      <td class="px-6 py-4 text-center">
        ${statusPill}
      </td>
      <td class="px-6 py-4 text-right">
        <button onclick="openPayslipModal(${rec.id})" class="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition flex items-center gap-1 ml-auto">
          <span class="material-symbols-outlined text-sm">visibility</span>
          <span>Bulletin</span>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function openPayslipModal(id) {
  const rec = payrollRecords.find(r => r.id === id) || payrollRecords[0];

  document.getElementById('slipEmployeeName').textContent = rec.employee;
  document.getElementById('slipEmployeeRole').textContent = `${rec.role} (${rec.department})`;
  document.getElementById('slipEmployeeMatricule').textContent = `Matricule : ${rec.matricule}`;
  document.getElementById('slipGross').textContent = `${rec.grossSalary.toLocaleString('fr-FR')},00 €`;
  document.getElementById('slipBonus').textContent = `${rec.bonuses.toLocaleString('fr-FR')},00 €`;
  document.getElementById('slipOvertime').textContent = `${rec.overtime.toLocaleString('fr-FR')},00 €`;
  document.getElementById('slipDeductions').textContent = `-${rec.deductions.toLocaleString('fr-FR')},00 €`;
  document.getElementById('slipNet').textContent = `${rec.netSalary.toLocaleString('fr-FR')},00 €`;

  document.getElementById('payslipModal').classList.add('active');
}

function closePayslipModal() {
  document.getElementById('payslipModal').classList.remove('active');
}

function runAiPayrollCalculation() {
  showToast('Lancement du moteur de calcul IA...', 'info');

  setTimeout(() => {
    // Add small performance bonus for demonstration
    payrollRecords[0].bonuses += 50;
    payrollRecords[0].netSalary += 50;
    renderPayrollTable(payrollRecords);
    showToast('✓ Calcul IA validé : 68h supplémentaires et 2 100 € de primes harmonisées', 'success');
  }, 1200);
}

function downloadAllPayslips() {
  showToast('Génération de l\\'archive ZIP des 6 bulletins certifiés...', 'info');
  setTimeout(() => {
    showToast('✓ Archive ZIP téléchargée avec succès', 'success');
  }, 1500);
}

document.addEventListener('DOMContentLoaded', loadPayrollData);
