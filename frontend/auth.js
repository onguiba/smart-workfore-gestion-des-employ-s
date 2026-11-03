// Authentication Helper Functions for Smart Workforce AI

// Global SWA Auth object
window.SWAAuth = {
    // Get current session
    getSession: function() {
        const currentUser = localStorage.getItem('currentUser');
        const swaSession = localStorage.getItem('swa_session');
        
        if (currentUser) {
            return JSON.parse(currentUser);
        }
        
        if (swaSession) {
            return JSON.parse(swaSession);
        }
        
        return null;
    },
    
    // Set session
    setSession: function(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('swa_session', JSON.stringify(userData));
        return true;
    },
    
    // Check if user is authenticated
    isAuthenticated: function() {
        return this.getSession() !== null;
    },
    
    // Get user type (hr, employee)
    getUserType: function() {
        const session = this.getSession();
        return session ? session.userType : null;
    },
    
    // Logout
    logout: function(redirect = true) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('swa_session');
        
        if (redirect) {
            window.location.href = 'home.html';
        }
    },
    
    // Require authentication (redirect if not logged in)
    requireAuth: function(redirectUrl = '/home.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
    
    // Get user info
    getUserInfo: function() {
        return this.getSession();
    }
};

// Auto-check authentication on protected pages
document.addEventListener('DOMContentLoaded', function() {
    // Pages that require authentication
    const protectedPages = [
        'mon-compte.html',
        'dashboard.html',
        'employee-portal.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    // Check if current page requires auth
    if (protectedPages.includes(currentPage)) {
        if (!window.SWAAuth.isAuthenticated()) {
            console.log('Authentication required. Redirecting to home...');
            // Don't redirect immediately - let page decide
        }
    }
});

// Helper function to show toast notifications
function showToast(message, type = 'info') {
    // Check if toast function exists on page
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Create toast if doesn't exist
    let container = document.getElementById('toastContainer');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Set color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ SWA Auth loaded successfully');
