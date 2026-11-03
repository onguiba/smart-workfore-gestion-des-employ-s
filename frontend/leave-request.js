const API_BASE = 'http://localhost:3000/api';

// Leave type selection
document.querySelectorAll('[class*="rounded-xl p-lg mb-md"]').forEach((option, index) => {
  option.addEventListener('click', function() {
    if (index < 3) { // Leave type options
      document.querySelectorAll('[class*="rounded-xl p-lg mb-md"]').forEach((opt, i) => {
        if (i < 3) {
          opt.classList.remove('bg-secondary', 'text-on-secondary', 'border-secondary');
          opt.classList.add('bg-white', 'border-outline-variant');
        }
      });
      this.classList.remove('bg-white', 'border-outline-variant');
      this.classList.add('bg-secondary', 'text-on-secondary', 'border-secondary');
    }
  });
});

// Date input handlers
const startDateInput = document.querySelectorAll('input[type="date"]')[0];
const endDateInput = document.querySelectorAll('input[type="date"]')[1];

function calculateDuration() {
  if (startDateInput.value && endDateInput.value) {
    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const durationDisplay = document.querySelector('[class*="Durée"]');
    if (durationDisplay) {
      const parent = durationDisplay.closest('[class*="flex"]');
      if (parent) {
        const textElement = parent.querySelector('p:last-child');
        if (textElement) {
          textElement.textContent = diffDays + ' jours';
        }
      }
    }
  }
}

startDateInput?.addEventListener('change', calculateDuration);
endDateInput?.addEventListener('change', calculateDuration);

// File upload
document.querySelectorAll('[class*="border-dashed"]').forEach(el => {
  el.addEventListener('click', function() {
    showNotification('Sélectionner un fichier justificatif', 'info');
  });
});

// Helper notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${
    type === 'success' ? 'bg-secondary' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  } z-50`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Submit button
document.querySelectorAll('button').forEach(btn => {
  if (btn.textContent.includes('Soumettre') || btn.innerHTML.includes('done')) {
    btn.addEventListener('click', async function() {
      if (!startDateInput.value || !endDateInput.value) {
        showNotification('✗ Veuillez remplir les dates', 'error');
        return;
      }
      
      const start = new Date(startDateInput.value);
      const end = new Date(endDateInput.value);
      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      try {
        const response = await fetch(`${API_BASE}/leaves/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'Annual',
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            days: diffDays,
            reason: 'Demande de congés'
          })
        });
        const data = await response.json();
        if (data.success) {
          showNotification('✓ Demande soumise avec succès!', 'success');
          setTimeout(() => {
            window.location.href = 'leaves.html';
          }, 1500);
        }
      } catch (error) {
        showNotification('✗ Erreur lors de la soumission', 'error');
      }
    });
  }
  
  if (btn.textContent.includes('Ajouter au calendrier')) {
    btn.addEventListener('click', function() {
      showNotification('✓ Ajouté au calendrier', 'success');
    });
  }
});

// Navigation
document.querySelectorAll('nav a, aside a').forEach(link => {
  link.addEventListener('click', function(e) {
    if (this.href === '#' || this.href.startsWith('#')) {
      e.preventDefault();
    }
  });
});

console.log('Leave request form initialized');
