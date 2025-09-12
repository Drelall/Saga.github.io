const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['https://drelall.github.io', 'http://localhost:3000']
}));
app.use(express.json());

// Endpoint pour obtenir la configuration Google (sans exposer la clé API)
app.get('/api/google-config', (req, res) => {
    res.json({
        clientId: process.env.GOOGLE_CLIENT_ID
    });
});

// Endpoint proxy pour les requêtes Google Drive
app.post('/api/drive/*', async (req, res) => {
    try {
        const { google } = require('googleapis');
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_id: process.env.GOOGLE_CLIENT_ID,
                // Utiliser le token de l'utilisateur fourni dans les headers
            },
            scopes: ['https://www.googleapis.com/auth/drive.file']
        });

        // Proxy vers Google Drive API avec la clé serveur
        const driveUrl = `https://www.googleapis.com/drive/v3${req.path.replace('/api/drive', '')}`;
        
        const response = await fetch(driveUrl, {
            method: req.method,
            headers: {
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Erreur proxy Drive:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur backend démarré sur le port ${PORT}`);
});