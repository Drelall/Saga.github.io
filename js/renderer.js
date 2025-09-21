import GoogleDriveStorage from './google-drive-storage.js';

const storage = new GoogleDriveStorage();
let rpList = [];

console.log('📦 Renderer SIMPLE chargé');

// Fonctions basiques
async function saveData() {
    await storage.saveData(rpList);
}

async function loadData() {
    rpList = await storage.loadData();
}

function showNotification(message, type = 'success') {
    const div = document.createElement('div');
    div.textContent = message;
    div.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: ${type === 'success' ? '#4CAF50' : '#ff9800'}; 
        color: white; padding: 15px; border-radius: 5px; z-index: 1000;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function getActiveRPs() {
    return rpList.filter(rp => rp.turn !== 'RP terminé' && rp.turn !== 'RP abandonné');
}

function createCard(item) {
    const card = document.createElement('div');
    card.className = 'rp-card';
    card.innerHTML = `
        <div class="card-header">
            <h3>${item.rp}</h3>
            <div class="card-status">${item.turn}</div>
        </div>
        <div class="card-body">
            <p><strong>Partenaire:</strong> ${item.partner}</p>
            <p><strong>Lieu:</strong> ${item.location || 'Non spécifié'}</p>
            <p><strong>Type:</strong> ${item.type || 'Non spécifié'}</p>
            <p><strong>Univers:</strong> ${item.universe || 'Non spécifié'}</p>
            <button onclick="deleteRP('${item.id}')">Supprimer</button>
        </div>
    `;
    return card;
}

function updateCards() {
    const container = document.getElementById('cards-view');
    const emptyState = document.getElementById('cards-empty-state');
    
    if (!container) return;
    
    container.innerHTML = '';
    const activeRPs = getActiveRPs();
    
    if (activeRPs.length === 0) {
        container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';
    
    activeRPs.forEach(item => {
        container.appendChild(createCard(item));
    });
}

// Fonction globale pour supprimer
window.deleteRP = async function(id) {
    if (confirm('Supprimer ce RP ?')) {
        rpList = rpList.filter(rp => rp.id != id);
        await saveData();
        updateCards();
        showNotification('RP supprimé');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Init renderer...');
    
    const rpForm = document.getElementById('rpForm');
    if (rpForm) {
        rpForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!window.currentUser) {
                alert('Connectez-vous d\'abord');
                return;
            }

            const newRP = {
                id: Date.now(),
                rp: document.getElementById('rpName').value,
                partner: document.getElementById('partnerName').value,
                location: document.getElementById('rpLocation').value,
                type: document.getElementById('rpType').value,
                universe: document.getElementById('rpUniverse').value,
                url: document.getElementById('rpUrl').value,
                turn: document.getElementById('turn').value,
                date: new Date()
            };

            rpList.push(newRP);
            
            // Sauvegarder avec indication
            showNotification('Sauvegarde en cours...', 'info');
            await saveData();
            updateCards();
            rpForm.reset();
            showNotification('RP ajouté et synchronisé !');
        });
    }
    
    // Charger données avec indication
    showNotification('Chargement des données...', 'info');
    await loadData();
    updateCards();
    
    if (rpList.length > 0) {
        showNotification(`${rpList.length} RPs chargés`);
    }
    
    console.log('✅ Ready');
});