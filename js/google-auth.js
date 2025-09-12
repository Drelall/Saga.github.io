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

class GoogleAuth {
    constructor() {
        this.user = null;
        this.initializeGoogleSignIn();
        this.bindLogoutButton();
    }

    async initializeGoogleSignIn() {
        try {
            // Initialiser l'API Google
            await new Promise((resolve) => gapi.load('client:auth2', resolve));
            await GoogleDriveStorage.initializeGoogleDrive();

            google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: this.handleCredentialResponse.bind(this)
            });

            google.accounts.id.renderButton(
                document.querySelector('.g_id_signin'),
                { theme: 'outline', size: 'large' }
            );

            // Vérifier la session existante
            this.checkExistingSession();
        } catch (error) {
            console.error('Erreur d\'initialisation:', error);
        }
    }

    async handleCredentialResponse(response) {
        try {
            this.user = jwt_decode(response.credential);
            sessionStorage.setItem('google_token', response.credential);
            
            // Mettre à jour l'interface
            this.updateUI(true);
            
            // Charger les cartes depuis Google Drive
            const cards = await GoogleDriveStorage.loadCards();
            if (window.renderCards) {
                window.renderCards(cards);
            }
            
        } catch (error) {
            console.error('Erreur de connexion:', error);
        }
    }

    async checkExistingSession() {
        const token = sessionStorage.getItem('google_token');
        if (token) {
            try {
                this.user = jwt_decode(token);
                this.updateUI(true);
                const cards = await GoogleDriveStorage.loadCards();
                if (window.renderCards) {
                    window.renderCards(cards);
                }
            } catch (error) {
                console.error('Session invalide:', error);
                this.logout();
            }
        }
    }

    async logout() {
        try {
            this.user = null;
            sessionStorage.removeItem('google_token');
            this.updateUI(false);
            
            // Recharger la page pour réinitialiser l'état
            window.location.reload();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    }

    bindLogoutButton() {
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.logout());
        }
    }

    updateUI(isSignedIn) {
        const authLoggedIn = document.getElementById('auth-logged-in');
        const googleButton = document.querySelector('.g_id_signin');
        const userEmail = document.getElementById('user-email');

        if (isSignedIn && this.user) {
            authLoggedIn.style.display = 'flex';
            googleButton.style.display = 'none';
            userEmail.textContent = this.user.email;
        } else {
            authLoggedIn.style.display = 'none';
            googleButton.style.display = 'block';
            userEmail.textContent = '';
        }
    }
}

// Initialiser l'authentification
const auth = new GoogleAuth();