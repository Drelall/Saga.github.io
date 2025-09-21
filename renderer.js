import GoogleDriveStorage from './js/google-drive-storage.js';

// Instance du gestionnaire Google Drive
const driveStorage = new GoogleDriveStorage();

// Variables globales
let rpList = [];
let currentPage = 'active';
let currentFilter = 'all';
let currentSort = 'time-desc';
let currentFilterArchive = 'all';
let currentSortArchive = 'time-desc';
let searchQuery = '';
let timeUpdateInterval = null;

// Sauvegarder les données sur Google Drive uniquement
async function saveData() {
    try {
        if (!window.currentUser || !sessionStorage.getItem('user_id')) {
            throw new Error('Utilisateur non connecté');
        }
        
        await driveStorage.saveData(rpList);
        console.log('Données sauvegardées sur Google Drive');
    } catch (error) {
        console.error('Erreur sauvegarde:', error);
        throw error;
    }
}

// Charger les données depuis Google Drive uniquement
async function loadData() {
    try {
        if (!window.currentUser || !sessionStorage.getItem('user_id')) {
            rpList = [];
            return;
        }
        
        const data = await driveStorage.loadData();
        rpList = data.map(item => ({
            id: item.id || Date.now() + Math.random(),
            rp: item.title || item.rp,
            partner: item.partner,
            location: item.location || '',
            type: item.type || '',
            universe: item.universe || '',
            url: item.url || '',
            turn: item.status || item.turn,
            date: new Date(item.created_at || item.date || Date.now())
        }));
        
        console.log(`${rpList.length} RPs chargés depuis Google Drive`);
    } catch (error) {
        console.error('Erreur chargement:', error);
        rpList = [];
    }
}

// Afficher les notifications
function showNotification(message, type = 'success') {
    const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationsContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Fonctions utilitaires pour séparer les RPs
function getActiveRPs() {
    return rpList.filter(rp => rp.turn !== 'RP terminé' && rp.turn !== 'RP abandonné');
}

function getArchivedRPs() {
    return rpList.filter(rp => rp.turn === 'RP terminé' || rp.turn === 'RP abandonné');
}

// Calculer le temps écoulé
function getTimeDisplay(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return { timeStr: 'Date invalide', className: 'time-normal' };
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
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

// Créer une carte pour un RP
function createCard(item) {
    const { timeStr, className } = getTimeDisplay(item.date);
    
    let statusClass = '';
    let statusText = '';
    
    if (item.turn === "À ton partenaire de poster") {
        statusClass = 'turn-partner';
        statusText = 'En attente de votre partenaire';
    } else if (item.turn === "À toi de poster") {
        statusClass = 'turn-you';
        statusText = 'À vous de poster';
    } else if (item.turn === "RP terminé") {
        statusClass = 'turn-completed';
        statusText = 'RP terminé';
    } else if (item.turn === "RP abandonné") {
        statusClass = 'turn-abandoned';
        statusText = 'RP abandonné';
    }

    const card = document.createElement('div');
    card.className = 'rp-card';
    card.dataset.id = item.id;
    card.innerHTML = `
        <div class="card-header ${statusClass}">
            <div class="card-title-container">
                <h3 class="card-title">${item.rp}</h3>
                <span class="link-icon ${item.url ? 'has-url' : 'no-url'}" data-id="${item.id}">🔗</span>
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
                    <span class="info-value ${!item.location ? 'empty' : ''}">${item.location || 'Non spécifié'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Type</span>
                    <span class="info-value ${!item.type ? 'empty' : ''}">${item.type || 'Non spécifié'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Univers</span>
                    <span class="info-value ${!item.universe ? 'empty' : ''}">${item.universe || 'Non spécifié'}</span>
                </div>
            </div>
            
            <div class="card-time">
                <span class="time-icon">🕘</span>
                <span class="time-text ${className}">${timeStr}</span>
            </div>
            
            <div class="card-actions">
                <button class="btn btn-secondary btn-sm edit-btn" data-id="${item.id}" title="Modifier">
                    <img src="icone/stylo-a-plume.png" alt="Modifier" class="btn-icon"> Modifier
                </button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}" title="Supprimer">
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Mettre à jour l'affichage des cartes actives
function updateActiveCards() {
    const cardsView = document.getElementById('cards-view');
    const cardsEmptyState = document.getElementById('cards-empty-state');
    
    if (!cardsView) return;
    
    cardsView.innerHTML = '';
    const activeRPs = getActiveRPs();
    
    if (activeRPs.length === 0) {
        cardsView.style.display = 'none';
        if (cardsEmptyState) {
            cardsEmptyState.style.display = 'block';
            cardsEmptyState.innerHTML = `
                <h3>Aucun RP actif</h3>
                <p>Ajoutez votre premier RP pour commencer le suivi !</p>
            `;
        }
        return;
    }
    
    cardsView.style.display = 'grid';
    if (cardsEmptyState) cardsEmptyState.style.display = 'none';
    
    let filteredList = activeRPs;
    
    // Appliquer les filtres
    if (searchQuery.trim() !== '') {
        filteredList = filteredList.filter(item => 
            item.rp.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.universe && item.universe.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }
    
    if (currentFilter !== 'all') {
        filteredList = filteredList.filter(item => item.turn === currentFilter);
    }
    
    // Trier
    if (currentSort === 'partner-asc') {
        filteredList.sort((a, b) => a.partner.localeCompare(b.partner));
    } else if (currentSort === 'partner-desc') {
        filteredList.sort((a, b) => b.partner.localeCompare(a.partner));
    } else if (currentSort === 'time-asc') {
        filteredList.sort((a, b) => a.date - b.date);
    } else if (currentSort === 'time-desc') {
        filteredList.sort((a, b) => b.date - a.date);
    }
    
    filteredList.forEach((item) => {
        const card = createCard(item);
        cardsView.appendChild(card);
    });
    
    attachCardEvents();
}

// Mettre à jour l'affichage des cartes archivées
function updateArchiveCards() {
    const cardsViewArchive = document.getElementById('cards-view-archive');
    const cardsEmptyStateArchive = document.getElementById('cards-empty-state-archive');
    
    if (!cardsViewArchive) return;
    
    cardsViewArchive.innerHTML = '';
    const archivedRPs = getArchivedRPs();
    
    if (archivedRPs.length === 0) {
        cardsViewArchive.style.display = 'none';
        if (cardsEmptyStateArchive) {
            cardsEmptyStateArchive.style.display = 'block';
            cardsEmptyStateArchive.innerHTML = `
                <h3>Aucun RP archivé</h3>
                <p>Les RPs terminés ou abandonnés apparaîtront ici.</p>
            `;
        }
        return;
    }
    
    cardsViewArchive.style.display = 'grid';
    if (cardsEmptyStateArchive) cardsEmptyStateArchive.style.display = 'none';
    
    let filteredList = archivedRPs;
    
    // Appliquer les filtres
    if (searchQuery.trim() !== '') {
        filteredList = filteredList.filter(item => 
            item.rp.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.universe && item.universe.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }
    
    if (currentFilterArchive !== 'all') {
        filteredList = filteredList.filter(item => item.turn === currentFilterArchive);
    }
    
    // Trier
    if (currentSortArchive === 'partner-asc') {
        filteredList.sort((a, b) => a.partner.localeCompare(b.partner));
    } else if (currentSortArchive === 'partner-desc') {
        filteredList.sort((a, b) => b.partner.localeCompare(a.partner));
    } else if (currentSortArchive === 'time-asc') {
        filteredList.sort((a, b) => a.date - b.date);
    } else if (currentSortArchive === 'time-desc') {
        filteredList.sort((a, b) => b.date - a.date);
    }
    
    filteredList.forEach((item) => {
        const card = createCard(item);
        cardsViewArchive.appendChild(card);
    });
    
    attachCardEventsArchive();
}

// Attacher les événements aux cartes
function attachCardEvents() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('Êtes-vous sûr de vouloir supprimer ce RP ?')) {
                const id = e.target.closest('button').getAttribute('data-id');
                const idx = rpList.findIndex(item => item.id == id);
                if (idx !== -1) {
                    const rpName = rpList[idx].rp;
                    rpList.splice(idx, 1);
                    try {
                        await saveData();
                        updateCurrentView();
                        showNotification(`RP "${rpName}" supprimé avec succès !`);
                    } catch (error) {
                        showNotification('Erreur lors de la suppression', 'error');
                    }
                }
            }
        });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            const item = rpList.find(item => item.id == id);
            if (item) {
                document.getElementById('rpName').value = item.rp;
                document.getElementById('partnerName').value = item.partner;
                document.getElementById('rpLocation').value = item.location || '';
                document.getElementById('rpType').value = item.type || '';
                document.getElementById('rpUniverse').value = item.universe || '';
                document.getElementById('rpUrl').value = item.url || '';
                document.getElementById('turn').value = item.turn;
                
                rpList.splice(rpList.findIndex(r => r.id == id), 1);
                updateCurrentView();
                showNotification('RP prêt à être modifié !');
            }
        });
    });
}

// Attacher les événements aux cartes archivées
function attachCardEventsArchive() {
    const cardsViewArchive = document.getElementById('cards-view-archive');
    if (!cardsViewArchive) return;

    cardsViewArchive.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            const item = rpList.find(item => item.id == id);
            if (item) {
                document.getElementById('rpName').value = item.rp;
                document.getElementById('partnerName').value = item.partner;
                document.getElementById('rpLocation').value = item.location || '';
                document.getElementById('rpType').value = item.type || '';
                document.getElementById('rpUniverse').value = item.universe || '';
                document.getElementById('rpUrl').value = item.url || '';
                document.getElementById('turn').value = item.turn;
                
                rpList.splice(rpList.findIndex(r => r.id == id), 1);
                updateCurrentView();
                showNotification('RP prêt à être modifié !');
            }
        });
    });

    cardsViewArchive.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('Êtes-vous sûr de vouloir supprimer ce RP ?')) {
                const id = e.target.closest('button').getAttribute('data-id');
                const idx = rpList.findIndex(item => item.id == id);
                if (idx !== -1) {
                    const rpName = rpList[idx].rp;
                    rpList.splice(idx, 1);
                    try {
                        await saveData();
                        updateCurrentView();
                        showNotification(`RP "${rpName}" supprimé avec succès !`);
                    } catch (error) {
                        showNotification('Erreur lors de la suppression', 'error');
                    }
                }
            }
        });
    });
}

// Navigation entre les pages
function switchPage(page) {
    currentPage = page;
    
    const pageActive = document.getElementById('page-active');
    const pageArchive = document.getElementById('page-archive');
    const controlsActive = document.getElementById('controls-active');
    const controlsArchive = document.getElementById('controls-archive');
    const navActive = document.getElementById('nav-active');
    const navArchive = document.getElementById('nav-archive');
    
    if (page === 'active') {
        if (pageActive) pageActive.style.display = 'block';
        if (pageArchive) pageArchive.style.display = 'none';
        if (controlsActive) controlsActive.style.display = 'flex';
        if (controlsArchive) controlsArchive.style.display = 'none';
        if (navActive) navActive.classList.add('active');
        if (navArchive) navArchive.classList.remove('active');
        updateActiveCards();
    } else {
        if (pageActive) pageActive.style.display = 'none';
        if (pageArchive) pageArchive.style.display = 'block';
        if (controlsActive) controlsActive.style.display = 'none';
        if (controlsArchive) controlsArchive.style.display = 'flex';
        if (navActive) navActive.classList.remove('active');
        if (navArchive) navArchive.classList.add('active');
        updateArchiveCards();
    }
}

// Fonction utilitaire pour mettre à jour l'affichage selon la page courante
function updateCurrentView() {
    if (currentPage === 'active') {
        updateActiveCards();
    } else {
        updateArchiveCards();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Renderer chargé');
    
    // Attendre que l'utilisateur soit connecté ET que Drive soit initialisé
    const waitForAuth = () => {
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (window.currentUser && sessionStorage.getItem('user_id') && window.gapi && window.gapi.client) {
                    console.log('✅ Utilisateur connecté et APIs initialisées');
                    resolve();
                } else {
                    console.log('⏳ Attente de la connexion et des APIs...');
                    setTimeout(checkAuth, 1000);
                }
            };
            checkAuth();
        });
    };
    
    // Gestionnaire de soumission du formulaire
    const rpForm = document.getElementById('rpForm');
    if (rpForm) {
        rpForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Vérifier si l'utilisateur est connecté
            if (!window.currentUser || !sessionStorage.getItem('user_id')) {
                alert('Veuillez vous connecter pour ajouter un RP');
                return;
            }

            const rpName = document.getElementById('rpName').value.trim();
            const partnerName = document.getElementById('partnerName').value.trim();
            const location = document.getElementById('rpLocation').value.trim();
            const type = document.getElementById('rpType').value.trim();
            const universe = document.getElementById('rpUniverse').value.trim();
            const url = document.getElementById('rpUrl').value.trim();
            const turn = document.getElementById('turn').value;

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

                console.log('🔄 Ajout du RP:', newRP.rp);
                rpList.push(newRP);
                
                try {
                    await saveData();
                    updateCurrentView();
                    rpForm.reset();
                    showNotification(`RP "${rpName}" ajouté avec succès !`);
                    console.log('✅ RP ajouté avec succès');
                } catch (error) {
                    console.error('❌ Erreur lors de la sauvegarde:', error);
                    showNotification('Erreur lors de la sauvegarde du RP', 'error');
                    // Retirer le RP de la liste si la sauvegarde a échoué
                    rpList.pop();
                }
            }
        });
    }

    // Gestion des filtres et tri pour les cartes actives
    const viewFilter = document.getElementById('view-filter');
    if (viewFilter) {
        viewFilter.addEventListener('change', () => {
            currentFilter = viewFilter.value;
            updateCurrentView();
        });
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            updateCurrentView();
        });
    }

    // Gestion des filtres et tri pour les cartes archivées
    const viewFilterArchive = document.getElementById('view-filter-archive');
    if (viewFilterArchive) {
        viewFilterArchive.addEventListener('change', () => {
            currentFilterArchive = viewFilterArchive.value;
            updateCurrentView();
        });
    }

    const sortSelectArchive = document.getElementById('sort-select-archive');
    if (sortSelectArchive) {
        sortSelectArchive.addEventListener('change', () => {
            currentSortArchive = sortSelectArchive.value;
            updateCurrentView();
        });
    }

    // Gestion de la recherche
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            
            if (clearSearchBtn) {
                if (searchQuery.trim() !== '') {
                    clearSearchBtn.style.display = 'block';
                } else {
                    clearSearchBtn.style.display = 'none';
                }
            }
            
            updateCurrentView();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            updateCurrentView();
            if (searchInput) searchInput.focus();
        });
    }

    // Navigation
    const navActive = document.getElementById('nav-active');
    const navArchive = document.getElementById('nav-archive');
    
    if (navActive) navActive.addEventListener('click', () => switchPage('active'));
    if (navArchive) navArchive.addEventListener('click', () => switchPage('archive'));

    // Attendre la connexion et charger les données
    try {
        console.log('⏳ Attente de l\'authentification...');
        await waitForAuth();
        console.log('🔄 Chargement des données...');
        await loadData();
        switchPage('active');
        console.log('🚀 RP Tracker initialisé avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        switchPage('active');
    }
});
function applyCustomOrder(items, type) {
  if (!customOrder || !customOrder[type] || customOrder[type].length === 0) {
    return items; // Retourner l'ordre original si pas d'ordre personnalisé
  }
  
  const ordered = [];
  const unordered = [...items];
  
  // Ajouter les éléments dans l'ordre personnalisé
  customOrder[type].forEach(id => {
    const index = unordered.findIndex(item => item.id === id);
    if (index !== -1) {
      ordered.push(unordered[index]);
      unordered.splice(index, 1);
    }
  });
  
  // Ajouter les nouveaux éléments qui ne sont pas encore dans l'ordre personnalisé
  ordered.push(...unordered);
  
  return ordered;
}

// Créer une carte pour un RP
function createCard(item) {
  const { timeStr, className } = getTimeDisplay(item.date);
  
  // Choix de la couleur selon la valeur
  let statusClass = '';
  let statusIcon = '';
  let statusText = '';
  
  if (item.turn === "À ton partenaire de poster") {
    statusClass = 'turn-partner';
    statusIcon = '';
    statusText = 'En attente de votre partenaire';
  } else if (item.turn === "À toi de poster") {
    statusClass = 'turn-you';
    statusIcon = '';
    statusText = 'À vous de poster';
  } else if (item.turn === "RP terminé") {
    statusClass = 'turn-completed';
    statusIcon = '';
    statusText = 'RP terminé';
  } else if (item.turn === "RP abandonné") {
    statusClass = 'turn-abandoned';
    statusIcon = '';
    statusText = 'RP abandonné';
  }

  const card = document.createElement('div');
  card.className = 'rp-card';
  card.draggable = true;
  card.dataset.id = item.id;
  card.innerHTML = `
    <div class="card-header ${statusClass}">
      <div class="card-title-container">
        <h3 class="card-title">${item.rp}</h3>
        <span class="link-icon ${item.url ? 'has-url' : 'no-url'}" data-id="${item.id}">🔗</span>
      </div>
      <div class="card-status ${statusClass}">
        <span>${statusIcon}</span>
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
          <span class="info-value ${!item.location ? 'empty' : ''}">${item.location || 'Non spécifié'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Type</span>
          <span class="info-value ${!item.type ? 'empty' : ''}">${item.type || 'Non spécifié'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Univers</span>
          <span class="info-value ${!item.universe ? 'empty' : ''}">${item.universe || 'Non spécifié'}</span>
        </div>
      </div>
      
      <div class="card-time">
        <span class="time-icon">🕘</span>
        <span class="time-text ${className}">${timeStr}</span>
      </div>
      
      <div class="card-actions">
        <button class="btn btn-secondary btn-sm edit-btn" data-id="${item.id}" title="Modifier">
          <img src="icone/stylo-a-plume.png" alt="Modifier" class="btn-icon"> Modifier
        </button>
        <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}" title="Supprimer">
          🗑️ Supprimer
        </button>
      </div>
    </div>
  `;
  
  // Ajouter l'événement de clic sur l'icône d'horloge pour remettre le temps à zéro
  const timeIcon = card.querySelector('.time-icon');
  timeIcon.style.cursor = 'pointer';
  timeIcon.title = 'Cliquer pour remettre le temps à zéro';
  timeIcon.addEventListener('click', () => {
    resetTimeCounter(item.id);
  });
  
  // Ajouter les événements pour l'icône de lien
  const linkIcon = card.querySelector('.link-icon');
  linkIcon.style.cursor = 'pointer';
  
  // Définir le titre selon l'état
  if (item.url) {
    linkIcon.title = `Ouvrir le lien du RP\nClic droit pour éditer\nURL: ${item.url}`;
  } else {
    linkIcon.title = 'Ajouter un lien vers le RP';
  }
  
  // Événement de clic gauche
  linkIcon.addEventListener('click', (e) => {
    e.preventDefault();
    handleLinkClick(item.id, item.url);
  });
  
  // Événement de clic droit
  linkIcon.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showLinkContextMenu(item.id, item.url, e.clientX, e.clientY);
  });
  
  // Ajouter les événements de drag & drop
  card.addEventListener('dragstart', handleDragStart);
  card.addEventListener('dragenter', handleDragEnter);
  card.addEventListener('dragover', handleDragOver);
  card.addEventListener('dragleave', handleDragLeave);
  card.addEventListener('drop', handleDrop);
  card.addEventListener('dragend', handleDragEnd);
  
  return card;
}

// Mettre à jour l'affichage des cartes actives
function updateActiveCards() {
  cardsView.innerHTML = '';
  
  const activeRPs = getActiveRPs();
  
  if (activeRPs.length === 0) {
    cardsView.style.display = 'none';
    cardsEmptyState.style.display = 'block';
    cardsEmptyState.innerHTML = `
      <h3>Aucun RP actif</h3>
      <p>Ajoutez votre premier RP pour commencer le suivi !</p>
    `;
    return;
  } else {
    cardsView.style.display = 'grid';
    cardsEmptyState.style.display = 'none';
  }
  
  let filteredList = activeRPs;
  
  // Appliquer le filtre de recherche
  if (searchQuery.trim() !== '') {
    filteredList = filteredList.filter(item => 
      item.rp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.universe && item.universe.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  
  // Appliquer le filtre de statut
  if (currentFilter !== 'all') {
    filteredList = filteredList.filter(item => item.turn === currentFilter);
  }
  
  if (filteredList.length === 0) {
    cardsView.style.display = 'none';
    cardsEmptyState.style.display = 'block';
    
    if (searchQuery.trim() !== '') {
      cardsEmptyState.innerHTML = `
        <h3>Aucun RP trouvé</h3>
        <p>Aucun RP actif ne correspond à votre recherche "${searchQuery}".</p>
      `;
    } else {
      cardsEmptyState.innerHTML = `
        <h3>Aucun RP trouvé</h3>
        <p>Aucun RP actif ne correspond au filtre sélectionné.</p>
      `;
    }
    return;
  }

  // Tri selon la sélection ou ordre personnalisé
  if (searchQuery.trim() === '' && currentFilter === 'all') {
    // Si pas de recherche ni filtre, utiliser l'ordre personnalisé
    filteredList = applyCustomOrder(filteredList, 'active');
  } else {
    // Sinon, utiliser le tri normal
    filteredList = sortRPs(filteredList, currentSort);
  }

  filteredList.forEach((item) => {
    const card = createCard(item);
    cardsView.appendChild(card);
  });

  attachCardEvents();
  
  // Démarrer le timer de mise à jour du temps
  startTimeUpdateTimer();
}

// Mettre à jour l'affichage des cartes archivées
function updateArchiveCards() {
  cardsViewArchive.innerHTML = '';
  
  const archivedRPs = getArchivedRPs();
  
  if (archivedRPs.length === 0) {
    cardsViewArchive.style.display = 'none';
    cardsEmptyStateArchive.style.display = 'block';
    cardsEmptyStateArchive.innerHTML = `
      <h3>Aucun RP archivé</h3>
      <p>Les RPs terminés ou abandonnés apparaîtront ici.</p>
    `;
    return;
  } else {
    cardsViewArchive.style.display = 'grid';
    cardsEmptyStateArchive.style.display = 'none';
  }
  
  let filteredList = archivedRPs;
  
  // Appliquer le filtre de recherche
  if (searchQuery.trim() !== '') {
    filteredList = filteredList.filter(item => 
      item.rp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.universe && item.universe.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  
  // Appliquer le filtre de statut
  if (currentFilterArchive !== 'all') {
    filteredList = filteredList.filter(item => item.turn === currentFilterArchive);
  }
  
  if (filteredList.length === 0) {
    cardsViewArchive.style.display = 'none';
    cardsEmptyStateArchive.style.display = 'block';
    
    if (searchQuery.trim() !== '') {
      cardsEmptyStateArchive.innerHTML = `
        <h3>Aucun RP trouvé</h3>
        <p>Aucun RP archivé ne correspond à votre recherche "${searchQuery}".</p>
      `;
    } else {
      cardsEmptyStateArchive.innerHTML = `
        <h3>Aucun RP trouvé</h3>
        <p>Aucun RP archivé ne correspond au filtre sélectionné.</p>
      `;
    }
    return;
  }

  // Tri selon la sélection ou ordre personnalisé
  if (searchQuery.trim() === '' && currentFilterArchive === 'all') {
    // Si pas de recherche ni filtre, utiliser l'ordre personnalisé
    filteredList = applyCustomOrder(filteredList, 'archive');
  } else {
    // Sinon, utiliser le tri normal
    filteredList = sortRPs(filteredList, currentSortArchive);
  }

  filteredList.forEach((item) => {
    const card = createCard(item);
    cardsViewArchive.appendChild(card);
  });

  attachCardEventsArchive();
  
  // Démarrer le timer de mise à jour du temps
  startTimeUpdateTimer();
}

// Fonction de tri réutilisable
function sortRPs(list, sortType) {
  if (sortType === 'partner-asc') {
    return list.slice().sort((a, b) => a.partner.localeCompare(b.partner));
  } else if (sortType === 'partner-desc') {
    return list.slice().sort((a, b) => b.partner.localeCompare(a.partner));
  } else if (sortType === 'time-asc') {
    return list.slice().sort((a, b) => a.date - b.date);
  } else if (sortType === 'time-desc') {
    return list.slice().sort((a, b) => b.date - a.date);
  }
  return list;
}

// Fonction pour attacher les événements aux cartes
function attachCardEvents() {
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce RP ?')) {
        const id = Number(e.target.closest('button').getAttribute('data-id'));
        const idx = rpList.findIndex(item => item.id === id);
        if (idx !== -1) {
          const rpName = rpList[idx].rp;
          rpList.splice(idx, 1);
          saveList();
          updateCurrentView();
          showNotification(`RP "${rpName}" supprimé avec succès !`);
        }
      }
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.target.closest('button').getAttribute('data-id'));
      const item = rpList.find(item => item.id === id);
      if (item) {
        // Remplir le formulaire avec les données existantes
        document.getElementById('rpName').value = item.rp;
        document.getElementById('partnerName').value = item.partner;
        document.getElementById('rpLocation').value = item.location || '';
        document.getElementById('rpType').value = item.type || '';
        document.getElementById('rpUniverse').value = item.universe || '';
        document.getElementById('rpUrl').value = item.url || '';
        document.getElementById('turn').value = item.turn;
        
        // Supprimer l'ancien élément
        rpList.splice(rpList.findIndex(r => r.id === id), 1);
        saveList();
        updateCurrentView();
        
        // Faire défiler vers le formulaire
        document.querySelector('.formulaire').scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        showNotification('RP prêt à être modifié !');
      }
    });
  });
}

// Fonctions utilitaires pour séparer les RPs
function getActiveRPs() {
  return rpList.filter(rp => rp.turn !== 'RP terminé' && rp.turn !== 'RP abandonné');
}

function getArchivedRPs() {
  return rpList.filter(rp => rp.turn === 'RP terminé' || rp.turn === 'RP abandonné');
}

// Événements pour les cartes archivées
function attachCardEventsArchive() {
  const editButtons = cardsViewArchive.querySelectorAll('.edit-btn');
  const deleteButtons = cardsViewArchive.querySelectorAll('.delete-btn');

  editButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(e.target.closest('button').getAttribute('data-id'));
      const item = rpList.find(item => item.id === id);
      if (item) {
        // Remplir le formulaire avec les données existantes
        document.getElementById('rpName').value = item.rp;
        document.getElementById('partnerName').value = item.partner;
        document.getElementById('rpLocation').value = item.location || '';
        document.getElementById('rpType').value = item.type || '';
        document.getElementById('rpUniverse').value = item.universe || '';
        document.getElementById('rpUrl').value = item.url || '';
        document.getElementById('turn').value = item.turn;
        
        // Supprimer l'ancien élément
        const idx = rpList.findIndex(rpItem => rpItem.id === id);
        if (idx !== -1) {
          rpList.splice(idx, 1);
          saveList();
          updateCurrentView();
        }
      }
    });
  });

  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Êtes-vous sûr de vouloir supprimer ce RP ?')) {
        const id = Number(e.target.closest('button').getAttribute('data-id'));
        const idx = rpList.findIndex(item => item.id === id);
        if (idx !== -1) {
          const rpName = rpList[idx].rp;
          rpList.splice(idx, 1);
          saveList();
          updateCurrentView();
          showNotification(`RP "${rpName}" supprimé avec succès !`);
        }
      }
    });
  });
}

// Afficher les notifications
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  notificationsContainer.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Configuration des champs d'auto-complétion (version unifiée)
document.addEventListener('DOMContentLoaded', function() {
  setupAutocomplete('partnerName', 'partnerSuggestions', 'partners');
  setupAutocomplete('rpLocation', 'locationSuggestions', 'locations');
  setupAutocomplete('rpType', 'typeSuggestions', 'types');
  setupAutocomplete('rpUniverse', 'universeSuggestions', 'universes');
  
  // Gestionnaire de soumission du formulaire unifié
  const rpForm = document.getElementById('rpForm');
  if (rpForm) {
    rpForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const rpName = document.getElementById('rpName').value.trim();
      const partnerName = document.getElementById('partnerName').value.trim();
      const location = document.getElementById('rpLocation').value.trim();
      const type = document.getElementById('rpType').value.trim();
      const universe = document.getElementById('rpUniverse').value.trim();
      const url = document.getElementById('rpUrl').value.trim();
      const turn = document.getElementById('turn').value;

      if (rpName && partnerName && turn) {
        // Vérifier si l'utilisateur est connecté pour Google Drive
        if (!window.currentUser || !sessionStorage.getItem('user_id')) {
          // Si pas connecté, utiliser le système local
          console.log('Utilisateur non connecté, utilisation du système local');
        }

        // Ajouter aux suggestions
        addSuggestion('partners', partnerName);
        if (location) addSuggestion('locations', location);
        if (type) addSuggestion('types', type);
        if (universe) addSuggestion('universes', universe);

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

        rpList.push(newRP);
        
        try {
          await saveList();
          updateCurrentView();
          rpForm.reset();
          showNotification(`RP "${rpName}" ajouté avec succès !`);
        } catch (error) {
          console.error('Erreur lors de la sauvegarde:', error);
          showNotification('Erreur lors de la sauvegarde du RP', 'error');
        }
      }
    });
  }

  // Gestion du filtre
  viewFilter.addEventListener('change', () => {
    currentFilter = viewFilter.value;
    updateCurrentView();
    showNotification(`Filtre appliqué: ${currentFilter === 'all' ? 'Tous' : currentFilter}`);
  });

  // Gestion du tri
  sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    updateCurrentView();
    const sortMessages = {
      'time-desc': 'Tri: Plus récent d\'abord',
      'time-asc': 'Tri: Plus ancien d\'abord',
      'partner-asc': 'Tri: Partenaire A-Z',
      'partner-desc': 'Tri: Partenaire Z-A'
    };
    showNotification(sortMessages[currentSort]);
  });

  // Navigation entre les pages
  function switchPage(page) {
    currentPage = page;
    
    if (page === 'active') {
      // Afficher la page des RPs actifs
      pageActive.style.display = 'block';
      pageArchive.style.display = 'none';
      controlsActive.style.display = 'flex';
      controlsArchive.style.display = 'none';
      
      // Boutons navigation
      navActive.classList.add('active');
      navArchive.classList.remove('active');
      
      updateActiveCards();
    } else {
      // Afficher la page des RPs archivés
      pageActive.style.display = 'none';
      pageArchive.style.display = 'block';
      controlsActive.style.display = 'none';
      controlsArchive.style.display = 'flex';
      
      // Boutons navigation
      navActive.classList.remove('active');
      navArchive.classList.add('active');
      
      updateArchiveCards();
    }
  }

  // Événements pour la navigation entre les pages
  document.querySelector('#nav-active').addEventListener('click', () => switchPage('active'));
  document.querySelector('#nav-archive').addEventListener('click', () => switchPage('archive'));

  // Gestion du filtre archive
  viewFilterArchive.addEventListener('change', () => {
    currentFilterArchive = viewFilterArchive.value;
    updateArchiveCards();
    showNotification(`Filtre archive appliqué: ${currentFilterArchive === 'all' ? 'Tous' : currentFilterArchive}`);
  });

  // Gestion du tri archive
  sortSelectArchive.addEventListener('change', () => {
    currentSortArchive = sortSelectArchive.value;
    updateArchiveCards();
    const sortMessages = {
      'time-desc': 'Tri archive: Plus récent d\'abord',
      'time-asc': 'Tri archive: Plus ancien d\'abord',
      'partner-asc': 'Tri archive: Partenaire A-Z',
      'partner-desc': 'Tri archive: Partenaire Z-A'
    };
    showNotification(sortMessages[currentSortArchive]);
  });

  // Gestion de la recherche
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    
    // Afficher/masquer le bouton de suppression
    if (searchQuery.trim() !== '') {
      clearSearchBtn.style.display = 'block';
    } else {
      clearSearchBtn.style.display = 'none';
    }
    
    // Mettre à jour l'affichage selon la page active
    if (currentPage === 'active') {
      updateActiveCards();
    } else {
      updateArchiveCards();
    }
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    
    // Mettre à jour l'affichage selon la page active
    if (currentPage === 'active') {
      updateActiveCards();
    } else {
      updateArchiveCards();
    }
    
    searchInput.focus();
  });

  // Charger les données au démarrage
  loadList().then(() => {
    loadCustomOrder();
    switchPage('active');
    console.log('🚀 RP Tracker initialisé avec succès');
  });
});

// Filtrer les RPs selon le type (actifs vs archivés)
function getActiveRPs() {
  return rpList.filter(item => 
    item.turn === "À toi de poster" || item.turn === "À ton partenaire de poster"
  );
}

function getArchivedRPs() {
  return rpList.filter(item => 
    item.turn === "RP terminé" || item.turn === "RP abandonné"
  );
}

// Fonction utilitaire pour mettre à jour l'affichage selon la page courante
function updateCurrentView() {
  if (currentPage === 'active') {
    updateActiveCards();
  } else {
    updateArchiveCards();
  }
}

// Mettre à jour l'affichage du temps pour toutes les cartes visibles
function updateTimeDisplays() {
  const activeCards = document.querySelectorAll('#cards-view .rp-card');
  const archiveCards = document.querySelectorAll('#cards-view-archive .rp-card');
  
  // Mettre à jour les cartes actives
  activeCards.forEach((card, index) => {
    const activeRPs = getActiveRPs();
    let filteredList = activeRPs;
    if (currentFilter !== 'all') {
      filteredList = activeRPs.filter(item => item.turn === currentFilter);
    }
    filteredList = sortRPs(filteredList, currentSort);
    
    if (filteredList[index]) {
      const { timeStr, className } = getTimeDisplay(filteredList[index].date);
      const timeTextElement = card.querySelector('.time-text');
      if (timeTextElement) {
        timeTextElement.textContent = timeStr;
        timeTextElement.className = `time-text ${className}`;
      }
    }
  });
  
  // Mettre à jour les cartes archivées
  archiveCards.forEach((card, index) => {
    const archivedRPs = getArchivedRPs();
    let filteredList = archivedRPs;
    if (currentFilterArchive !== 'all') {
      filteredList = archivedRPs.filter(item => item.turn === currentFilterArchive);
    }
    filteredList = sortRPs(filteredList, currentSortArchive);
    
    if (filteredList[index]) {
      const { timeStr, className } = getTimeDisplay(filteredList[index].date);
      const timeTextElement = card.querySelector('.time-text');
      if (timeTextElement) {
        timeTextElement.textContent = timeStr;
        timeTextElement.className = `time-text ${className}`;
      }
    }
  });
}

// Démarrer le timer de mise à jour du temps
function startTimeUpdateTimer() {
  // Arrêter le timer existant s'il y en a un
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
  }
  
  // Mettre à jour toutes les minutes (60000 ms)
  timeUpdateInterval = setInterval(() => {
    updateTimeDisplays();
  }, 60000);
}

// Arrêter le timer de mise à jour du temps
function stopTimeUpdateTimer() {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
    timeUpdateInterval = null;
  }
}

// Mise à jour automatique du temps écoulé
timeUpdateInterval = setInterval(updateTimeDisplays, 60000);

// ========================= 
// GESTION DU MENU FICHIER
// =========================

// Gestion du menu déroulant
const fichierMenu = document.getElementById('fichier-menu');
const fichierDropdown = document.getElementById('fichier-dropdown');
const importFileInput = document.getElementById('import-file');

// Ouvrir/fermer le menu
fichierMenu.addEventListener('click', (e) => {
  e.stopPropagation();
  fichierDropdown.classList.toggle('show');
  fichierMenu.classList.toggle('active');
});

// Fermer le menu quand on clique ailleurs
document.addEventListener('click', () => {
  fichierDropdown.classList.remove('show');
  fichierMenu.classList.remove('active');
});

// Empêcher la fermeture du menu quand on clique dedans
fichierDropdown.addEventListener('click', (e) => {
  e.stopPropagation();
});

// Fonction pour exporter les données
function exportData() {
  const data = {
    rpList: rpList,
    userSuggestions: userSuggestions,
    exportDate: new Date().toISOString(),
    version: "1.0"
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `rp-tracker-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showNotification('Données exportées avec succès !');
}

// Fonction pour importer les données
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      // Vérifier la structure des données
      if (!data.rpList || !Array.isArray(data.rpList)) {
        throw new Error('Format de fichier invalide');
      }
      
      // Confirmation avant import
      if (confirm(`Voulez-vous vraiment importer ce fichier ?\n\nCela remplacera toutes vos données actuelles.\n\nNombre de RPs à importer: ${data.rpList.length}`)) {
        // Importer les données en convertissant les dates
        rpList = data.rpList.map(item => {
          // S'assurer que la date est correctement convertie
          let itemDate = item.date;
          if (typeof itemDate === 'string') {
            itemDate = new Date(itemDate);
          } else if (typeof itemDate === 'number') {
            itemDate = new Date(itemDate);
          } else if (!(itemDate instanceof Date)) {
            // Si ce n'est pas une date valide, utiliser la date actuelle
            itemDate = new Date();
          }
          
          // Vérifier si la date est valide
          if (isNaN(itemDate.getTime())) {
            itemDate = new Date();
          }
          
          return {
            ...item,
            date: itemDate
          };
        });
        
        // Importer les suggestions si disponibles
        if (data.userSuggestions) {
          userSuggestions = data.userSuggestions;
          saveSuggestions();
        }
        
        // Sauvegarder et mettre à jour l'affichage
        saveList();
        updateCurrentView();
        
        showNotification(`Données importées avec succès ! ${data.rpList.length} RPs chargés.`);
      }
    } catch (error) {
      showNotification('Erreur lors de l\'importation du fichier. Vérifiez le format.', 'error');
      console.error('Erreur d\'importation:', error);
    }
  };
  
  reader.readAsText(file);
  // Réinitialiser l'input file
  importFileInput.value = '';
}

// Fonction pour créer un nouveau fichier
function newFile() {
  if (rpList.length === 0) {
    showNotification('Aucune donnée à effacer.');
    return;
  }
  
  if (confirm('Voulez-vous vraiment créer un nouveau fichier ?\n\nCela supprimera toutes vos données actuelles.')) {
    rpList = [];
    userSuggestions = {
      partners: [],
      locations: [],
      types: [],
      universes: []
    };
    
    saveList();
    saveSuggestions();
    updateCurrentView();
    
    showNotification('Nouveau fichier créé. Toutes les données ont été effacées.');
  }
}

// Fonction pour quitter l'application
function quitterApplication() {
  if (confirm('Voulez-vous vraiment quitter RP Tracker ?')) {
    window.close();
  }
}

// Événements du menu
document.getElementById('enregistrer-sous').addEventListener('click', (e) => {
  e.preventDefault();
  exportData();
  fichierDropdown.classList.remove('show');
  fichierMenu.classList.remove('active');
});

document.getElementById('ouvrir-fichier').addEventListener('click', (e) => {
  e.preventDefault();
  importFileInput.click();
  fichierDropdown.classList.remove('show');
  fichierMenu.classList.remove('active');
});

document.getElementById('nouveau-fichier').addEventListener('click', (e) => {
  e.preventDefault();
  newFile();
  fichierDropdown.classList.remove('show');
  fichierMenu.classList.remove('active');
});

document.getElementById('quitter-app').addEventListener('click', (e) => {
  e.preventDefault();
  quitterApplication();
  fichierDropdown.classList.remove('show');
  fichierMenu.classList.remove('active');
});

// Événement pour l'input file
importFileInput.addEventListener('change', importData);

// Attendre que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', function() {
    console.log('Renderer chargé');
    
    // Gestionnaire du formulaire d'ajout de RP
    const rpForm = document.getElementById('rpForm');
    if (rpForm) {
        rpForm.addEventListener('submit', async function(e) {
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
                // Charger les cartes existantes depuis Google Drive
                let cards = await driveStorage.loadData();
                
                // Ajouter la nouvelle carte
                cards.push(formData);
                
                // Sauvegarder sur Google Drive
                await driveStorage.saveData(cards);
                
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
async function loadExistingRPs() {
    const userId = sessionStorage.getItem('user_id');
    if (!userId) return;
    
    try {
        const cards = await driveStorage.loadData();
        
        if (cards.length > 0) {
            console.log(`${cards.length} RPs chargés depuis Google Drive`);
            renderCards(cards);
        }
    } catch (error) {
        console.error('Erreur chargement RPs:', error);
        showNotification('Erreur lors du chargement des RPs', 'error');
    }
}
