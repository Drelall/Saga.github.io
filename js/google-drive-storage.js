import config from './config.js';

class GoogleDriveStorage {
    constructor() {
        this.fileName = 'rp-tracker-data.json';
        this.fileId = null;
        this.folderId = null;
        console.log('📦 Google Drive Storage initialisé');
    }

    // Vérifier les permissions et l'authentification
    async checkAuth() {
        if (!window.gapi || !gapi.client) {
            throw new Error('Google API non initialisée');
        }
        
        if (!window.currentUser) {
            throw new Error('Utilisateur non connecté');
        }
        
        const authInstance = gapi.auth2.getAuthInstance();
        if (!authInstance.isSignedIn.get()) {
            throw new Error('Utilisateur non authentifié sur Google Drive');
        }
        
        return true;
    }

    // Trouver le fichier de données dans appDataFolder (plus simple)
    async findDataFile() {
        try {
            const response = await gapi.client.drive.files.list({
                q: `name='${this.fileName}' and trashed=false`,
                spaces: 'appDataFolder'
            });
            
            if (response.result.files && response.result.files.length > 0) {
                this.fileId = response.result.files[0].id;
                console.log('📄 Fichier données trouvé:', this.fileId);
            } else {
                console.log('📄 Aucun fichier données trouvé');
            }
            
            return this.fileId;
        } catch (error) {
            console.error('❌ Erreur recherche fichier:', error);
            throw error;
        }
    }

    // Sauvegarder sur Google Drive (méthode simplifiée qui fonctionne)
    async saveData(data) {
        await this.checkAuth();
        await this.findDataFile();
        
        const content = JSON.stringify(data, null, 2);
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        try {
            if (this.fileId) {
                // Mettre à jour le fichier existant
                const multipartRequestBody =
                    delimiter +
                    'Content-Type: application/json\r\n\r\n' +
                    JSON.stringify({name: this.fileName}) +
                    delimiter +
                    'Content-Type: application/json\r\n\r\n' +
                    content +
                    close_delim;

                const response = await gapi.client.request({
                    path: `https://www.googleapis.com/upload/drive/v3/files/${this.fileId}`,
                    method: 'PATCH',
                    params: {uploadType: 'multipart'},
                    headers: {
                        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                    },
                    body: multipartRequestBody
                });
                
                console.log('✅ Fichier mis à jour sur Google Drive');
                return response;
            } else {
                // Créer un nouveau fichier dans appDataFolder
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
                    console.log('✅ Nouveau fichier créé sur Google Drive:', this.fileId);
                }
                return response;
            }
        } catch (error) {
            console.error('❌ Erreur sauvegarde Google Drive:', error);
            throw error;
        }
    }

    // Charger depuis Google Drive
    async loadData() {
        await this.checkAuth();
        await this.findDataFile();
        
        if (!this.fileId) {
            console.log('📄 Aucun fichier, retour tableau vide');
            return [];
        }
        
        try {
            const response = await gapi.client.drive.files.get({
                fileId: this.fileId,
                alt: 'media'
            });
            
            if (response.body) {
                const data = JSON.parse(response.body);
                console.log('✅ Données chargées depuis Google Drive:', data.length, 'RPs');
                return Array.isArray(data) ? data : [];
            }
            
            return [];
        } catch (error) {
            console.error('❌ Erreur chargement Google Drive:', error);
            return [];
        }
    }

    // Supprimer toutes les données
    async deleteData() {
        await this.checkAuth();
        
        if (this.fileId) {
            try {
                await gapi.client.drive.files.delete({
                    fileId: this.fileId
                });
                this.fileId = null;
                console.log('✅ Données supprimées de Google Drive');
            } catch (error) {
                console.error('❌ Erreur suppression:', error);
                throw error;
            }
        }
    }
}

export default GoogleDriveStorage;