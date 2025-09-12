import GoogleDriveStorage from './google-drive-storage.js';
import config from './config.js';

// Gestionnaire de soumission du formulaire
document.getElementById('rpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!auth.user) {
        showNotification('Veuillez vous connecter pour ajouter un RP', 'error');
        return;
    }

    const formData = {
        title: document.getElementById('rpName').value,
        partner: document.getElementById('partnerName').value,
        location: document.getElementById('rpLocation').value,
        type: document.getElementById('rpType').value,
        universe: document.getElementById('rpUniverse').value,
        url: document.getElementById('rpUrl').value,
        status: document.getElementById('turn').value,
        created_at: new Date().toISOString()
    };

    try {
        // Charger les cartes existantes
        let cards = await GoogleDriveStorage.loadCards();
        
        // Ajouter la nouvelle carte
        cards.push(formData);
        
        // Sauvegarder dans Google Drive
        await GoogleDriveStorage.saveCards(cards);
        
        // Réinitialiser le formulaire
        e.target.reset();
        
        // Rafraîchir l'affichage
        renderCards(cards);
        
        showNotification('RP ajouté avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        showNotification('Erreur lors de l\'ajout du RP', 'error');
    }
});

// Fonction pour afficher les cartes
async function renderCards(cards) {
    const activeCardsContainer = document.getElementById('cards-view');
    const archiveCardsContainer = document.getElementById('cards-view-archive');
    const emptyStateActive = document.getElementById('cards-empty-state');
    const emptyStateArchive = document.getElementById('cards-empty-state-archive');
    
    // Séparer les cartes actives et archivées
    const activeCards = cards.filter(card => !['RP terminé', 'RP abandonné'].includes(card.status));
    const archivedCards = cards.filter(card => ['RP terminé', 'RP abandonné'].includes(card.status));
    
    // Afficher les cartes actives
    activeCardsContainer.innerHTML = activeCards.map(card => createCardHTML(card)).join('');
    emptyStateActive.style.display = activeCards.length === 0 ? 'block' : 'none';
    
    // Afficher les cartes archivées
    archiveCardsContainer.innerHTML = archivedCards.map(card => createCardHTML(card)).join('');
    emptyStateArchive.style.display = archivedCards.length === 0 ? 'block' : 'none';
}

// Fonction pour créer le HTML d'une carte
function createCardHTML(card) {
    return `
        <div class="card" data-id="${card.id}">
            <h3>${card.title}</h3>
            <div class="card-content">
                <p><strong>Partenaire:</strong> ${card.partner}</p>
                <p><strong>Lieu:</strong> ${card.location || 'Non spécifié'}</p>
                <p><strong>Type:</strong> ${card.type || 'Non spécifié'}</p>
                <p><strong>Univers:</strong> ${card.universe || 'Non spécifié'}</p>
                ${card.url ? `<p><strong>Lien:</strong> <a href="${card.url}" target="_blank">Ouvrir le RP</a></p>` : ''}
                <p><strong>Statut:</strong> ${card.status}</p>
            </div>
        </div>
    `;
}

// Fonction pour afficher les notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const container = document.getElementById('notifications');
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Fonction pour gérer l'affichage de l'application
function toggleAppVisibility(isLoggedIn) {
    const appContent = document.querySelector('.container');
    const menubar = document.querySelector('.menubar');
    const welcomeScreen = document.getElementById('welcome-screen');
    
    if (isLoggedIn) {
        appContent.style.display = 'block';
        menubar.style.display = 'flex';
        welcomeScreen.style.display = 'none';
    } else {
        appContent.style.display = 'none';
        menubar.style.display = 'none';
        welcomeScreen.style.display = 'flex';
    }
}

// Initialisation de l'interface
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si l'utilisateur est connecté
    const isLoggedIn = !!sessionStorage.getItem('google_token');
    toggleAppVisibility(isLoggedIn);
});