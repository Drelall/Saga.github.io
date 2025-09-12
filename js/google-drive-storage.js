class GoogleDriveStorage {
    static FOLDER_NAME = 'RPTracker';
    static FILE_NAME = 'rp_cards.json';

    static async initializeGoogleDrive() {
        // Charger l'API Google Drive
        await gapi.client.load('drive', 'v3');
        await gapi.client.init({
            apiKey: 'AIzaSyAV2kkWYAl7eefO5YGJJQvZAWO5kYJmVjA',
            clientId: '239325905492-j5a5skfekv9io2u77tj41aaki4nmc33o.apps.googleusercontent.com',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            scope: 'https://www.googleapis.com/auth/drive.file'
        });
    }

    static async saveCards(cards) {
        try {
            // Trouver ou créer le dossier RPTracker
            let folder = await this.findOrCreateFolder();
            
            // Trouver ou créer le fichier de cartes
            let file = await this.findFile(folder.id);
            const content = JSON.stringify(cards);

            if (file) {
                // Mettre à jour le fichier existant
                await gapi.client.drive.files.update({
                    fileId: file.id,
                    media: {
                        mimeType: 'application/json',
                        body: content
                    }
                });
            } else {
                // Créer un nouveau fichier
                await gapi.client.drive.files.create({
                    resource: {
                        name: this.FILE_NAME,
                        parents: [folder.id],
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
            const folder = await this.findOrCreateFolder();
            const file = await this.findFile(folder.id);
            
            if (!file) return [];

            const response = await gapi.client.drive.files.get({
                fileId: file.id,
                alt: 'media'
            });

            return JSON.parse(response.body);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            return [];
        }
    }

    static async findOrCreateFolder() {
        // Chercher le dossier existant
        const response = await gapi.client.drive.files.list({
            q: `name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder'`,
            spaces: 'drive'
        });

        if (response.result.files.length > 0) {
            return response.result.files[0];
        }

        // Créer un nouveau dossier
        const folderResponse = await gapi.client.drive.files.create({
            resource: {
                name: this.FOLDER_NAME,
                mimeType: 'application/vnd.google-apps.folder'
            }
        });

        return folderResponse.result;
    }

    static async findFile(folderId) {
        const response = await gapi.client.drive.files.list({
            q: `name='${this.FILE_NAME}' and '${folderId}' in parents`,
            spaces: 'drive'
        });

        return response.result.files[0];
    }
}