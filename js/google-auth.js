// Configuration Google
const GOOGLE_CLIENT_ID = '239325905492-tu5l9oblsjjq1s3gii35juauscc2qrph.apps.googleusercontent.com';

// Variables globales
let currentUser = null;
window.currentUser = null;

// Fonction appelée par Google après connexion réussie
window.handleCredentialResponse = function(response) {
    console.log('🔐 Connexion Google réussie !');
    
    try {
        // Décoder le token JWT
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        currentUser = payload;
        window.currentUser = currentUser;
        
        console.log('👤 Utilisateur connecté:', currentUser.email);
        
        // Stocker les informations
        sessionStorage.setItem('google_token', response.credential);
        sessionStorage.setItem('user_email', currentUser.email);
        sessionStorage.setItem('user_id', currentUser.sub);
        
        // Initialiser Google Drive API AVANT d'afficher l'interface
        initGoogleDriveAPI().then(() => {
            updateUIAfterLogin();
        }).catch(error => {
            console.error('❌ Erreur Google Drive API:', error);
            updateUIAfterLogin(); // Continuer même si Drive échoue
        });
        
    } catch (error) {
        console.error('❌ Erreur traitement connexion:', error);
        alert('Erreur lors de la connexion');
    }
};

// Initialiser Google Drive API
async function initGoogleDriveAPI() {
    try {
        console.log('🔧 Initialisation Google Drive API...');
        
        // Attendre que gapi soit disponible
        if (!window.gapi) {
            throw new Error('GAPI non disponible');
        }
        
        // Charger les modules nécessaires
        await new Promise((resolve, reject) => {
            gapi.load('client:auth2', {
                callback: resolve,
                onerror: reject
            });
        });

        // Initialiser le client avec les permissions Drive
        await gapi.client.init({
            clientId: GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.appdata',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        });

        // Obtenir l'autorisation Drive si nécessaire
        const authInstance = gapi.auth2.getAuthInstance();
        if (!authInstance.isSignedIn.get()) {
            await authInstance.signIn({
                scope: 'https://www.googleapis.com/auth/drive.appdata'
            });
        }

        console.log('✅ Google Drive API initialisée');
        window.gapi = gapi; // Rendre accessible globalement
        
    } catch (error) {
        console.error('❌ Erreur Google Drive API:', error);
        throw error;
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

// Fonction de déconnexion
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

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initialisation authentification...');
    
    // Vérifier session existante
    const savedToken = sessionStorage.getItem('google_token');
    const savedEmail = sessionStorage.getItem('user_email');
    const savedUserId = sessionStorage.getItem('user_id');
    
    if (savedToken && savedEmail && savedUserId) {
        console.log('🔍 Session utilisateur trouvée:', savedEmail);
        
        currentUser = {
            email: savedEmail,
            sub: savedUserId
        };
        window.currentUser = currentUser;
        
        // Réinitialiser Google Drive pour la session existante
        initGoogleDriveAPI().then(() => {
            updateUIAfterLogin();
        }).catch(error => {
            console.error('❌ Erreur restauration Drive:', error);
            updateUIAfterLogin();
        });
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