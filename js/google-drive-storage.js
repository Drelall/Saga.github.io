import config from './config.js';

class GoogleDriveStorage {
    constructor() {
        this.fileName = 'rp-tracker-data.json';
        this.fileId = null;
        this.isDriveAvailable = false;
        console.log('📦 Google Drive Storage initialisé');
    }

    // Vérifier si Google Drive est disponible (sans faire échouer l'app)
    async checkDriveAvailability() {
        try {
            if (!window.gapi || !gapi.client) {
                console.warn('⚠️ Google API non disponible');
                return false;
            }
            
            if (!window.currentUser) {
                console.warn('⚠️ Utilisateur non connecté');
                return false;
            }
            
            // Test simple pour voir si Drive API fonctionne
            await gapi.client.drive.about.get();
            this.isDriveAvailable = true;
            console.log('✅ Google Drive disponible');
            return true;
        } catch (error) {
            console.warn('⚠️ Google Drive non disponible:', error.message);
            this.isDriveAvailable = false;
            return false;
        }
    }

    // Sauvegarder (avec fallback localStorage si Drive indisponible)
    async saveData(data) {
        const userId = sessionStorage.getItem('user_id') || 'anonymous';
        
        // Essayer Google Drive d'abord
        if (await this.checkDriveAvailability()) {
            try {
                await this.saveToDrive(data);
                console.log('✅ Sauvegarde Google Drive réussie');
                return;
            } catch (error) {
                console.warn('⚠️ Échec sauvegarde Drive, fallback localStorage:', error.message);
            }
        }
        
        // Fallback vers localStorage
        localStorage.setItem(`rp_data_${userId}`, JSON.stringify(data));
        console.log('✅ Sauvegarde localStorage (fallback)');
    }

    // Charger (avec fallback localStorage si Drive indisponible)
    async loadData() {
        const userId = sessionStorage.getItem('user_id') || 'anonymous';
        
        // Essayer Google Drive d'abord
        if (await this.checkDriveAvailability()) {
            try {
                const data = await this.loadFromDrive();
                if (data && data.length > 0) {
                    console.log('✅ Chargement Google Drive réussi:', data.length, 'RPs');
                    return data;
                }
            } catch (error) {
                console.warn('⚠️ Échec chargement Drive, fallback localStorage:', error.message);
            }
        }
        
        // Fallback vers localStorage
        const localData = localStorage.getItem(`rp_data_${userId}`);
        if (localData) {
            const parsed = JSON.parse(localData);
            console.log('✅ Chargement localStorage (fallback):', parsed.length, 'RPs');
            return Array.isArray(parsed) ? parsed : [];
        }
        
        return [];
    }

    // Méthodes Google Drive (appelées seulement si Drive disponible)
    async saveToDrive(data) {
        await this.findDataFile();
        
        const content = JSON.stringify(data, null, 2);
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        if (this.fileId) {
            // Mettre à jour
            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify({name: this.fileName}) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                content +
                close_delim;

            await gapi.client.request({
                path: `https://www.googleapis.com/upload/drive/v3/files/${this.fileId}`,
                method: 'PATCH',
                params: {uploadType: 'multipart'},
                headers: {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                body: multipartRequestBody
            });
        } else {
            // Créer nouveau
            const metadata = {
                name: this.fileName,
                parents: ['appDataFolder']
            };

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                content +
                close_delim;

            const response = await gapi.client.request({
                path: 'https://www.googleapis.com/upload/drive/v3/files',
                method: 'POST',
                params: {uploadType: 'multipart'},
                headers: {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                body: multipartRequestBody
            });
            
            if (response.result && response.result.id) {
                this.fileId = response.result.id;
            }
        }
    }

    async loadFromDrive() {
        await this.findDataFile();
        
        if (!this.fileId) {
            return [];
        }
        
        const response = await gapi.client.drive.files.get({
            fileId: this.fileId,
            alt: 'media'
        });
        
        if (response.body) {
            const data = JSON.parse(response.body);
            return Array.isArray(data) ? data : [];
        }
        
        return [];
    }

    async findDataFile() {
        const response = await gapi.client.drive.files.list({
            q: `name='${this.fileName}' and trashed=false`,
            spaces: 'appDataFolder'
        });
        
        if (response.result.files && response.result.files.length > 0) {
            this.fileId = response.result.files[0].id;
        }
        
        return this.fileId;
    }
}

export default GoogleDriveStorage;