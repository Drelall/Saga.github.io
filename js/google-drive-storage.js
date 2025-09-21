import { getDriveAccessToken } from './google-auth.js';

class GoogleDriveStorage {
    constructor() {
        this.fileName = 'rp-tracker-data.json';
        this.fileId = null;
        this.initialized = false;
    }

    async ensureGapiLoaded() {
        if (window.gapi && window.gapi.client) return;
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('client', { callback: resolve, onerror: reject });
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async init() {
        if (this.initialized) return;
        await this.ensureGapiLoaded();
        await gapi.client.init({
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        });
        this.initialized = true;
        console.log('✅ gapi client initialisé');
    }

    getAuthHeaders() {
        const token = getDriveAccessToken();
        if (!token) throw new Error('Pas de jeton Drive');
        return { Authorization: 'Bearer ' + token };
    }

    async locateFile() {
        if (this.fileId) return this.fileId;
        try {
            const res = await gapi.client.drive.files.list({
                q: `name='${this.fileName}' and trashed=false`,
                spaces: 'appDataFolder',
                fields: 'files(id,name)'
            });
            if (res.result.files && res.result.files.length > 0) {
                this.fileId = res.result.files[0].id;
                console.log('📄 Fichier trouvé:', this.fileId);
            } else {
                console.log('ℹ️ Aucun fichier existant');
            }
        } catch (e) {
            console.error('Erreur recherche fichier:', e);
        }
        return this.fileId;
    }

    async saveData(data) {
        await this.init();
        await this.locateFile();
        const content = JSON.stringify(data, null, 2);
        const boundary = '-------rp_boundary_' + Date.now();
        const metadata = {
            name: this.fileName,
            parents: ['appDataFolder']
        };
        const body =
            `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
            JSON.stringify(metadata) + '\r\n' +
            `--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
            content + '\r\n' +
            `--${boundary}--`;

        const path = this.fileId
            ? `https://www.googleapis.com/upload/drive/v3/files/${this.fileId}?uploadType=multipart`
            : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

        const method = this.fileId ? 'PATCH' : 'POST';

        const resp = await fetch(path, {
            method,
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'multipart/related; boundary=' + boundary
            },
            body
        });

        if (!resp.ok) throw new Error('Échec sauvegarde Drive: ' + resp.status);
        const json = await resp.json();
        if (!this.fileId) this.fileId = json.id;
        console.log('💾 Sauvegarde OK Drive');
    }

    async loadData() {
        await this.init();
        await this.locateFile();
        if (!this.fileId) {
            return [];
        }
        const resp = await fetch(
            `https://www.googleapis.com/drive/v3/files/${this.fileId}?alt=media`,
            { headers: this.getAuthHeaders() }
        );
        if (resp.status === 401) {
            throw new Error('Jeton expiré');
        }
        if (resp.status === 404) {
            this.fileId = null;
            return [];
        }
        if (!resp.ok) {
            console.warn('Lecture échouée, statut:', resp.status);
            return [];
        }
        try {
            const text = await resp.text();
            if (!text.trim()) return [];
            const data = JSON.parse(text);
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }
}

export default new GoogleDriveStorage();