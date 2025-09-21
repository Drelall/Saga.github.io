class GoogleDriveStorage {
    constructor() {
        console.log('📦 Storage localStorage (simple et fiable)');
    }

    // Sauvegarder en localStorage
    async saveData(data) {
        try {
            const userId = sessionStorage.getItem('user_id') || 'default';
            localStorage.setItem(`rp_data_${userId}`, JSON.stringify(data));
            console.log('✅ Sauvegarde OK:', data.length, 'RPs');
            return Promise.resolve();
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            throw error;
        }
    }

    // Charger depuis localStorage
    async loadData() {
        try {
            const userId = sessionStorage.getItem('user_id') || 'default';
            const data = localStorage.getItem(`rp_data_${userId}`);
            
            if (data) {
                const parsed = JSON.parse(data);
                console.log('✅ Chargement OK:', parsed.length, 'RPs');
                return Promise.resolve(Array.isArray(parsed) ? parsed : []);
            }
            
            return Promise.resolve([]);
        } catch (error) {
            console.error('❌ Erreur chargement:', error);
            return Promise.resolve([]);
        }
    }
}

export default GoogleDriveStorage;