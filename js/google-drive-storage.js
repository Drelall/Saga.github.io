class GoogleDriveStorage {
    constructor() {
        this.fileName = 'rp-tracker-data.json';
        this.fileId = null;
        console.log('📦 Storage avec Google Drive + localStorage fallback');
    }

    // Initialiser Google Drive API simple
    async initGoogleDrive() {
        try {
            if (!window.gapi) {
                // Charger Google API
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://apis.google.com/js/api.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
                
                await new Promise((resolve) => {
                    gapi.load('client:auth2', resolve);
                });
            }

            // Initialiser client
            await gapi.client.init({
                clientId: '239325905492-tu5l9oblsjjq1s3gii35juauscc2qrph.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/drive.appdata',
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            });

            // S'authentifier
            const authInstance = gapi.auth2.getAuthInstance();
            if (!authInstance.isSignedIn.get()) {
                await authInstance.signIn();
            }

            console.log('✅ Google Drive initialisé');
            return true;
        } catch (error) {
            console.warn('⚠️ Google Drive non disponible:', error.message);
            return false;
        }
    }

    // Trouver fichier sur Drive
    async findFile() {
        try {
            const response = await gapi.client.drive.files.list({
                q: `name='${this.fileName}' and trashed=false`,
                spaces: 'appDataFolder'
            });

            if (response.result.files?.length > 0) {
                this.fileId = response.result.files[0].id;
                return this.fileId;
            }
            return null;
        } catch (error) {
            console.warn('⚠️ Erreur recherche fichier:', error);
            return null;
        }
    }

    // Sauvegarder sur Google Drive
    async saveToDrive(data) {
        const content = JSON.stringify(data, null, 2);
        
        if (this.fileId) {
            // Mettre à jour fichier existant
            await gapi.client.request({
                path: `https://www.googleapis.com/upload/drive/v3/files/${this.fileId}`,
                method: 'PATCH',
                params: { uploadType: 'media' },
                headers: { 'Content-Type': 'application/json' },
                body: content
            });
        } else {
            // Créer nouveau fichier
            const boundary = '-------314159265358979323846';
            const metadata = {
                name: this.fileName,
                parents: ['appDataFolder']
            };

            const multipartBody = [
                `--${boundary}`,
                'Content-Type: application/json',
                '',
                JSON.stringify(metadata),
                `--${boundary}`,
                'Content-Type: application/json',
                '',
                content,
                `--${boundary}--`
            ].join('\r\n');

            const response = await gapi.client.request({
                path: 'https://www.googleapis.com/upload/drive/v3/files',
                method: 'POST',
                params: { uploadType: 'multipart' },
                headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
                body: multipartBody
            });

            this.fileId = response.result.id;
        }
    }

    // Charger depuis Google Drive
    async loadFromDrive() {
        await this.findFile();
        
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

    // Sauvegarder (essaie Drive, sinon localStorage)
    async saveData(data) {
        const userId = sessionStorage.getItem('user_id') || 'default';
        
        try {
            // Essayer Google Drive
            if (await this.initGoogleDrive()) {
                await this.saveToDrive(data);
                console.log('✅ Sauvegarde Google Drive réussie:', data.length, 'RPs');
                
                // Sauvegarder aussi en local pour backup
                localStorage.setItem(`rp_data_${userId}`, JSON.stringify(data));
                return;
            }
        } catch (error) {
            console.warn('⚠️ Échec Google Drive, utilisation localStorage:', error.message);
        }
        
        // Fallback localStorage
        localStorage.setItem(`rp_data_${userId}`, JSON.stringify(data));
        console.log('✅ Sauvegarde localStorage:', data.length, 'RPs');
    }

    // Charger (essaie Drive, sinon localStorage)
    async loadData() {
        const userId = sessionStorage.getItem('user_id') || 'default';
        
        try {
            // Essayer Google Drive
            if (await this.initGoogleDrive()) {
                const driveData = await this.loadFromDrive();
                if (driveData.length > 0) {
                    console.log('✅ Chargement Google Drive:', driveData.length, 'RPs');
                    
                    // Synchroniser avec localStorage
                    localStorage.setItem(`rp_data_${userId}`, JSON.stringify(driveData));
                    return driveData;
                }
            }
        } catch (error) {
            console.warn('⚠️ Échec Google Drive, utilisation localStorage:', error.message);
        }
        
        // Fallback localStorage
        const localData = localStorage.getItem(`rp_data_${userId}`);
        if (localData) {
            const parsed = JSON.parse(localData);
            console.log('✅ Chargement localStorage:', parsed.length, 'RPs');
            return Array.isArray(parsed) ? parsed : [];
        }
        
        return [];
    }
}

export default GoogleDriveStorage;