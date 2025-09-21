# 📝 RP Tracker v2.0

Une application moderne de suivi des tours de jeu de rôle, développée avec Electron.

## ✨ Fonctionnalités

### 🎯 Gestion des RP
- Ajout, modification et suppression de RP
- Suivi du temps écoulé en temps réel
- Indication visuelle des tours urgents
- Statuts colorés (à vous / à votre partenaire)

### 📊 Organisation et Tri
- Tri par partenaire (A-Z / Z-A)
- Tri par ancienneté (ancien → récent / récent → ancien)
- Filtrage par statut (tous / à vous / au partenaire)
- Mise à jour automatique des temps

### 💾 Gestion des Données
- Sauvegarde automatique locale
- Export/Import JSON
- Export CSV pour analyse
- Détection des doublons

### 🎨 Interface Moderne
- Design responsive et moderne
- Thème coloré avec dégradés
- Notifications en temps réel
- État vide informatif

### ⌨️ Raccourcis Clavier
- `Ctrl+N` : Nouveau RP
- `Ctrl+S` : Sauvegarder
- `Ctrl+O` : Ouvrir un fichier
- `Escape` : Annuler l'édition en cours

## 🚀 Installation et Utilisation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm

### Installation
```bash
# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm start

# Ou avec logging activé
npm run dev
```

### Construction
```bash
# Créer un package portable
npm run package

# Créer un installateur
npm run build
```

## 📁 Structure du Projet
```
rp-tracker/
├── main.js          # Processus principal Electron
├── renderer.js      # Logique de l'interface
├── index.html       # Structure HTML
├── style.css        # Styles modernes
├── package.json     # Configuration du projet
└── image/
    └── icones/
        └── plume.png # Icône de l'application
```

## 🎯 Indicateurs Visuels

### Temps écoulé
- **Vert** : Normal (< 12h)
- **Orange** : Attention (12h - 3j)
- **Rouge** : Urgent (> 7j)

### Statuts
- **🎯 Vert** : À votre partenaire de poster
- **✏️ Orange** : À vous de poster

## 🔄 Versions

### v2.0.0 (Actuelle)
- Interface moderne et responsive
- Système de notifications
- Raccourcis clavier
- Export CSV
- Indicateurs visuels améliorés
- Auto-refresh des temps
- Détection des doublons

### v1.0.0
- Fonctionnalités de base
- Interface simple

## 📝 Commandes Utiles

```bash
# Démarrer l'application
npm start

# Créer un exécutable Windows
npm run package

# Build avec electron-builder
npm run build
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.