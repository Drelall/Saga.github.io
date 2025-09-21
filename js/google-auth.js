// Configuration Google
const GOOGLE_CLIENT_ID = '239325905492-tu5l9oblsjjq1s3gii35juauscc2qrph.apps.googleusercontent.com';

// Variables globales
let currentUser = null;
window.currentUser = null;

// Fonction GSI (Google Sign-In) - Version simplifiée qui fonctionne
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
        
        // Initialiser Google Drive en arrière-plan (sans bloquer l'UI)
        initGoogleDriveAsync();
        
        // Afficher l'application immédiatement
        updateUIAfterLogin();
        
    } catch (error) {
        console.error('❌ Erreur traitement connexion:', error);
        alert('Erreur lors de la connexion');
    }
};

// Initialiser Google Drive en arrière-plan (non bloquant)
async function initGoogleDriveAsync() {
    try {
        console.log('🔧 Initialisation Google Drive en arrière-plan...');
        
        // Attendre que gapi soit disponible
        if (!window.gapi) {
            console.warn('⚠️ GAPI non disponible, Drive sera désactivé temporairement');
            return;
        }
        
        // Charger les modules nécessaires
        await new Promise((resolve, reject) => {
            gapi.load('client:auth2', {
                callback: resolve,
                onerror: () => {
                    console.warn('⚠️ Erreur chargement GAPI modules');
                    resolve(); // Continuer même si ça échoue
                }
            });
        });

        // Initialiser le client avec les permissions Drive
        await gapi.client.init({
            clientId: GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.appdata',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        });

        console.log('✅ Google Drive API initialisée en arrière-plan');
        window.gapi = gapi;
        
    } catch (error) {
        console.warn('⚠️ Google Drive non disponible, utilisation en mode dégradé:', error);
        // L'application continue de fonctionner sans Drive
    }
}

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

// Initialisation simplifiée
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initialisation authentification...');
    
    // Vérifier session existante
    const savedEmail = sessionStorage.getItem('user_email');
    const savedUserId = sessionStorage.getItem('user_id');
    const savedName = sessionStorage.getItem('user_name');
    
    if (savedEmail && savedUserId) {
        console.log('🔍 Session utilisateur trouvée:', savedEmail);
        
        currentUser = {
            email: savedEmail,
            sub: savedUserId,
            name: savedName || savedEmail
        };
        window.currentUser = currentUser;
        
        // Initialiser Drive en arrière-plan
        initGoogleDriveAsync();
        
        // Afficher l'application
        updateUIAfterLogin();
    } else {
        console.log('ℹ️ Aucune session, écran d\'accueil');
    }
    
    // Configurer bouton déconnexion
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    console.log('✅ Authentification initialisée');
});