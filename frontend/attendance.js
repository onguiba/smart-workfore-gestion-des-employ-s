// Attendance Page JavaScript
let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let photoData = null;
let locationData = null;
let stream = null;
let currentEmployee = null;
let todayAttendance = [];

// Update time continuously
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    const dateString = now.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('currentTime').textContent = timeString;
    document.getElementById('currentDate').textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
}

// Initialize
updateTime();
setInterval(updateTime, 1000);
getLocation();

// Get location
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
                
                document.getElementById('locationBox').style.display = 'flex';
                document.getElementById('locationText').innerHTML = `
                    Lat: ${locationData.latitude.toFixed(6)}, Long: ${locationData.longitude.toFixed(6)}<br>
                    <small style="font-size: 12px;">Précision: ${Math.round(locationData.accuracy)}m - ${new Date().toLocaleTimeString('fr-FR')}</small>
                `;
            },
            (error) => {
                showAlert('⚠️ Impossible de récupérer la localisation. Activez le GPS.', 'error');
                console.error('Geolocation error:', error);
            }
        );
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
        document.getElementById('cameraContainer').style.display = 'block';
        
        document.getElementById('startCamera').disabled = true;
        document.getElementById('capturePhoto').disabled = false;
        
        showAlert('✅ Caméra activée! Positionnez-vous correctement.', 'success');
    } catch (err) {
        showAlert('❌ Impossible d\'accéder à la caméra. Vérifiez les permissions.', 'error');
        console.error('Camera error:', err);
    }
});

// Capture photo
document.getElementById('capturePhoto').addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    photoData = canvas.toDataURL('image/jpeg', 0.8);
    
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = `<img src="${photoData}" alt="Photo capturée" style="max-width: 400px; border-radius: 12px;">`;
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    document.getElementById('cameraContainer').style.display = 'none';
    document.getElementById('capturePhoto').disabled = true;
    
    // Simulate face recognition
    recognizeFace();
});

// Simulate face recognition
async function recognizeFace() {
    showAlert('🔍 Reconnaissance faciale en cours...', 'success');
    
    setTimeout(async () => {
        // In a real app, this would call an AI service
        // For now, we'll ask for employee email
        const email = prompt('Email de l\'employé (pour identification):');
        
        if (!email) {
            showAlert('❌ Identification annulée', 'error');
            resetCamera();
            return;
        }
        
        try {
            const response = await fetch('/api/employees/identify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email,
                    photo: photoData
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.employee) {
                currentEmployee = result.employee;
                
                // Sauvegarder dans localStorage
                localStorage.setItem('currentUser', JSON.stringify(currentEmployee));
                
                displayEmployeeInfo();
                document.getElementById('actionButtons').style.display = 'flex';
                showAlert(`✅ Bienvenue ${currentEmployee.name}!`, 'success');
            } else {
                showAlert('❌ Employé non reconnu. Veuillez vous inscrire d\'abord.', 'error');
                resetCamera();
            }
        } catch (error) {
            showAlert('❌ Erreur lors de l\'identification: ' + error.message, 'error');
            console.error('Recognition error:', error);
            resetCamera();
        }
    }, 1500);
}

// Display employee info
function displayEmployeeInfo() {
    document.getElementById('currentInfo').style.display = 'block';
    document.getElementById('employeeName').textContent = currentEmployee.name;
    
    if (currentEmployee.checkInTime) {
        document.getElementById('checkInTime').textContent = currentEmployee.checkInTime;
        document.getElementById('checkInLocation').textContent = 
            `${currentEmployee.checkInLocation?.latitude?.toFixed(4) || 'N/A'}, ${currentEmployee.checkInLocation?.longitude?.toFixed(4) || 'N/A'}`;
        
        document.getElementById('checkInBtn').disabled = true;
        document.getElementById('checkOutBtn').disabled = false;
    } else {
        document.getElementById('checkInTime').textContent = 'Non pointé';
        document.getElementById('checkInLocation').textContent = '--';
        
        document.getElementById('checkInBtn').disabled = false;
        document.getElementById('checkOutBtn').disabled = true;
    }
}

// Check in
document.getElementById('checkInBtn').addEventListener('click', async () => {
    if (!currentEmployee || !photoData || !locationData) {
        showAlert('❌ Informations manquantes pour le pointage', 'error');
        return;
    }
    
    document.getElementById('loading').style.display = 'block';
    
    const checkInData = {
        employeeId: currentEmployee.id,
        employeeEmail: currentEmployee.email,
        checkInTime: new Date().toISOString(),
        checkInTimeFormatted: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        checkInDate: new Date().toLocaleDateString('fr-FR'),
        location: locationData,
        photo: photoData,
        type: 'checkin'
    };
    
    try {
        const response = await fetch('/api/attendance/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkInData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('✅ Arrivée enregistrée avec succès!', 'success');
            
            currentEmployee.checkInTime = checkInData.checkInTimeFormatted;
            currentEmployee.checkInLocation = locationData;
            
            displayEmployeeInfo();
            addToHistory('Arrivée', checkInData.checkInTimeFormatted);
            
            document.getElementById('statusTitle').textContent = '✅ Vous êtes pointé(e)';
            document.getElementById('statusMessage').textContent = `Arrivée enregistrée à ${checkInData.checkInTimeFormatted}`;
        } else {
            throw new Error(result.error || 'Erreur lors du pointage');
        }
    } catch (error) {
        showAlert('❌ Erreur: ' + error.message, 'error');
        console.error('Check-in error:', error);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
});

// Check out
document.getElementById('checkOutBtn').addEventListener('click', async () => {
    if (!currentEmployee || !photoData || !locationData) {
        showAlert('❌ Informations manquantes pour le pointage', 'error');
        return;
    }
    
    document.getElementById('loading').style.display = 'block';
    
    const checkOutData = {
        employeeId: currentEmployee.id,
        employeeEmail: currentEmployee.email,
        checkOutTime: new Date().toISOString(),
        checkOutTimeFormatted: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        checkOutDate: new Date().toLocaleDateString('fr-FR'),
        location: locationData,
        photo: photoData,
        type: 'checkout'
    };
    
    try {
        const response = await fetch('/api/attendance/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkOutData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('✅ Départ enregistré avec succès!', 'success');
            
            addToHistory('Départ', checkOutData.checkOutTimeFormatted);
            
            document.getElementById('statusTitle').textContent = '🚪 Départ enregistré';
            document.getElementById('statusMessage').textContent = `Bonne journée, ${currentEmployee.name}!`;
            
            // Reset for next use
            setTimeout(() => {
                resetCamera();
                window.location.reload();
            }, 3000);
        } else {
            throw new Error(result.error || 'Erreur lors du pointage');
        }
    } catch (error) {
        showAlert('❌ Erreur: ' + error.message, 'error');
        console.error('Check-out error:', error);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
});

// Add to history
function addToHistory(type, time) {
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    
    historySection.style.display = 'block';
    
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
        <div>
            <div class="history-item-date">${new Date().toLocaleDateString('fr-FR')}</div>
            <div class="history-item-time">${time}</div>
        </div>
        <span class="badge ${type === 'Arrivée' ? 'badge-in' : 'badge-out'}">${type}</span>
    `;
    
    historyList.insertBefore(item, historyList.firstChild);
}

// Reset camera
function resetCamera() {
    photoData = null;
    currentEmployee = null;
    
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('startCamera').disabled = false;
    document.getElementById('capturePhoto').disabled = true;
    document.getElementById('actionButtons').style.display = 'none';
    document.getElementById('currentInfo').style.display = 'none';
    
    video.style.display = 'none';
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

// Show alert
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}
