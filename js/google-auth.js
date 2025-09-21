// Configuration Google
const GOOGLE_CLIENT_ID = '239325905492-tu5l9oblsjjq1s3gii35juauscc2qrph.apps.googleusercontent.com';

// Variables globales
let currentUser = null;

// Exposer currentUser globalement
window.currentUser = currentUser;

// Fonction appelée par Google après connexion réussie
window.handleCredentialResponse = function(response) {
    console.log('Connexion Google réussie !');
    
    try {
        // Décoder le token JWT manuellement (plus simple que jwt_decode)
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        currentUser = payload;
        
        console.log('Utilisateur connecté:', currentUser.email);
        
        // Stocker les informations
        sessionStorage.setItem('google_token', response.credential);
        sessionStorage.setItem('user_email', currentUser.email);
        sessionStorage.setItem('user_id', currentUser.sub);
        
        // Exposer currentUser globalement
        window.currentUser = currentUser;
        
        // Initialiser l'API Google pour Drive APRÈS la connexion
        initGoogleDriveAPI().then(() => {
            // Mettre à jour l'interface
            updateUIAfterLogin();
        }).catch(error => {
            console.error('Erreur initialisation API Google Drive:', error);
            // Continuer même si Drive échoue
            updateUIAfterLogin();
        });
        
    } catch (error) {
        console.error('Erreur lors du traitement de la connexion:', error);
        alert('Erreur lors de la connexion');
    }
};

// Initialiser l'API Google Drive avec OAuth2
async function initGoogleDriveAPI() {
    try {
        console.log('Initialisation de Google Drive API...');
        
        // Charger gapi.client si pas déjà fait
        await new Promise((resolve, reject) => {
            if (window.gapi && window.gapi.client) {
                resolve();
            } else {
                gapi.load('client:auth2', {
                    callback: resolve,
                    onerror: reject
                });
            }
        });

        // Initialiser le client avec les scopes Drive
        await gapi.client.init({
            clientId: GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.appdata',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        });

        // Vérifier si l'utilisateur est déjà autorisé
        const authInstance = gapi.auth2.getAuthInstance();
        const isAuthorized = authInstance.isSignedIn.get();
        
        if (!isAuthorized) {
            // Demander l'autorisation pour Google Drive
            await authInstance.signIn({
                scope: 'https://www.googleapis.com/auth/drive.appdata'
            });
        }

        console.log('✅ API Google Drive initialisée avec succès');
        window.gapi = gapi; // Rendre gapi accessible globalement
        
    } catch (error) {
        console.error('❌ Erreur initialisation API Google Drive:', error);
        throw error;
    }
}

// Fonction pour mettre à jour l'interface après connexion
function updateUIAfterLogin() {
    console.log('Mise à jour de l\'interface...');
    
    // Exposer currentUser globalement
    window.currentUser = currentUser;
    
    // Masquer le bouton de connexion Google
    const googleButton = document.querySelector('.g_id_signin');
    if (googleButton) {
        googleButton.style.display = 'none';
        console.log('Bouton Google masqué');
    }
    
    // Afficher les infos utilisateur connecté
    const authLoggedIn = document.getElementById('auth-logged-in');
    
    if (authLoggedIn) {
        authLoggedIn.style.display = 'flex';
        console.log('Section utilisateur connecté affichée');
    }
    
    // AFFICHER L'APPLICATION - C'est le plus important !
    showApplication();
}

// Fonction pour afficher l'application
function showApplication() {
    console.log('Affichage de l\'application principale...');
    
    // Masquer l'écran d'accueil
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
        console.log('✓ Écran d\'accueil masqué');
    }
    
    // Afficher le conteneur principal de l'application
    const appContainer = document.querySelector('.container');
    if (appContainer) {
        appContainer.style.display = 'block';
        console.log('✓ Application principale affichée');
    }
    
    // Afficher la barre de menu
    const menubar = document.querySelector('.menubar');
    if (menubar) {
        menubar.style.display = 'flex';
        console.log('✓ Barre de menu affichée');
    }
    
    console.log('🎉 Application complètement chargée !');
}

// Fonction pour masquer l'application (déconnexion)
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
    console.log('Déconnexion...');
    
    // Nettoyer les données
    currentUser = null;
    sessionStorage.clear();
    
    // Réinitialiser l'interface
    const googleButton = document.querySelector('.g_id_signin');
    const authLoggedIn = document.getElementById('auth-logged-in');
    
    if (googleButton) googleButton.style.display = 'block';
    if (authLoggedIn) authLoggedIn.style.display = 'none';
    
    // Masquer l'application
    hideApplication();
    
    // Recharger la page pour réinitialiser Google Sign-In
    window.location.reload();
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de l\'authentification...');
    
    // Vérifier si l'utilisateur était déjà connecté
    const savedToken = sessionStorage.getItem('google_token');
    const savedEmail = sessionStorage.getItem('user_email');
    const savedUserId = sessionStorage.getItem('user_id');
    
    if (savedToken && savedEmail && savedUserId) {
        console.log('Session utilisateur trouvée:', savedEmail);
        
        // Recréer l'objet utilisateur
        currentUser = {
            email: savedEmail,
            sub: savedUserId
        };
        
        // Exposer currentUser globalement
        window.currentUser = currentUser;
        
        // Initialiser Google Drive API pour la session restaurée
        initGoogleDriveAPI().then(() => {
            updateUIAfterLogin();
        }).catch(error => {
            console.error('Erreur initialisation Drive pour session restaurée:', error);
            updateUIAfterLogin();
        });
    } else {
        console.log('Aucune session trouvée, affichage de l\'écran d\'accueil');
    }
    
    // Configurer le bouton de déconnexion
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    console.log('Authentification initialisée avec succès');
});