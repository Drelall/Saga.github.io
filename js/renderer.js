import driveStorage from './google-drive-storage.js';

let rpList = [];

console.log('📦 Renderer SIMPLE chargé');

// Fonctions basiques
async function saveToDrive() {
    try {
        await driveStorage.saveData(rpList);
    } catch (e) {
        console.error('Erreur sauvegarde Drive:', e.message);
    }
}

async function loadFromDriveAndRender() {
    try {
        rpList = await driveStorage.loadData();
        console.log('📥 Chargé depuis Drive:', rpList.length);
        updateActiveCards?.(); // si fonctions déjà définies
        updateArchiveCards?.();
    } catch (e) {
        console.error('Erreur chargement Drive:', e.message);
    }
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
        await saveToDrive();
        updateCards();
        showNotification('RP supprimé');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Init renderer...');
    
    const form = document.getElementById('rpForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!window.currentUser) {
                alert('Connectez-vous');
                return;
            }
            const rpName = document.getElementById('rpName').value.trim();
            const partnerName = document.getElementById('partnerName').value.trim();
            const turn = document.getElementById('turn').value;
            if (!rpName || !partnerName || !turn) return;

            const newRP = {
                id: Date.now() + '_' + Math.random().toString(36).slice(2),
                rp: rpName,
                partner: partnerName,
                location: document.getElementById('rpLocation').value.trim(),
                type: document.getElementById('rpType').value.trim(),
                universe: document.getElementById('rpUniverse').value.trim(),
                url: document.getElementById('rpUrl').value.trim(),
                turn,
                date: new Date().toISOString()
            };
            rpList.push(newRP);
            await saveToDrive();
            updateActiveCards?.();
            form.reset();
        });
    }

    // Charger quand le jeton Drive est prêt
    document.addEventListener('drive-ready', () => {
        loadFromDriveAndRender();
    });
});