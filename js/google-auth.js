// Configuration Google
const GOOGLE_CLIENT_ID = '239325905492-tu5l9oblsjjq1s3gii35juauscc2qrph.apps.googleusercontent.com';

// Variable globale pour l'utilisateur
let currentUser = null;

// Fonction appelée automatiquement par Google après connexion
function handleCredentialResponse(response) {
    try {
        // Décoder le token JWT
        currentUser = jwt_decode(response.credential);
        
        // Stocker le token
        sessionStorage.setItem('google_token', response.credential);
        
        console.log('Utilisateur connecté:', currentUser.email);
        
        // Masquer le bouton de connexion
        const googleButton = document.querySelector('.g_id_signin');
        if (googleButton) {
            googleButton.style.display = 'none';
        }
        
        // Afficher l'interface connectée
        const authLoggedIn = document.getElementById('auth-logged-in');
        const userEmail = document.getElementById('user-email');
        if (authLoggedIn) authLoggedIn.style.display = 'flex';
        if (userEmail) userEmail.textContent = currentUser.email;
        
        // AFFICHER L'APPLICATION (c'est ça qui manquait !)
        showApp();
        
    } catch (error) {
        console.error('Erreur de connexion:', error);
        alert('Erreur lors de la connexion');
    }
}

// Fonction pour afficher l'application
function showApp() {
    console.log('Affichage de l\'application...');
    
    const appContent = document.querySelector('.container');
    const menubar = document.querySelector('.menubar');
    const welcomeScreen = document.getElementById('welcome-screen');
    
    // Masquer l'écran d'accueil
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
        console.log('Écran d\'accueil masqué');
    }
    
    // Afficher l'application
    if (appContent) {
        appContent.style.display = 'block';
        console.log('Application affichée');
    }
    
    // Afficher la barre de menu
    if (menubar) {
        menubar.style.display = 'flex';
        console.log('Menu affiché');
    }
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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisation de l\'authentification...');
    
    // Initialiser Google Sign-In
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false
    });
    
    // Vérifier si l'utilisateur est déjà connecté
    const token = sessionStorage.getItem('google_token');
    if (token) {
        try {
            currentUser = jwt_decode(token);
            console.log('Session existante trouvée:', currentUser.email);
            
            // Mettre à jour l'interface
            const userEmail = document.getElementById('user-email');
            const authLoggedIn = document.getElementById('auth-logged-in');
            const googleButton = document.querySelector('.g_id_signin');
            
            if (userEmail) userEmail.textContent = currentUser.email;
            if (authLoggedIn) authLoggedIn.style.display = 'flex';
            if (googleButton) googleButton.style.display = 'none';
            
            // Afficher l'application
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
    
    console.log('Authentification initialisée');
});