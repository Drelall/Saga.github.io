// Configuration Google
const GOOGLE_CLIENT_ID = '239325905492-tu5l9oblsjjq1s3gii35juauscc2qrph.apps.googleusercontent.com';

// Variables globales
let currentUser = null;
window.currentUser = null;

// Fonction GSI simple qui marche
window.handleCredentialResponse = function(response) {
    console.log('🔐 Connexion Google réussie !');
    
    try {
        // Décoder le token JWT
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        currentUser = payload;
        window.currentUser = currentUser;
        
        console.log('👤 Utilisateur connecté:', currentUser.email);
        
        // Stocker les informations
        sessionStorage.setItem('user_email', currentUser.email);
        sessionStorage.setItem('user_id', currentUser.sub);
        sessionStorage.setItem('user_name', currentUser.name || currentUser.email);
        
        // Afficher l'application DIRECTEMENT
        updateUIAfterLogin();
        
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        alert('Erreur lors de la connexion');
    }
};

// Fonction pour mettre à jour l'interface après connexion
function updateUIAfterLogin() {
    console.log('🔄 Mise à jour interface...');
    
    // Masquer le bouton de connexion
    const googleButton = document.querySelector('.g_id_signin');
    if (googleButton) {
        googleButton.style.display = 'none';
    }
    
    // Afficher section utilisateur connecté
    const authLoggedIn = document.getElementById('auth-logged-in');
    if (authLoggedIn) {
        authLoggedIn.style.display = 'flex';
    }
    
    // Afficher l'application
    showApplication();
}

// Fonction pour afficher l'application
function showApplication() {
    console.log('🚀 Affichage application...');
    
    // Masquer écran d'accueil
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }
    
    // Afficher conteneur principal
    const appContainer = document.querySelector('.container');
    if (appContainer) {
        appContainer.style.display = 'block';
    }
    
    // Afficher barre de menu
    const menubar = document.querySelector('.menubar');
    if (menubar) {
        menubar.style.display = 'flex';
    }
    
    console.log('✅ Application affichée');
}

// Fonction pour masquer l'application
function hideApplication() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const appContainer = document.querySelector('.container');
    const menubar = document.querySelector('.menubar');
    
    if (welcomeScreen) welcomeScreen.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
    if (menubar) menubar.style.display = 'none';
}

// Fonction de déconnexion simplifiée
function handleLogout() {
    console.log('🚪 Déconnexion...');
    
    currentUser = null;
    window.currentUser = null;
    sessionStorage.clear();
    
    // Réinitialiser interface
    const googleButton = document.querySelector('.g_id_signin');
    const authLoggedIn = document.getElementById('auth-logged-in');
    
    if (googleButton) googleButton.style.display = 'block';
    if (authLoggedIn) authLoggedIn.style.display = 'none';
    
    hideApplication();
    window.location.reload();
}

// Initialisation ULTRA SIMPLE
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initialisation...');
    
    // Vérifier session existante
    const savedEmail = sessionStorage.getItem('user_email');
    const savedUserId = sessionStorage.getItem('user_id');
    
    if (savedEmail && savedUserId) {
        console.log('🔍 Session trouvée:', savedEmail);
        
        currentUser = {
            email: savedEmail,
            sub: savedUserId,
            name: sessionStorage.getItem('user_name') || savedEmail
        };
        window.currentUser = currentUser;
        
        updateUIAfterLogin();
    }
    
    // Bouton déconnexion
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    console.log('✅ Prêt');
});