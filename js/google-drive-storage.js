import config from './config.js';

class GoogleDriveStorage {
    constructor() {
        this.fileName = 'rp-tracker-data.json';
        this.fileId = null;
        this.isInitialized = false;
    }

    // Initialiser Google Drive API
    async init() {
        if (this.isInitialized) return;

        try {
            await new Promise((resolve, reject) => {
                gapi.load('client', {
                    callback: resolve,
                    onerror: reject
                });
            });

            await gapi.client.init({
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            });

            this.isInitialized = true;
            console.log('Google Drive API initialisée');
            
            // Chercher le fichier existant
            await this.findDataFile();
        } catch (error) {
            console.error('Erreur initialisation Google Drive:', error);
            throw error;
        }
    }

    // Chercher le fichier de données existant
    async findDataFile() {
        try {
            const response = await gapi.client.drive.files.list({
                q: `name='${this.fileName}' and trashed=false`,
                spaces: 'appDataFolder'
            });

            if (response.result.files.length > 0) {
                this.fileId = response.result.files[0].id;
                console.log('Fichier de données trouvé:', this.fileId);
            } else {
                console.log('Aucun fichier de données trouvé');
            }
        } catch (error) {
            console.error('Erreur recherche fichier:', error);
        }
    }

    // Sauvegarder les données sur Google Drive
    async saveData(data) {
        try {
            await this.init();

            const fileContent = JSON.stringify(data, null, 2);
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            let metadata = {
                'name': this.fileName,
                'parents': ['appDataFolder']
            };

            let multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                fileContent +
                close_delim;

            let request;
            if (this.fileId) {
                // Mettre à jour le fichier existant
                request = gapi.client.request({
                    'path': `https://www.googleapis.com/upload/drive/v3/files/${this.fileId}`,
                    'method': 'PATCH',
                    'params': {'uploadType': 'multipart'},
                    'headers': {
                        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                    },
                    'body': multipartRequestBody
                });
            } else {
                // Créer un nouveau fichier
                request = gapi.client.request({
                    'path': 'https://www.googleapis.com/upload/drive/v3/files',
                    'method': 'POST',
                    'params': {'uploadType': 'multipart'},
                    'headers': {
                        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                    },
                    'body': multipartRequestBody
                });
            }

            const response = await request;
            if (!this.fileId) {
                this.fileId = response.result.id;
            }
            
            console.log('Données sauvegardées sur Google Drive');
            return response;
        } catch (error) {
            console.error('Erreur sauvegarde Google Drive:', error);
            throw error;
        }
    }

    // Charger les données depuis Google Drive
    async loadData() {
        try {
            await this.init();

            if (!this.fileId) {
                console.log('Aucun fichier de données, retour tableau vide');
                return [];
            }

            const response = await gapi.client.drive.files.get({
                fileId: this.fileId,
                alt: 'media'
            });

            const data = JSON.parse(response.body);
            console.log('Données chargées depuis Google Drive:', data.length, 'RPs');
            return data;
        } catch (error) {
            console.error('Erreur chargement Google Drive:', error);
            return [];
        }
    }

    // Supprimer toutes les données
    async deleteData() {
        try {
            if (this.fileId) {
                await gapi.client.drive.files.delete({
                    fileId: this.fileId
                });
                this.fileId = null;
                console.log('Données supprimées de Google Drive');
            }
        } catch (error) {
            console.error('Erreur suppression Google Drive:', error);
            throw error;
        }
    }
}

export default GoogleDriveStorage;