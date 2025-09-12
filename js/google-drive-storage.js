import config from './config.js';

class GoogleDriveStorage {
    static FOLDER_NAME = 'RPTracker';
    static FILE_NAME = 'rp_cards.json';

    static async initializeGoogleDrive() {
        // Charger l'API Google Drive
        await gapi.client.load('drive', 'v3');
        await gapi.client.init({
            apiKey: config.googleDrive.apiKey,
            clientId: config.googleDrive.clientId,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            scope: config.googleDrive.scopes.join(' ')
        });
    }

    static async saveCards(cards) {
        try {
            // Trouver ou créer le dossier RPTracker
            let folderId = await this.findOrCreateAppFolder();
            const content = JSON.stringify(cards);
            
            const response = await gapi.client.drive.files.list({
                q: `name='${this.FILE_NAME}' and '${folderId}' in parents`,
                spaces: 'drive'
            });

            if (response.result.files.length > 0) {
                const fileId = response.result.files[0].id;
                // Mettre à jour le fichier existant
                await gapi.client.request({
                    path: `/upload/drive/v3/files/${fileId}`,
                    method: 'PATCH',
                    params: { uploadType: 'media' },
                    body: content
                });
            } else {
                // Créer un nouveau fichier
                await gapi.client.drive.files.create({
                    resource: {
                        name: this.FILE_NAME,
                        parents: [folderId],
                        mimeType: 'application/json'
                    },
                    media: {
                        mimeType: 'application/json',
                        body: content
                    }
                });
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            throw error;
        }
    }

    static async loadCards() {
        try {
            const folderId = await this.findOrCreateAppFolder();
            const response = await gapi.client.drive.files.list({
                q: `name='${this.FILE_NAME}' and '${folderId}' in parents`,
                spaces: 'drive'
            });

            if (response.result.files.length === 0) {
                return [];
            }

            const fileId = response.result.files[0].id;
            const content = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });

            return JSON.parse(content.body);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            return [];
        }
    }

    static async findOrCreateAppFolder() {
        const response = await gapi.client.drive.files.list({
            q: "name='RPTracker' and mimeType='application/vnd.google-apps.folder'",
            spaces: 'drive'
        });

        if (response.result.files.length > 0) {
            return response.result.files[0].id;
        }

        const folder = await gapi.client.drive.files.create({
            resource: {
                name: 'RPTracker',
                mimeType: 'application/vnd.google-apps.folder'
            }
        });

        return folder.result.id;
    }
}

export default GoogleDriveStorage;