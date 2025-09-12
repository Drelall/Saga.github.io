import GoogleDriveStorage from './google-drive-storage.js';
import config from './config.js';

// Attendre que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', function() {
    console.log('Renderer chargé');
    
    // Gestionnaire du formulaire d'ajout de RP
    const rpForm = document.getElementById('rpForm');
    if (rpForm) {
        rpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Vérifier si l'utilisateur est connecté
            if (!currentUser || !sessionStorage.getItem('user_id')) {
                alert('Veuillez vous connecter pour ajouter un RP');
                return;
            }
            
            console.log('Ajout d\'un nouveau RP...');
            
            // Récupérer les données du formulaire
            const formData = {
                id: Date.now().toString(),
                title: document.getElementById('rpName').value,
                partner: document.getElementById('partnerName').value,
                location: document.getElementById('rpLocation').value || 'Non spécifié',
                type: document.getElementById('rpType').value || 'Non spécifié',
                universe: document.getElementById('rpUniverse').value || 'Non spécifié',
                url: document.getElementById('rpUrl').value,
                status: document.getElementById('turn').value,
                created_at: new Date().toISOString()
            };
            
            try {
                // Utiliser le localStorage avec l'ID utilisateur pour la sécurité
                const userId = sessionStorage.getItem('user_id');
                const storageKey = `rp_cards_${userId}`;
                
                // Charger les cartes existantes
                let cards = JSON.parse(localStorage.getItem(storageKey) || '[]');
                
                // Ajouter la nouvelle carte
                cards.push(formData);
                
                // Sauvegarder
                localStorage.setItem(storageKey, JSON.stringify(cards));
                
                console.log('RP ajouté avec succès:', formData.title);
                
                // Réinitialiser le formulaire
                rpForm.reset();
                
                // Rafraîchir l'affichage
                renderCards(cards);
                
                // Notification de succès
                showNotification('RP ajouté avec succès !', 'success');
                
            } catch (error) {
                console.error('Erreur lors de l\'ajout du RP:', error);
                showNotification('Erreur lors de l\'ajout du RP', 'error');
            }
        });
    }
    
    // Charger les RPs existants si l'utilisateur est connecté
    if (sessionStorage.getItem('user_id')) {
        loadExistingRPs();
    }
});

// Fonction pour charger les RPs existants
function loadExistingRPs() {
    const userId = sessionStorage.getItem('user_id');
    if (!userId) return;
    
    const storageKey = `rp_cards_${userId}`;
    const cards = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (cards.length > 0) {
        console.log(`${cards.length} RPs chargés`);
        renderCards(cards);
    }
}

// Fonction pour afficher les cartes
function renderCards(cards) {
    const activeCardsContainer = document.getElementById('cards-view');
    const archiveCardsContainer = document.getElementById('cards-view-archive');
    const emptyStateActive = document.getElementById('cards-empty-state');
    const emptyStateArchive = document.getElementById('cards-empty-state-archive');
    
    if (!activeCardsContainer) return;
    
    // Séparer les cartes actives et archivées
    const activeCards = cards.filter(card => !['RP terminé', 'RP abandonné'].includes(card.status));
    const archivedCards = cards.filter(card => ['RP terminé', 'RP abandonné'].includes(card.status));
    
    // Afficher les cartes actives
    activeCardsContainer.innerHTML = activeCards.map(card => createCardHTML(card)).join('');
    if (emptyStateActive) {
        emptyStateActive.style.display = activeCards.length === 0 ? 'block' : 'none';
    }
    
    // Afficher les cartes archivées
    if (archiveCardsContainer) {
        archiveCardsContainer.innerHTML = archivedCards.map(card => createCardHTML(card)).join('');
    }
    if (emptyStateArchive) {
        emptyStateArchive.style.display = archivedCards.length === 0 ? 'block' : 'none';
    }
    
    console.log(`Cartes affichées: ${activeCards.length} actives, ${archivedCards.length} archivées`);
}

// Fonction pour créer le HTML d'une carte
function createCardHTML(card) {
    return `
        <div class="card" data-id="${card.id}">
            <h3>${card.title}</h3>
            <div class="card-content">
                <p><strong>Partenaire:</strong> ${card.partner}</p>
                <p><strong>Lieu:</strong> ${card.location}</p>
                <p><strong>Type:</strong> ${card.type}</p>
                <p><strong>Univers:</strong> ${card.universe}</p>
                ${card.url ? `<p><strong>Lien:</strong> <a href="${card.url}" target="_blank">Ouvrir le RP</a></p>` : ''}
                <p><strong>Statut:</strong> ${card.status}</p>
            </div>
        </div>
    `;
}

// Fonction pour afficher les notifications
function showNotification(message, type = 'info') {
    console.log(`Notification ${type}: ${message}`);
    
    // Créer l'élément de notification
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
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}