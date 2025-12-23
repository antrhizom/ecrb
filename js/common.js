// Common JavaScript Functions for Urheberrecht Lern-App

// Authentication State Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('User logged in:', user.uid);
        
        // Load name from localStorage or Firestore
        let userName = localStorage.getItem('userName');
        
        if (!userName) {
            // Try to load from Firestore
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().name) {
                    userName = doc.data().name;
                    localStorage.setItem('userName', userName);
                    updateUserDisplay(userName);
                }
            });
        } else {
            updateUserDisplay(userName);
        }
        
        // Load user progress
        loadUserProgress(user.uid);
    } else {
        // User is signed out - check for saved code
        const savedCode = localStorage.getItem('userCode');
        const savedUserId = localStorage.getItem('userId');
        const savedName = localStorage.getItem('userName');
        
        if (savedCode && savedUserId && 
            !window.location.pathname.includes('index.html') && 
            !window.location.pathname.endsWith('/')) {
            // User has code but no Firebase session - load data directly
            console.log('Loading with saved code:', savedCode);
            if (savedName) {
                updateUserDisplay(savedName);
            }
            loadUserProgress(savedUserId);
        } else if (!window.location.pathname.includes('index.html') && 
                   !window.location.pathname.endsWith('/')) {
            // No code, redirect to login
            window.location.href = 'index.html';
        }
    }
});

// Helper function to update user display
function updateUserDisplay(userName) {
    const userCode = localStorage.getItem('userCode');
    
    // Update name displays
    const nameElements = document.querySelectorAll('#user-name-header, .user-name-display');
    nameElements.forEach(el => {
        if (userCode) {
            // Show name with code preview
            el.textContent = `${userName} (${userCode.substring(0, 7)}...)`;
            el.title = `Name: ${userName}\nCode: ${userCode}`;
        } else {
            el.textContent = userName;
        }
    });
    
    // Legacy: Update email/code elements if any
    const legacyElements = document.querySelectorAll('.user-email, .user-code-display');
    legacyElements.forEach(el => {
        el.textContent = userName;
    });
}

// Logout Function
function logout() {
    const userCode = localStorage.getItem('userCode');
    const confirmMsg = userCode 
        ? `Wirklich abmelden?\n\nIhr Code: ${userCode}\n\n(Code bleibt gespeichert für späteren Login)`
        : 'Wirklich abmelden?';
    
    if (confirm(confirmMsg)) {
        auth.signOut().then(() => {
            // Code bleibt in localStorage
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Logout error:', error);
            alert('Fehler beim Ausloggen. Bitte versuchen Sie es erneut.');
        });
    }
}

// Load User Progress from Firestore
async function loadUserProgress(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (userDoc.exists) {
            const data = userDoc.data();
            updateProgressDisplay(data);
            return data;
        } else {
            // Create new user document
            const initialData = {
                email: auth.currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                modules: {
                    modul1: { completed: false, score: 0, progress: 0 },
                    modul2: { completed: false, score: 0, progress: 0 },
                    modul3: { completed: false, score: 0, progress: 0 },
                    modul4: { completed: false, score: 0, progress: 0 }
                },
                totalPoints: 0,
                overallProgress: 0
            };
            
            await db.collection('users').doc(userId).set(initialData);
            updateProgressDisplay(initialData);
            return initialData;
        }
    } catch (error) {
        console.error('Error loading user progress:', error);
        return null;
    }
}

// Update Progress Display
function updateProgressDisplay(data) {
    // Update overall progress bar
    const progressFill = document.querySelector('.progress-bar-fill');
    if (progressFill) {
        progressFill.style.width = `${data.overallProgress || 0}%`;
    }
    
    // Update progress text
    const progressText = document.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = `${data.overallProgress || 0}%`;
    }
    
    // Update points display
    const pointsDisplay = document.querySelector('.points-value');
    if (pointsDisplay) {
        pointsDisplay.textContent = data.totalPoints || 0;
    }
    
    // Update module cards if on dashboard
    if (data.modules) {
        Object.keys(data.modules).forEach((moduleId) => {
            const moduleCard = document.querySelector(`[data-module="${moduleId}"]`);
            if (moduleCard) {
                const moduleData = data.modules[moduleId];
                
                if (moduleData.completed) {
                    moduleCard.classList.add('completed');
                }
                
                // Update module progress if element exists
                const moduleProgress = moduleCard.querySelector('.module-progress');
                if (moduleProgress) {
                    moduleProgress.textContent = `${moduleData.progress}% abgeschlossen`;
                }
            }
        });
    }
}

// Save Module Progress
async function saveModuleProgress(moduleId, progressData) {
    const user = auth.currentUser;
    if (!user) {
        console.error('No user logged in');
        return;
    }
    
    try {
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        const currentData = userDoc.data();
        
        // Update module data
        const updatedModules = {
            ...currentData.modules,
            [moduleId]: {
                ...currentData.modules[moduleId],
                ...progressData
            }
        };
        
        // Calculate overall progress
        const modulesArray = Object.values(updatedModules);
        const completedModules = modulesArray.filter(m => m.completed).length;
        const overallProgress = Math.round((completedModules / 4) * 100);
        
        // Calculate total points
        const totalPoints = modulesArray.reduce((sum, m) => sum + (m.score || 0), 0);
        
        // Update Firestore
        await userRef.update({
            [`modules.${moduleId}`]: updatedModules[moduleId],
            overallProgress: overallProgress,
            totalPoints: totalPoints,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Progress saved successfully');
        
        // Update UI
        updateProgressDisplay({
            modules: updatedModules,
            overallProgress: overallProgress,
            totalPoints: totalPoints
        });
        
        return true;
    } catch (error) {
        console.error('Error saving progress:', error);
        return false;
    }
}

// Mark Module as Complete
async function completeModule(moduleId, finalScore) {
    return await saveModuleProgress(moduleId, {
        completed: true,
        progress: 100,
        score: finalScore,
        completedAt: new Date().toISOString()
    });
}

// Check if all modules are complete
async function checkAllModulesComplete() {
    const user = auth.currentUser;
    if (!user) return false;
    
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const data = userDoc.data();
        
        if (!data || !data.modules) return false;
        
        const allComplete = Object.values(data.modules).every(m => m.completed);
        return allComplete;
    } catch (error) {
        console.error('Error checking module completion:', error);
        return false;
    }
}

// Add Points
async function addPoints(points) {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        const userRef = db.collection('users').doc(user.uid);
        await userRef.update({
            totalPoints: firebase.firestore.FieldValue.increment(points)
        });
        
        // Update UI
        const pointsDisplay = document.querySelector('.points-value');
        if (pointsDisplay) {
            const currentPoints = parseInt(pointsDisplay.textContent) || 0;
            animateNumber(pointsDisplay, currentPoints, currentPoints + points, 500);
        }
    } catch (error) {
        console.error('Error adding points:', error);
    }
}

// Animate Number (for points)
function animateNumber(element, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const value = Math.floor(start + (range * progress));
        element.textContent = value;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Generate Certificate Data
async function generateCertificateData() {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const data = userDoc.data();
        
        if (!data) return null;
        
        return {
            email: user.email,
            completionDate: new Date().toLocaleDateString('de-CH'),
            modules: data.modules,
            totalPoints: data.totalPoints,
            overallProgress: data.overallProgress
        };
    } catch (error) {
        console.error('Error generating certificate data:', error);
        return null;
    }
}

// Show Success Toast
function showSuccessToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `
        <span class="toast-icon">✓</span>
        <span class="toast-message">${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #00994d;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 600;
        z-index: 1000;
        animation: slideInUp 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Keyboard Navigation Helper
function enableKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Allow Enter key to activate buttons and interactive elements
        if (e.key === 'Enter' && e.target.classList.contains('interactive-element')) {
            e.target.click();
        }
        
        // Arrow keys for navigation in quizzes
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            const focusableElements = Array.from(document.querySelectorAll(
                'button:not(:disabled), .choice-btn:not(:disabled), .quiz-btn:not(:disabled)'
            ));
            const currentIndex = focusableElements.indexOf(document.activeElement);
            
            if (currentIndex !== -1) {
                e.preventDefault();
                let nextIndex;
                
                if (e.key === 'ArrowDown') {
                    nextIndex = (currentIndex + 1) % focusableElements.length;
                } else {
                    nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
                }
                
                focusableElements[nextIndex].focus();
            }
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    enableKeyboardNavigation();
    
    // Add logout button listeners
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', logout);
    });
});

// Add CSS for toasts
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideOutDown {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }
`;
document.head.appendChild(toastStyles);
