const CLIENT_ID = '239325905492-j5a5skfekv9io2u77tj41aaki4nmc33o.apps.googleusercontent.com';
const AUTHORIZED_ORIGINS = [
    'https://drelall.github.io',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];

// Vérifie si l'origine actuelle est autorisée
const isAuthorizedOrigin = () => {
    return AUTHORIZED_ORIGINS.some(origin => window.location.origin.startsWith(origin));
};

function handleCredentialResponse(response) {
    if (!isAuthorizedOrigin()) {
        console.error('Origine non autorisée:', window.location.origin);
        showNotification('Erreur : origine non autorisée', 'error');
        return;
    }
    // Le jeton contient les informations de l'utilisateur
    const credential = response.credential;
    
    // Décode le jeton pour obtenir les informations de l'utilisateur
    const payload = JSON.parse(atob(credential.split('.')[1]));
    
    // Affiche l'email de l'utilisateur
    document.getElementById('user-email').textContent = payload.email;
    
    // Cache le bouton de connexion et affiche la section connectée
    const googleButton = document.querySelector('.g_id_signin');
    if (googleButton) googleButton.style.display = 'none';
    document.getElementById('auth-logged-in').style.display = 'flex';
    
    // Sauvegarde le jeton pour les futures requêtes
    localStorage.setItem('google_token', credential);
    
    // Affiche une notification de succès
    showNotification('Connexion réussie !', 'success');
}

async function signInWithGoogle(token) {
    try {
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: token
        });
        
        if (error) throw error;
        console.log('Connecté avec succès:', data);
        
    } catch (error) {
        console.error('Erreur de connexion:', error.message);
    }
}

// Fonction de déconnexion
async function handleLogout() {
    try {
        // Supprime le token du stockage local
        localStorage.removeItem('google_token');
        
        // Réinitialise l'interface
        document.getElementById('g_id_onload').style.display = 'block';
        document.getElementById('auth-logged-in').style.display = 'none';
        document.getElementById('user-email').textContent = '';
        
        // Déconnexion de Google
        const auth2 = google.accounts.oauth2.revoke(localStorage.getItem('google_token'));
        
        // Rafraîchit la page pour réinitialiser complètement l'état
        window.location.reload();
        
        showNotification('Déconnexion réussie', 'success');
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        showNotification('Erreur lors de la déconnexion', 'error');
    }
}

// Ajoute l'écouteur d'événement pour le bouton de déconnexion
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});