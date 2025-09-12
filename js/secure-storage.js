// Gestionnaire pour Google Drive avec backend sécurisé
class SecureGoogleDriveStorage {
    static async saveCards(cards) {
        try {
            const token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
            
            const response = await fetch(`${config.backend.url}/api/drive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'save',
                    cards: cards
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            throw error;
        }
    }

    static async loadCards() {
        try {
            const token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
            
            const response = await fetch(`${config.backend.url}/api/drive?action=load`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            return data.cards || [];
        } catch (error) {
            console.error('Erreur chargement:', error);
            return [];
        }
    }
}