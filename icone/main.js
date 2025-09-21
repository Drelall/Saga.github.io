const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Détection du mode développement
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

function createWindow() {
  // Créer la fenêtre du navigateur
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true // S'assurer que les DevTools sont toujours disponibles
    },
    icon: path.join(__dirname, 'icone/stylo-a-plume.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Créer le menu de l'application
  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Recharger',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Quitter',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Développement',
      submenu: [
        {
          label: 'Ouvrir les DevTools',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.openDevTools();
          }
        },
        {
          label: 'Fermer les DevTools',
          accelerator: 'Shift+F12',
          click: () => {
            mainWindow.webContents.closeDevTools();
          }
        },
        {
          label: 'Inspecter l\'élément',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: 'Mode plein écran',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Charger le fichier index.html de l'application
  mainWindow.loadFile('index.html');

  // Afficher la fenêtre une fois qu'elle est prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // En mode développement, ouvrir les DevTools et activer le rechargement
    if (isDev) {
      mainWindow.webContents.openDevTools();
      
      // Rechargement automatique quand les fichiers changent
      const chokidar = require('chokidar');
      const watcher = chokidar.watch(['./**/*.html', './**/*.css', './**/*.js'], {
        ignored: /node_modules/,
        ignoreInitial: true
      });
      
      watcher.on('change', () => {
        console.log('Fichier modifié, rechargement...');
        mainWindow.reload();
      });
    }
  });

  // Permettre le clic droit pour le menu contextuel
  mainWindow.webContents.on('context-menu', (event, params) => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Inspecter l\'élément',
        click: () => {
          mainWindow.webContents.inspectElement(params.x, params.y);
        }
      },
      { type: 'separator' },
      {
        label: 'Recharger',
        click: () => {
          mainWindow.reload();
        }
      }
    ]);
    contextMenu.popup();
  });

  return mainWindow;
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
