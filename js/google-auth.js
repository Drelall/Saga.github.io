// Configuration Google
const GOOGLE_CLIENT_ID = '239325905492-tu5l9oblsjjq1s3gii35juauscc2qrph.apps.googleusercontent.com';
const DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';
let driveAccessToken = null;
let tokenClient = null;

// Variables globales
let currentUser = null;
window.currentUser = null;

// Fonction GSI simple qui marche
window.handleCredentialResponse = function(response) {
    console.log('🔐 Connexion Google réussie !');
    try {
        if (!response || !response.credential) {
            console.error('⚠️ Réponse GSI invalide');
            return;
        }
        const parts = response.credential.split('.');
        if (parts.length < 2) {
            console.error('⚠️ JWT mal formé');
            return;
        }
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        currentUser = payload;
        window.currentUser = currentUser;
        console.log('👤 Utilisateur connecté:', currentUser.email);
        sessionStorage.setItem('user_email', currentUser.email);
        sessionStorage.setItem('user_id', currentUser.sub);
        sessionStorage.setItem('user_name', currentUser.name || currentUser.email);
        updateUIAfterLogin();
        // Demander les scopes Drive
        requestDriveAccess();
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

// Initialiser le client de jeton OAuth (Drive)
function initTokenClient() {
    if (tokenClient) return;
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: DRIVE_SCOPES,
        prompt: '',
        callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                driveAccessToken = tokenResponse.access_token;
                sessionStorage.setItem('drive_access_token', driveAccessToken);
                console.log('✅ Jeton Drive obtenu');
                document.dispatchEvent(new CustomEvent('drive-ready'));
            }
        }
    });
}

// Demander le jeton Drive (silencieux si possible)
function requestDriveAccess() {
    initTokenClient();
    tokenClient.requestAccessToken({ prompt: driveAccessToken ? '' : 'consent' });
}

// Auto-diagnostic basique
function runHealthCheck(context = {}) {
    const result = {
        contexte: context,
        clientIdOK: GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com'),
        userSessionOK: !!sessionStorage.getItem('user_id'),
        dom: {
            welcomeScreen: !!document.getElementById('welcome-screen'),
            formContainer: !!document.querySelector('.container'),
            logoutButton: !!document.getElementById('logout-button')
        },
        etatAffichage: {
            appVisible: document.querySelector('.container')?.style.display !== 'none',
            menubarVisible: document.querySelector('.menubar')?.style.display !== 'none'
        },
        horodatage: new Date().toISOString()
    };
    console.log('🩺 HEALTH CHECK ▶', result);
    return result;
}

// Initialisation ULTRA SIMPLE
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initialisation...');
    // Empêcher double init
    if (window.__AUTH_INIT_DONE__) {
        console.log('⏭️ Initialisation déjà effectuée');
        return;
    }
    window.__AUTH_INIT_DONE__ = true;

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
        const savedToken = sessionStorage.getItem('drive_access_token');
        if (savedToken) {
            driveAccessToken = savedToken;
            console.log('♻️ Jeton Drive restauré');
            document.dispatchEvent(new CustomEvent('drive-ready'));
        } else {
            requestDriveAccess();
        }
    } else {
        runHealthCheck({ noSession:true });
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    console.log('✅ Prêt');
});

// Exposer pour le module Drive
export function getDriveAccessToken() {
    return driveAccessToken;
}