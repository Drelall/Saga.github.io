import GoogleDriveStorage from './google-drive-storage.js';

// Instance du gestionnaire de stockage
const storage = new GoogleDriveStorage();

// Variables globales
let rpList = [];

console.log('📦 Renderer chargé');

// Sauvegarder les données
async function saveData() {
    try {
        console.log('💾 Tentative sauvegarde...', rpList.length, 'RPs');
        await storage.saveData(rpList);
        console.log('✅ Sauvegarde réussie');
    } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
        throw error;
    }
}

// Charger les données
async function loadData() {
    try {
        console.log('📥 Tentative chargement...');
        rpList = await storage.loadData();
        console.log('✅ Chargement réussi:', rpList.length, 'RPs');
    } catch (error) {
        console.error('❌ Erreur chargement:', error);
        rpList = [];
    }
}

// Afficher notification
function showNotification(message, type = 'success') {
    console.log(`🔔 Notification ${type}:`, message);
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        ${type === 'success' ? 'background-color: #4CAF50;' : 'background-color: #f44336;'}
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
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
    
    // Créer cartes
    activeRPs.forEach((item) => {
        const card = createCard(item);
        cardsView.appendChild(card);
    });
    
    console.log('✅ Cartes mises à jour:', activeRPs.length, 'affichées');
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initialisation renderer...');
    
    // TEST IMMÉDIAT - Vérifier si les éléments existent
    const rpForm = document.getElementById('rpForm');
    const rpName = document.getElementById('rpName');
    const partnerName = document.getElementById('partnerName');
    const turn = document.getElementById('turn');
    
    console.log('🔍 Vérification éléments DOM:');
    console.log('- rpForm:', !!rpForm);
    console.log('- rpName:', !!rpName);
    console.log('- partnerName:', !!partnerName);
    console.log('- turn:', !!turn);
    
    if (!rpForm) {
        console.error('❌ PROBLÈME: Formulaire rpForm non trouvé!');
        return;
    }
    
    // Gestionnaire formulaire avec DEBUG DÉTAILLÉ
    rpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 🚨 FORMULAIRE SOUMIS! 🚨');

        // Vérifier connexion
        console.log('🔐 Vérification connexion utilisateur...');
        console.log('- window.currentUser:', !!window.currentUser);
        console.log('- sessionStorage user_id:', !!sessionStorage.getItem('user_id'));
        
        if (!window.currentUser) {
            console.error('❌ Utilisateur non connecté');
            alert('Veuillez vous connecter pour ajouter un RP');
            return;
        }

        // Récupérer données formulaire
        const rpNameValue = document.getElementById('rpName').value.trim();
        const partnerNameValue = document.getElementById('partnerName').value.trim();
        const locationValue = document.getElementById('rpLocation').value.trim();
        const typeValue = document.getElementById('rpType').value.trim();
        const universeValue = document.getElementById('rpUniverse').value.trim();
        const urlValue = document.getElementById('rpUrl').value.trim();
        const turnValue = document.getElementById('turn').value;

        console.log('📋 Données récupérées:');
        console.log('- RP:', rpNameValue);
        console.log('- Partenaire:', partnerNameValue);
        console.log('- Tour:', turnValue);

        if (!rpNameValue || !partnerNameValue || !turnValue) {
            console.error('❌ Champs requis manquants');
            alert('Veuillez remplir tous les champs requis');
            return;
        }

        const newRP = {
            id: Date.now() + Math.random(),
            rp: rpNameValue,
            partner: partnerNameValue,
            location: locationValue || '',
            type: typeValue || '',
            universe: universeValue || '',
            url: urlValue || '',
            turn: turnValue,
            date: new Date()
        };

        console.log('➕ Nouveau RP créé:', newRP);
        
        // Ajouter à la liste
        rpList.push(newRP);
        console.log('📝 RP ajouté à la liste. Total:', rpList.length);
        
        try {
            console.log('💾 Tentative sauvegarde...');
            await saveData();
            console.log('✅ Sauvegarde OK');
            
            console.log('🔄 Mise à jour affichage...');
            updateActiveCards();
            
            console.log('🧹 Reset formulaire...');
            rpForm.reset();
            
            showNotification(`RP "${rpNameValue}" ajouté avec succès !`);
            console.log('🎉 SUCCÈS TOTAL!');
            
        } catch (error) {
            console.error('❌ ERREUR CRITIQUE:', error);
            rpList.pop(); // Retirer si échec
            showNotification('Erreur lors de l\'ajout', 'error');
        }
    });
    
    // Charger données existantes
    try {
        console.log('📥 Chargement initial...');
        await loadData();
        updateActiveCards();
        console.log('🎉 Initialisation terminée avec succès');
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        updateActiveCards();
    }
});