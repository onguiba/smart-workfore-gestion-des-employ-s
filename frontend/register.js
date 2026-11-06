// Registration Page JavaScript
let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let photoData = null;
let locationData = null;
let stream = null;

// Get location on page load
window.addEventListener('DOMContentLoaded', () => {
    getLocation();
});

// Get user's location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                };
                
                document.getElementById('locationInfo').style.display = 'flex';
                document.getElementById('locationText').innerHTML = `
                    Lat: ${locationData.latitude.toFixed(6)}, 
                    Long: ${locationData.longitude.toFixed(6)}<br>
                    <small>Précision: ${Math.round(locationData.accuracy)}m</small>
                `;
                
                checkFormReady();
            },
            (error) => {
                showAlert('Erreur: Impossible de récupérer la localisation. Veuillez activer le GPS.', 'error');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        showAlert('Erreur: La géolocalisation n\'est pas supportée par ce navigateur.', 'error');
    }
}

// Start camera
document.getElementById('startCamera').addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            } 
        });
        
        video.srcObject = stream;
        video.style.display = 'block';
        
        document.getElementById('startCamera').disabled = true;
        document.getElementById('capturePhoto').disabled = false;
        
        showAlert('Caméra activée! Positionnez-vous et cliquez sur "Prendre la photo"', 'success');
    } catch (err) {
        showAlert('Erreur: Impossible d\'accéder à la caméra. Vérifiez les permissions.', 'error');
        console.error('Camera error:', err);
    }
});

// Capture photo - ⭐ VALIDATION AUTOMATIQUE
document.getElementById('capturePhoto').addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    photoData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Display preview
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = `<img src="${photoData}" class="captured-photo" alt="Photo capturée" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">`;
    
    // Stop camera
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    video.style.display = 'none';
    
    document.getElementById('capturePhoto').disabled = true;
    document.getElementById('retakePhoto').style.display = 'inline-block';
    
    // ⭐ VALIDATION AUTOMATIQUE : La photo est validée automatiquement
    showAlert('✅ Photo capturée et validée! Elle sera enregistrée dans la base de données.', 'success');
    
    checkFormReady();
});

// Retake photo
document.getElementById('retakePhoto').addEventListener('click', () => {
    photoData = null;
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('retakePhoto').style.display = 'none';
    document.getElementById('startCamera').disabled = false;
    document.getElementById('capturePhoto').disabled = true;
    video.style.display = 'block';
    
    checkFormReady();
});

// Check if form is ready to submit
function checkFormReady() {
    const hasPhoto = photoData !== null;
    const hasLocation = locationData !== null;
    
    document.getElementById('submitBtn').disabled = !(hasPhoto && hasLocation);
}

// Handle form submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!photoData) {
        showAlert('Veuillez capturer votre photo avant de continuer.', 'error');
        return;
    }
    
    if (!locationData) {
        showAlert('Veuillez activer la géolocalisation avant de continuer.', 'error');
        return;
    }
    
    // Générer un email automatique si non fourni
    let userEmail = document.getElementById('email').value.trim();
    const fullName = document.getElementById('fullName').value;
    
    if (!userEmail) {
        // Créer un email automatique basé sur le nom
        const nameParts = fullName.toLowerCase().trim().split(' ');
        const firstName = nameParts[0] || 'employe';
        const lastName = nameParts[nameParts.length - 1] || '';
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        userEmail = `${firstName}.${lastName}${randomNum}@smartworkforce.ai`;
        
        showAlert(`📧 Email généré automatiquement: ${userEmail}`, 'success');
    }
    
    const formData = {
        fullName: fullName,
        email: userEmail,
        phone: document.getElementById('phone').value,
        position: document.getElementById('position').value,
        department: document.getElementById('department').value,
        salary: parseFloat(document.getElementById('salary').value),
        photo: photoData,
        location: locationData,
        registrationTime: new Date().toISOString(),
        registrationDate: new Date().toLocaleDateString('fr-FR'),
        registrationHour: new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    };
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('submitBtn').disabled = true;
    
    try {
        const response = await fetch('/api/employees/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('✅ Inscription réussie! Photo enregistrée dans la base de données. Redirection...', 'success');
            
            // Sauvegarder l'utilisateur dans localStorage
            localStorage.setItem('currentUser', JSON.stringify(result.data));
            
            // ⭐ Enregistrer le premier pointage automatiquement
            try {
                await fetch('/api/employees/checkin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        employeeId: result.data.id,
                        employeeEmail: result.data.email,
                        employeeName: result.data.name,
                        location: locationData,
                        checkInTime: new Date().toISOString(),
                        checkInTimeFormatted: new Date().toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        }),
                        checkInDate: new Date().toLocaleDateString('fr-FR'),
                        photo: photoData
                    })
                });
            } catch (checkinError) {
                console.error('Erreur pointage automatique:', checkinError);
            }
            
            setTimeout(() => {
                window.location.href = 'mon-compte.html';
            }, 1500);
        } else {
            throw new Error(result.message || result.error || 'Erreur lors de l\'inscription');
        }
    } catch (error) {
        showAlert('❌ Erreur: ' + error.message, 'error');
        console.error('Registration error:', error);
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('submitBtn').disabled = false;
    }
});

// Show alert message
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

// Validate form inputs
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value.trim();
    
    // Si l'email est vide, c'est OK (optionnel)
    if (!email) {
        this.style.borderColor = '#e0e0e0';
        return;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailPattern.test(email)) {
        this.style.borderColor = 'orange';
        showAlert('Format d\'email invalide (sera généré automatiquement si vide)', 'warning');
    } else {
        this.style.borderColor = 'green';
    }
});

document.getElementById('phone').addEventListener('blur', function() {
    const phone = this.value;
    const phonePattern = /^[\+]?[0-9]{10,}$/;
    
    if (!phonePattern.test(phone.replace(/\s/g, ''))) {
        this.style.borderColor = 'red';
        showAlert('Format de téléphone invalide', 'error');
    } else {
        this.style.borderColor = '#e0e0e0';
    }
});
