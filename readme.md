# 📚 Saga - Portfolio & Jeu de Rôle

Bienvenue dans **Saga**, un portfolio narratif qui combine écriture créative et jeu de rôle interactif dans un univers mystique et contemporain.

## 🌟 Vue d'ensemble

Ce projet propose une expérience unique mêlant :
- **Portfolio littéraire** : Articles et récits dans différents univers
- **Créateur de personnages RPG** : Système complet de fiches personnages
- **Moteur de jeu de rôle** : Interface interactive pour vivre des aventures

## 🏗️ Structure du Projet

```
Portfolio.github.io-main/
├── index.html                 # Page d'accueil avec carousel
├── style.css                  # Styles principaux
├── jeux/
│   └── jeux.html              # Interface de jeu RPG
├── lesarticles/               # Articles divers
├── lesrecits/                 # Nouvelles et fanfictions
├── javascript/
│   ├── jeux.js                # Logique du jeu principal
│   ├── character-manager.js   # Gestion des personnages
│   └── auth-manager.js        # Système d'authentification
├── carousel/                  # Scripts du carousel
└── images/                    # Ressources visuelles
```

## 🎮 Système de Jeu de Rôle

### 🎭 Création de Personnages

Le système propose **4 types de personnages** dans un univers mystique contemporain :

#### 1. 🕴️ **Agents du Gouvernement**
- **Classes** : Soldat, Archéologue, Médecin, Ingénieur
- **Divinités** : Apophis, Thor
- **Rôle** : Représentants de l'ordre établi, enquêteurs officiels

#### 2. 🔮 **Initiés**
- **Classes** : Exorciste, Tueur de Monstre, Chasseur de Fantôme
- **Divinité** : Magicien d'Oz
- **Rôle** : Découvreurs des mystères cachés du monde

#### 3. 🧙 **Sorciers**
- **Classes** : Nécromancien, Druide, Chaman, Alchimiste, Enchanteur, Occultiste, Élémentaliste, Thaumaturge, Démonologue
- **Divinités** : Le Phénix, Les Dragons, Les Élémentaires, L'Obscurium
- **Rôle** : Maîtres des arts magiques et forces surnaturelles

#### 4. 👤 **Citoyens**
- **Classes** : Hacker, Lowtech
- **Divinités** : Le Lapin Blanc, Le Grand Architecte
- **Rôle** : Personnes ordinaires dans des événements extraordinaires

### 📊 Caractéristiques

- **6 Stats principales** : Force, Dextérité, Constitution, Intelligence, Sagesse, Charisme
- **Système de dés** : 4d6 (garder les 3 meilleurs)
- **Modificateurs automatiques** : Calcul D&D (stat-10)/2
- **Compétences personnalisables**
- **Équipement dynamique**
- **Historique narratif**

### 💾 Fonctionnalités

- ✅ **Sauvegarde/Chargement** : Format JSON avec métadonnées
- ✅ **Validation des données** : Vérification de cohérence
- ✅ **Interface responsive** : Compatible mobile/desktop
- ✅ **Sélecteurs en cascade** : Type → Classes → Divinités

## 🚀 Roadmap - Moteur de Jeu

### 🎯 Phase 1 : Moteur de Base *(En développement)*

#### **Architecture Système**
```javascript
const gameEngine = {
    scenarios: {
        intro: { /* Scénario d'introduction */ },
        chapters: { /* Chapitres principaux */ },
        sideQuests: { /* Quêtes secondaires */ }
    },
    gameState: {
        currentLocation: "starting_point",
        character: characterData,
        inventory: [],
        flags: {}, // Événements déclenchés
        reputation: {}
    }
}
```

#### **Mécanismes de Liberté**

**🗺️ Navigation Libre**
- Interface avec **carte interactive**
- Lieux déblocables progressivement
- Actions contextuelles par zone

**💬 Dialogues Branchés**
- Choix multiples avec conséquences
- Réponses adaptées au type de personnage
- Système de réputation/relations

**🎲 Jets de Dés Automatiques**
- Utilisation des stats du personnage
- Tests de difficulté variables
- Feedback visuel des résultats

### 🎨 Phase 2 : Interface Interactive

#### **Zones de Jeu**
```html
<div id="gameInterface">
    <div id="storyPanel">      <!-- Narration MJ --></div>
    <div id="choicesPanel">    <!-- Boutons d'action --></div>
    <div id="mapPanel">        <!-- Carte/navigation --></div>
    <div id="statusPanel">     <!-- Stats/inventaire --></div>
</div>
```

#### **Système de Lieux**
```javascript
const locations = {
    taverne: {
        name: "La Taverne du Dragon Noir",
        description: "Un lieu de rencontre mystérieux...",
        actions: ["parler_tavernier", "ecouter_rumeurs", "chercher_info"],
        npcs: ["tavernier", "client_mystérieux"],
        exits: ["rue_principale", "quartier_pauvre"],
        events: [] // Événements spéciaux
    }
}
```

### 🎭 Phase 3 : Système Narratif

#### **Structure des Choix**
- **Actions contextuelles** selon la classe/type
- **Déblocages progressifs** par les stats
- **Conséquences persistantes** dans l'univers
- **Events aléatoires** selon le background

#### **Système de Progression**
- Expérience et montée de niveau
- Déblocage de nouvelles compétences
- Évolution des relations avec les PNJ
- Impact sur l'histoire globale

### 🎪 Phase 4 : Contenu & Scénarios

#### **Scénarios par Type**
- **Agents** : Enquêtes gouvernementales, conspirations
- **Initiés** : Mystères paranormaux, révélations
- **Sorciers** : Rituels, guerre magique, entités
- **Citoyens** : Survie, adaptation, découvertes

#### **Mécaniques Avancées**
- Combat tactique au tour par tour
- Système de crafting/alchimie
- Invocations et sorts
- Hacking et technologie

## 🛠️ Installation & Utilisation

### **Prérequis**
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- JavaScript activé
- Connexion internet (pour certaines fonctionnalités)

### **Lancement**
1. Ouvrir `index.html` dans un navigateur
2. Naviguer vers la section "Jeux"
3. Cliquer sur le vortex du tableau pour créer un personnage
4. Suivre les étapes de création
5. *(Futur)* Cliquer sur "Commencer l'aventure"

### **Sauvegarde**
- Les fiches personnages sont sauvegardées en JSON
- Compatible avec tous les navigateurs
- Import/Export de personnages entre sessions

## 🎨 Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Animations** : CSS Animations, Canvas API
- **Stockage** : LocalStorage, File API
- **Architecture** : Classes ES6, Modules
- **Responsive** : CSS Grid, Flexbox

## 🚧 Statut Actuel

- ✅ **Portfolio** : Fonctionnel et déployé
- ✅ **Créateur de personnages** : Complet et opérationnel
- 🔄 **Moteur de jeu** : En conception
- ⏳ **Scénarios** : En écriture
- ⏳ **Combat** : À développer

## 🤝 Contribution

Ce projet est personnel mais ouvert aux suggestions :
- 📧 Contact : `jacques.bobbio@outlook.fr`
- 💡 Idées de scénarios bienvenues
- 🐛 Signalement de bugs apprécié

## 📝 Licence

Projet personnel - Tous droits réservés
Les textes et scénarios sont sous copyright de l'auteur.

---

*"Chaque personnage a une histoire, chaque choix forge un destin."* ✨
