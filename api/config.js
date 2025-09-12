module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://drelall.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Endpoint simple pour obtenir la configuration Google (sans clé API)
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID,
    success: true
  });
};