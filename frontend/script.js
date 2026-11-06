// API Base URL
const API_BASE = '/api';

// Load attendance data
async function loadAttendanceData() {
  try {
    const response = await fetch(`${API_BASE}/attendance/today`);
    const data = await response.json();
    if (data.success) {
      console.log('Attendance data:', data.data);
    }
  } catch (error) {
    console.error('Error loading attendance:', error);
  }
}

// Load user profile
async function loadUserProfile() {
  try {
    const response = await fetch(`${API_BASE}/user`);
    const data = await response.json();
    if (data.success && data.data.name) {
      const nameElement = document.querySelector('h1');
      if (nameElement) {
        nameElement.textContent = `Bonjour ${data.data.name.split(' ')[0]}`;
      }
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

// Check-in function
async function handleCheckIn() {
  try {
    const response = await fetch(`${API_BASE}/attendance/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: new Date().toISOString() })
    });
    const data = await response.json();
    if (data.success) {
      showNotification('✓ Pointage enregistré', 'success');
      loadAttendanceData();
    }
  } catch (error) {
    showNotification('✗ Erreur lors du pointage', 'error');
  }
}

// Check-out function
async function handleCheckOut() {
  try {
    const response = await fetch(`${API_BASE}/attendance/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: new Date().toISOString() })
    });
    const data = await response.json();
    if (data.success) {
      showNotification('✓ Départ enregistré', 'success');
    }
  } catch (error) {
    showNotification('✗ Erreur lors de la départ', 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${
    type === 'success' ? 'bg-secondary' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  } z-50`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}

// Micro-interaction for clicking buttons
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', function() {
    this.classList.add('scale-95');
    setTimeout(() => this.classList.remove('scale-95'), 100);
  });
  
  // Add check-in/check-out handlers
  if (btn.textContent.includes('Reconnaissance') || btn.innerHTML.includes('face_6')) {
    btn.addEventListener('click', handleCheckIn);
  }
  if (btn.textContent.includes('Scanner QR')) {
    btn.addEventListener('click', handleCheckIn);
  }
});

// Navigation click handling
document.querySelectorAll('nav a, aside a').forEach(link => {
  link.addEventListener('click', function(e) {
    if (this.href.startsWith('#') || this.href === '#') {
      e.preventDefault();
    }
    const container = this.parentElement;
    if (container) {
      container.querySelectorAll('a').forEach(a => {
        a.classList.remove('bg-secondary-container', 'text-on-secondary-container');
        a.classList.add('opacity-80');
      });
      this.classList.add('bg-secondary-container', 'text-on-secondary-container');
      this.classList.remove('opacity-80');
    }
  });
});

// Card hover effects
document.querySelectorAll('.bg-white.border').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-2px)';
    card.style.boxShadow = '0px 8px 16px -4px rgba(15, 23, 42, 0.08)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = 'none';
  });

  card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  loadAttendanceData();
  console.log('Employee dashboard initialized');
});
