const rpForm = document.getElementById('rpForm');
const notificationsContainer = document.getElementById('notifications');

// Éléments pour les RPs actifs
const cardsView = document.getElementById('cards-view');
const cardsEmptyState = document.getElementById('cards-empty-state');
const viewFilter = document.getElementById('view-filter');
const sortSelect = document.getElementById('sort-select');

// Éléments pour les RPs archivés
const cardsViewArchive = document.getElementById('cards-view-archive');
const cardsEmptyStateArchive = document.getElementById('cards-empty-state-archive');
const viewFilterArchive = document.getElementById('view-filter-archive');
const sortSelectArchive = document.getElementById('sort-select-archive');

// Éléments de navigation
const navActive = document.getElementById('nav-active');
const navArchive = document.getElementById('nav-archive');
const pageActive = document.getElementById('page-active');
const pageArchive = document.getElementById('page-archive');
const controlsActive = document.getElementById('controls-active');
const controlsArchive = document.getElementById('controls-archive');

let rpList = [];
let currentPage = 'active'; // 'active' ou 'archive'
let currentFilter = 'all';
let currentSort = 'time-desc';
let currentFilterArchive = 'all';
let currentSortArchive = 'time-desc';

// Timer pour mettre à jour l'affichage du temps
let timeUpdateInterval = null;

// Système de suggestions utilisateur
let userSuggestions = {
  partners: [],
  locations: [],
  types: [],
  universes: []
};

// Charger les suggestions depuis le localStorage
if (localStorage.getItem('userSuggestions')) {
  userSuggestions = JSON.parse(localStorage.getItem('userSuggestions'));
}

// Sauvegarder les suggestions
function saveSuggestions() {
  localStorage.setItem('userSuggestions', JSON.stringify(userSuggestions));
}

// Ajouter une suggestion
function addSuggestion(type, value) {
  if (value && !userSuggestions[type].includes(value)) {
    userSuggestions[type].push(value);
    saveSuggestions();
  }
}

// Obtenir les suggestions filtrées
function getSuggestions(type, query) {
  if (!query) return userSuggestions[type].slice(0, 5);
  
  const filtered = userSuggestions[type].filter(item => 
    item.toLowerCase().includes(query.toLowerCase())
  );
  
  // Trier par pertinence (correspondance exacte en premier)
  return filtered.sort((a, b) => {
    const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
    const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    return a.length - b.length;
  }).slice(0, 5);
}

// Créer un élément de suggestion
function createSuggestionElement(value, isFrequent = false) {
  const suggestion = document.createElement('div');
  suggestion.className = `autocomplete-suggestion ${isFrequent ? 'frequent' : ''}`;
  suggestion.textContent = value;
  suggestion.dataset.value = value;
  return suggestion;
}

// Configurer l'auto-complétion pour un champ
function setupAutocomplete(inputId, suggestionsId, type) {
  const input = document.getElementById(inputId);
  const suggestionsContainer = document.getElementById(suggestionsId);
  let selectedIndex = -1;

  input.addEventListener('input', function() {
    const query = this.value.trim();
    const suggestions = getSuggestions(type, query);
    
    suggestionsContainer.innerHTML = '';
    selectedIndex = -1;
    
    if (suggestions.length > 0 && query.length > 0) {
      suggestions.forEach((suggestion, index) => {
        const element = createSuggestionElement(suggestion, userSuggestions[type].indexOf(suggestion) < 3);
        element.addEventListener('click', () => {
          input.value = suggestion;
          suggestionsContainer.style.display = 'none';
        });
        suggestionsContainer.appendChild(element);
      });
      suggestionsContainer.style.display = 'block';
    } else {
      suggestionsContainer.style.display = 'none';
    }
  });

  input.addEventListener('keydown', function(e) {
    const suggestions = suggestionsContainer.querySelectorAll('.autocomplete-suggestion');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSelection();
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      input.value = suggestions[selectedIndex].dataset.value;
      suggestionsContainer.style.display = 'none';
    } else if (e.key === 'Escape') {
      suggestionsContainer.style.display = 'none';
    }
    
    function updateSelection() {
      suggestions.forEach((s, i) => {
        s.classList.toggle('selected', i === selectedIndex);
      });
    }
  });

  // Masquer les suggestions lors du clic à l'extérieur
  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.style.display = 'none';
    }
  });
}

// Sauvegarder et charger la liste
function saveList() {
  localStorage.setItem('rpList', JSON.stringify(rpList));
}

function loadList() {
  if (localStorage.getItem('rpList')) {
    try {
      rpList = JSON.parse(localStorage.getItem('rpList')).map(item => {
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
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      rpList = [];
    }
  }
}

// Calculer le temps écoulé
function getTimeDisplay(date) {
  // S'assurer que nous avons une date valide
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Date invalide passée à getTimeDisplay:', date);
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
  card.innerHTML = `
    <div class="card-header ${statusClass}">
      <h3 class="card-title">${item.rp}</h3>
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
  if (currentFilter !== 'all') {
    filteredList = activeRPs.filter(item => item.turn === currentFilter);
  }
  
  if (filteredList.length === 0) {
    cardsView.style.display = 'none';
    cardsEmptyState.style.display = 'block';
    cardsEmptyState.innerHTML = `
      <h3>Aucun RP trouvé</h3>
      <p>Aucun RP actif ne correspond au filtre sélectionné.</p>
    `;
    return;
  }

  // Tri selon la sélection
  filteredList = sortRPs(filteredList, currentSort);

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
  if (currentFilterArchive !== 'all') {
    filteredList = archivedRPs.filter(item => item.turn === currentFilterArchive);
  }
  
  if (filteredList.length === 0) {
    cardsViewArchive.style.display = 'none';
    cardsEmptyStateArchive.style.display = 'block';
    cardsEmptyStateArchive.innerHTML = `
      <h3>Aucun RP trouvé</h3>
      <p>Aucun RP archivé ne correspond au filtre sélectionné.</p>
    `;
    return;
  }

  // Tri selon la sélection
  filteredList = sortRPs(filteredList, currentSortArchive);

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
  const editButtons = cardsViewArchive.querySelectorAll('.btn-edit');
  const deleteButtons = cardsViewArchive.querySelectorAll('.btn-delete');

  editButtons.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      editCard(getArchivedRPs()[index]);
    });
  });

  deleteButtons.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCard(getArchivedRPs()[index]);
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

// Configuration des champs d'auto-complétion
document.addEventListener('DOMContentLoaded', function() {
  setupAutocomplete('partnerName', 'partnerSuggestions', 'partners');
  setupAutocomplete('rpLocation', 'locationSuggestions', 'locations');
  setupAutocomplete('rpType', 'typeSuggestions', 'types');
  setupAutocomplete('rpUniverse', 'universeSuggestions', 'universes');
  
  // Gestionnaire de soumission du formulaire
  rpForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const rpName = document.getElementById('rpName').value.trim();
    const partnerName = document.getElementById('partnerName').value.trim();
    const location = document.getElementById('rpLocation').value.trim();
    const type = document.getElementById('rpType').value.trim();
    const universe = document.getElementById('rpUniverse').value.trim();
    const turn = document.getElementById('turn').value;

    if (rpName && partnerName && turn) {
      // Ajouter aux suggestions
      addSuggestion('partners', partnerName);
      if (location) addSuggestion('locations', location);
      if (type) addSuggestion('types', type);
      if (universe) addSuggestion('universes', universe);

      rpList.push({
        id: Date.now() + Math.random(),
        rp: rpName,
        partner: partnerName,
        location: location || '',
        type: type || '',
        universe: universe || '',
        turn: turn,
        date: new Date()
      });
      saveList();
      updateCurrentView();
      rpForm.reset();
      showNotification(`RP "${rpName}" ajouté avec succès !`);
    }
  });

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

  // Charger les données au démarrage
  loadList();
  
  // Initialiser l'affichage des cartes actives
  switchPage('active');
  
  console.log('🚀 RP Tracker initialisé avec succès (Vue cartes uniquement)');

  // Fonction utilitaire pour mettre à jour l'affichage selon la page courante
  function updateCurrentView() {
    if (currentPage === 'active') {
      updateActiveCards();
    } else {
      updateArchiveCards();
    }
  }
});

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
