const { google } = require('googleapis');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://drelall.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      null,
      null
    );

    // Utiliser le token d'accès de l'utilisateur depuis les headers
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    auth.setCredentials({ access_token: token });
    const drive = google.drive({ version: 'v3', auth });

    // Proxy vers l'API Google Drive
    switch (req.method) {
      case 'GET':
        if (req.query.action === 'list') {
          const response = await drive.files.list(req.query);
          res.json(response.data);
        } else if (req.query.action === 'get') {
          const response = await drive.files.get({
            fileId: req.query.fileId,
            alt: req.query.alt || 'json'
          });
          res.json(response.data);
        }
        break;
        
      case 'POST':
        if (req.body.action === 'create') {
          const response = await drive.files.create(req.body.resource);
          res.json(response.data);
        }
        break;
        
      case 'PUT':
        if (req.body.action === 'update') {
          const response = await drive.files.update({
            fileId: req.body.fileId,
            resource: req.body.resource,
            media: req.body.media
          });
          res.json(response.data);
        }
        break;
        
      default:
        res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur API Drive:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};