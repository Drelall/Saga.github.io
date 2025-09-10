const CLIENT_ID = '239325905492-j5a5skfekv9io2u77tj41aaki4nmc33o.apps.googleusercontent.com';

function handleCredentialResponse(response) {
    // Le jeton contient les informations de l'utilisateur
    const credential = response.credential;
    
    // Décode le jeton pour obtenir les informations de l'utilisateur
    const payload = JSON.parse(atob(credential.split('.')[1]));
    
    // Affiche l'email de l'utilisateur
    document.getElementById('user-email').textContent = payload.email;
    
    // Cache le bouton de connexion et affiche la section connectée
    document.getElementById('g_id_onload').style.display = 'none';
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