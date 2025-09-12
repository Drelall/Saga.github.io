import config from './config.js';

class GoogleAuth {
    constructor() {
        this.user = null;
        this.init();
    }

    async init() {
        try {
            await this.loadGapiClient();
            this.initializeGoogleSignIn();
            this.bindLogoutButton();
            this.checkExistingSession();
        } catch (error) {
            console.error('Erreur d\'initialisation:', error);
        }
    }

    async loadGapiClient() {
        return new Promise((resolve, reject) => {
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: config.googleDrive.apiKey,
                        clientId: config.googleDrive.clientId,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                        scope: 'https://www.googleapis.com/auth/drive.file'
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    initializeGoogleSignIn() {
        google.accounts.id.initialize({
            client_id: config.googleDrive.clientId,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            context: 'signin'
        });

        google.accounts.id.renderButton(
            document.querySelector('.g_id_signin'),
            { theme: 'outline', size: 'large', width: 250 }
        );
    }

    async handleCredentialResponse(response) {
        try {
            this.user = jwt_decode(response.credential);
            sessionStorage.setItem('google_token', response.credential);
            
            // Masquer le bouton de connexion
            document.querySelector('.g_id_signin').style.display = 'none';
            
            // Afficher l'interface connectée
            document.getElementById('auth-logged-in').style.display = 'flex';
            document.getElementById('user-email').textContent = this.user.email;
            
            // Afficher l'application
            toggleAppVisibility(true);
            
            // Charger les cartes
            const cards = await GoogleDriveStorage.loadCards();
            if (window.renderCards) {
                window.renderCards(cards);
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            showNotification('Erreur lors de la connexion', 'error');
        }
    }

    bindLogoutButton() {
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.logout());
        }
    }

    checkExistingSession() {
        const token = sessionStorage.getItem('google_token');
        if (token) {
            this.user = jwt_decode(token);
            document.querySelector('.g_id_signin').style.display = 'none';
            document.getElementById('auth-logged-in').style.display = 'flex';
            document.getElementById('user-email').textContent = this.user.email;
            toggleAppVisibility(true);
        }
    }

    logout() {
        this.user = null;
        sessionStorage.removeItem('google_token');
        google.accounts.id.disableAutoSelect();
        
        // Réinitialiser l'interface
        document.querySelector('.g_id_signin').style.display = 'block';
        document.getElementById('auth-logged-in').style.display = 'none';
        document.getElementById('user-email').textContent = '';
        
        toggleAppVisibility(false);
        window.location.reload();
    }
}

// Créer une instance de l'authentification
const auth = new GoogleAuth();
export default auth;