// Configuration Google
const GOOGLE_CLIENT_ID = '239325905492-tu5l9oblsjjq1s3gii35juauscc2qrph.apps.googleusercontent.com';

// Variables globales
let currentUser = null;
window.currentUser = null;
let authInstance = null;

// Initialiser Google API avec OAuth2 (méthode utilisée par de nombreux développeurs)
async function initGoogleAPI() {
    try {
        console.log('🔧 Initialisation Google API...');
        
        // Charger gapi
        await new Promise((resolve) => {
            gapi.load('auth2:client', resolve);
        });

        // Initialiser le client avec TOUS les scopes nécessaires
        await gapi.client.init({
            clientId: GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        });

        authInstance = gapi.auth2.getAuthInstance();
        console.log('✅ Google API initialisée');

        // Vérifier si déjà connecté
        if (authInstance.isSignedIn.get()) {
            const user = authInstance.currentUser.get();
            handleSignIn(user);
        } else {
            console.log('ℹ️ Utilisateur non connecté');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erreur initialisation Google API:', error);
        throw error;
    }
}

// Gérer la connexion
function handleSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    
    currentUser = {
        email: profile.getEmail(),
        name: profile.getName(),
        sub: profile.getId(),
        picture: profile.getImageUrl()
    };
    
    window.currentUser = currentUser;
    
    console.log('👤 Utilisateur connecté:', currentUser.email);
    
    // Stocker les informations
    sessionStorage.setItem('user_email', currentUser.email);
    sessionStorage.setItem('user_id', currentUser.sub);
    sessionStorage.setItem('user_name', currentUser.name);
    
    updateUIAfterLogin();
}

// Fonction de connexion manuelle
async function signIn() {
    try {
        console.log('🔐 Tentative de connexion...');
        const user = await authInstance.signIn();
        handleSignIn(user);
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        alert('Erreur lors de la connexion');
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

// Fonction de déconnexion améliorée
async function handleLogout() {
    try {
        console.log('🚪 Déconnexion...');
        
        if (authInstance) {
            await authInstance.signOut();
        }
        
        currentUser = null;
        window.currentUser = null;
        sessionStorage.clear();
        
        // Réinitialiser interface
        const googleButton = document.querySelector('.google-signin-custom');
        const authLoggedIn = document.getElementById('auth-logged-in');
        
        if (googleButton) googleButton.style.display = 'block';
        if (authLoggedIn) authLoggedIn.style.display = 'none';
        
        hideApplication();
        
    } catch (error) {
        console.error('❌ Erreur déconnexion:', error);
        window.location.reload();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔧 Initialisation authentification...');
    
    try {
        await initGoogleAPI();
        
        // Créer bouton de connexion personnalisé
        createCustomSignInButton();
        
        // Configurer bouton déconnexion
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }
        
        console.log('✅ Authentification initialisée');
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
    }
});

// Créer un bouton de connexion personnalisé qui fonctionne
function createCustomSignInButton() {
    const existingButton = document.querySelector('.g_id_signin');
    if (existingButton) {
        // Remplacer le bouton GSI par un bouton personnalisé
        const customButton = document.createElement('button');
        customButton.className = 'google-signin-custom';
        customButton.innerHTML = '🔐 Se connecter avec Google';
        customButton.style.cssText = `
            background: #4285f4;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        `;
        
        customButton.addEventListener('click', signIn);
        
        existingButton.parentNode.replaceChild(customButton, existingButton);
    }
}

// Fonction GSI de fallback (garde la compatibilité)
window.handleCredentialResponse = function(response) {
    console.log('🔐 Fallback GSI - redirection vers OAuth2');
    signIn();
};