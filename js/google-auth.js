// Configuration
const GOOGLE_CONFIG = {
    apiKey: 'AIzaSyDjci3kiYdN7e1Wuz3Y5H6Up9j9dZAAaS0',
    clientId: '239325905492-tu5l9oblsjjq1s3gii35juauscc2qrph.apps.googleusercontent.com'
};

// Variable globale pour l'utilisateur
let currentUser = null;

// Fonction pour gérer la réponse d'authentification
function handleCredentialResponse(response) {
    try {
        currentUser = jwt_decode(response.credential);
        sessionStorage.setItem('google_token', response.credential);
        
        console.log('Utilisateur connecté:', currentUser.email);
        
        // Masquer le bouton de connexion
        const googleButton = document.querySelector('.g_id_signin');
        if (googleButton) googleButton.style.display = 'none';
        
        // Afficher l'interface connectée
        const authLoggedIn = document.getElementById('auth-logged-in');
        const userEmail = document.getElementById('user-email');
        if (authLoggedIn) authLoggedIn.style.display = 'flex';
        if (userEmail) userEmail.textContent = currentUser.email;
        
        // Afficher l'application et masquer l'écran d'accueil
        showApp();
        
    } catch (error) {
        console.error('Erreur de connexion:', error);
    }
}

// Fonction pour afficher l'application
function showApp() {
    const appContent = document.querySelector('.container');
    const menubar = document.querySelector('.menubar');
    const welcomeScreen = document.getElementById('welcome-screen');
    
    if (appContent) appContent.style.display = 'block';
    if (menubar) menubar.style.display = 'flex';
    if (welcomeScreen) welcomeScreen.style.display = 'none';
    
    console.log('Application affichée');
}

// Fonction pour masquer l'application
function hideApp() {
    const appContent = document.querySelector('.container');
    const menubar = document.querySelector('.menubar');
    const welcomeScreen = document.getElementById('welcome-screen');
    
    if (appContent) appContent.style.display = 'none';
    if (menubar) menubar.style.display = 'none';
    if (welcomeScreen) welcomeScreen.style.display = 'flex';
}

// Fonction de déconnexion
function handleLogout() {
    currentUser = null;
    sessionStorage.removeItem('google_token');
    
    // Réinitialiser l'interface
    const googleButton = document.querySelector('.g_id_signin');
    const authLoggedIn = document.getElementById('auth-logged-in');
    const userEmail = document.getElementById('user-email');
    
    if (googleButton) googleButton.style.display = 'block';
    if (authLoggedIn) authLoggedIn.style.display = 'none';
    if (userEmail) userEmail.textContent = '';
    
    hideApp();
    window.location.reload();
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier la session existante
    const token = sessionStorage.getItem('google_token');
    if (token) {
        try {
            currentUser = jwt_decode(token);
            const userEmail = document.getElementById('user-email');
            const authLoggedIn = document.getElementById('auth-logged-in');
            const googleButton = document.querySelector('.g_id_signin');
            
            if (userEmail) userEmail.textContent = currentUser.email;
            if (authLoggedIn) authLoggedIn.style.display = 'flex';
            if (googleButton) googleButton.style.display = 'none';
            
            showApp();
        } catch (error) {
            console.error('Token invalide:', error);
            sessionStorage.removeItem('google_token');
        }
    }
    
    // Ajouter l'écouteur pour le bouton de déconnexion
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});