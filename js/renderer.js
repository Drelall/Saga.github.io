import GoogleDriveStorage from './google-drive-storage.js';

// Instance du gestionnaire de stockage
const storage = new GoogleDriveStorage();

// Variables globales
let rpList = [];
let currentPage = 'active';
let currentFilter = 'all';
let currentSort = 'time-desc';

console.log('📦 Renderer chargé');

// Sauvegarder les données sur Google Drive uniquement
async function saveData() {
    console.log('💾 Sauvegarde des données...', rpList.length, 'RPs');
    await storage.saveData(rpList);
    console.log('✅ Sauvegarde réussie sur Google Drive');
}

// Charger les données depuis Google Drive uniquement
async function loadData() {
    console.log('📥 Chargement des données...');
    rpList = await storage.loadData();
    console.log('✅ Chargement réussi depuis Google Drive:', rpList.length, 'RPs');
}

// Afficher notification
function showNotification(message, type = 'success') {
    console.log(`🔔 Notification ${type}:`, message);
    
    const container = document.getElementById('notifications');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Obtenir RPs actifs
function getActiveRPs() {
    return rpList.filter(rp => rp.turn !== 'RP terminé' && rp.turn !== 'RP abandonné');
}

// Calculer temps écoulé
function getTimeDisplay(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return { timeStr: 'Date invalide', className: 'time-normal' };
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    let timeStr = '';
    let className = 'time-normal';
    
    if (diffDays > 0) {
        timeStr = `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        if (diffDays >= 7) className = 'time-urgent';
        else if (diffDays >= 3) className = 'time-warning';
    } else if (diffHours > 0) {
        timeStr = `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
        timeStr = `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
        timeStr = 'À l\'instant';
    }
    
    return { timeStr, className };
}

// Créer carte RP
function createCard(item) {
    const { timeStr, className } = getTimeDisplay(item.date);
    
    let statusClass = '';
    let statusText = '';
    
    switch(item.turn) {
        case "À ton partenaire de poster":
            statusClass = 'turn-partner';
            statusText = 'En attente de votre partenaire';
            break;
        case "À toi de poster":
            statusClass = 'turn-you';
            statusText = 'À vous de poster';
            break;
        case "RP terminé":
            statusClass = 'turn-completed';
            statusText = 'RP terminé';
            break;
        case "RP abandonné":
            statusClass = 'turn-abandoned';
            statusText = 'RP abandonné';
            break;
    }

    const card = document.createElement('div');
    card.className = 'rp-card';
    card.dataset.id = item.id;
    card.innerHTML = `
        <div class="card-header ${statusClass}">
            <div class="card-title-container">
                <h3 class="card-title">${item.rp}</h3>
            </div>
            <div class="card-status ${statusClass}">
                <span>${statusText}</span>
            </div>
        </div>
        
        <div class="card-body">
            <div class="card-info">
                <div class="info-item">
                    <span class="info-label">Partenaire</span>
                    <span class="info-value">${item.partner}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Lieu</span>
                    <span class="info-value">${item.location || 'Non spécifié'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Type</span>
                    <span class="info-value">${item.type || 'Non spécifié'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Univers</span>
                    <span class="info-value">${item.universe || 'Non spécifié'}</span>
                </div>
            </div>
            
            <div class="card-time">
                <span class="time-icon">🕘</span>
                <span class="time-text ${className}">${timeStr}</span>
            </div>
            
            <div class="card-actions">
                <button class="btn btn-secondary btn-sm edit-btn" data-id="${item.id}">
                    ✏️ Modifier
                </button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}">
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Mettre à jour affichage cartes
function updateActiveCards() {
    console.log('🔄 Mise à jour cartes actives...');
    
    const cardsView = document.getElementById('cards-view');
    const cardsEmptyState = document.getElementById('cards-empty-state');
    
    if (!cardsView) {
        console.error('❌ Élément cards-view non trouvé');
        return;
    }
    
    cardsView.innerHTML = '';
    const activeRPs = getActiveRPs();
    
    console.log('📊 RPs actifs:', activeRPs.length);
    
    if (activeRPs.length === 0) {
        cardsView.style.display = 'none';
        if (cardsEmptyState) {
            cardsEmptyState.style.display = 'block';
        }
        return;
    }
    
    cardsView.style.display = 'grid';
    if (cardsEmptyState) {
        cardsEmptyState.style.display = 'none';
    }
    
    // Appliquer filtres et tri
    let filteredList = activeRPs;
    
    if (currentFilter !== 'all') {
        filteredList = activeRPs.filter(item => item.turn === currentFilter);
    }
    
    // Trier
    if (currentSort === 'time-desc') {
        filteredList.sort((a, b) => b.date - a.date);
    } else if (currentSort === 'time-asc') {
        filteredList.sort((a, b) => a.date - b.date);
    }
    
    // Créer cartes
    filteredList.forEach((item) => {
        const card = createCard(item);
        cardsView.appendChild(card);
    });
    
    // Attacher événements
    attachCardEvents();
    
    console.log('✅ Cartes mises à jour:', filteredList.length, 'affichées');
}

// Attacher événements aux cartes
function attachCardEvents() {
    // Boutons supprimer
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            const item = rpList.find(rp => rp.id == id);
            
            if (item && confirm(`Supprimer le RP "${item.rp}" ?`)) {
                rpList = rpList.filter(rp => rp.id != id);
                await saveData();
                updateActiveCards();
                showNotification(`RP "${item.rp}" supprimé`);
            }
        });
    });
    
    // Boutons modifier
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            const item = rpList.find(rp => rp.id == id);
            
            if (item) {
                // Remplir formulaire
                document.getElementById('rpName').value = item.rp;
                document.getElementById('partnerName').value = item.partner;
                document.getElementById('rpLocation').value = item.location || '';
                document.getElementById('rpType').value = item.type || '';
                document.getElementById('rpUniverse').value = item.universe || '';
                document.getElementById('rpUrl').value = item.url || '';
                document.getElementById('turn').value = item.turn;
                
                // Supprimer de la liste
                rpList = rpList.filter(rp => rp.id != id);
                updateActiveCards();
                showNotification('RP prêt à être modifié');
            }
        });
    });
}

// Attendre connexion utilisateur ET API Google Drive
function waitForAuth() {
    return new Promise((resolve) => {
        const check = () => {
            if (window.currentUser && sessionStorage.getItem('user_id') && window.gapi && window.gapi.client) {
                console.log('✅ Utilisateur connecté et API prête');
                resolve();
            } else {
                console.log('⏳ Attente connexion et API...');
                setTimeout(check, 1000);
            }
        };
        check();
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initialisation renderer...');
    
    // Gestionnaire formulaire
    const rpForm = document.getElementById('rpForm');
    if (rpForm) {
        rpForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 Soumission formulaire...');

            // Vérifier connexion
            if (!window.currentUser) {
                alert('Veuillez vous connecter pour ajouter un RP');
                return;
            }

            // Récupérer données formulaire
            const rpName = document.getElementById('rpName').value.trim();
            const partnerName = document.getElementById('partnerName').value.trim();
            const location = document.getElementById('rpLocation').value.trim();
            const type = document.getElementById('rpType').value.trim();
            const universe = document.getElementById('rpUniverse').value.trim();
            const url = document.getElementById('rpUrl').value.trim();
            const turn = document.getElementById('turn').value;

            console.log('📋 Données formulaire:', { rpName, partnerName, turn });

            if (rpName && partnerName && turn) {
                const newRP = {
                    id: Date.now() + Math.random(),
                    rp: rpName,
                    partner: partnerName,
                    location: location || '',
                    type: type || '',
                    universe: universe || '',
                    url: url || '',
                    turn: turn,
                    date: new Date()
                };

                console.log('➕ Ajout nouveau RP:', newRP);
                rpList.push(newRP);
                
                try {
                    await saveData();
                    updateActiveCards();
                    rpForm.reset();
                    showNotification(`RP "${rpName}" ajouté avec succès !`);
                    console.log('✅ RP ajouté avec succès');
                } catch (error) {
                    console.error('❌ Erreur ajout RP:', error);
                    rpList.pop(); // Retirer si échec
                    showNotification('Erreur lors de l\'ajout', 'error');
                }
            } else {
                console.warn('⚠️ Champs requis manquants');
                showNotification('Veuillez remplir tous les champs requis', 'error');
            }
        });
    } else {
        console.error('❌ Formulaire rpForm non trouvé');
    }

    // Navigation
    const navActive = document.getElementById('nav-active');
    if (navActive) {
        navActive.addEventListener('click', () => {
            currentPage = 'active';
            updateActiveCards();
        });
    }

    // Attendre connexion ET API Google Drive
    try {
        await waitForAuth();
        await loadData();
        updateActiveCards();
        console.log('🎉 RP Tracker initialisé avec succès');
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        updateActiveCards(); // Afficher quand même
    }
});