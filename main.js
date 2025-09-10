const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Créer la fenêtre du navigateur
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'icone/stylo-a-plume.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Supprimer la barre de menu par défaut
  mainWindow.setMenuBarVisibility(false);

  // Charger le fichier index.html de l'application
  mainWindow.loadFile('index.html');

  // Afficher la fenêtre une fois qu'elle est prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // mainWindow.webContents.openDevTools(); // Désactivé : ne plus ouvrir les DevTools automatiquement
  });
}

// Cette méthode sera appelée quand Electron aura fini
// de s'initialiser et sera prêt à créer des fenêtres de navigateur.
// Certaines APIs peuvent être utilisées uniquement après que cet événement se produit.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // Sur macOS, il est courant de recréer une fenêtre dans l'application quand
    // l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres ouvertes.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quitter quand toutes les fenêtres sont fermées, sauf sur macOS. Là, il est courant
// que les applications et leur barre de menu restent actives jusqu'à ce que l'utilisateur quitte
// explicitement avec Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Dans ce fichier, vous pouvez inclure le reste du code principal spécifique à votre application.
// Vous pouvez également le mettre dans des fichiers séparés et les importer ici.
