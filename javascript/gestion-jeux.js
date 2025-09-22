<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jeu du Tableau à Poudlard</title>
    <link rel="stylesheet" href="../style.css">
    <!-- Mode local - pas de dépendances externes -->
    <!-- Le style est déplacé dans style.css -->
  
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <!-- Zone cliquable sur le bloc de pierre -->
    <a href="../index.html" class="stone-block-link" title="Retour à l'accueil"></a>
    <!-- Zone de survol pour le tableau -->
    <div class="frame-hover-area" id="frameHoverArea"></div>
    
    <!-- Modal de fiche personnage -->
    <div id="characterModal" class="character-modal">
        <div class="character-sheet">
            <div class="character-header">
                <h2>Fiche de Personnage</h2>
                <button id="closeModal" class="close-btn">&times;</button>
            </div>

            <form id="characterForm">
                <!-- Informations de base -->
                <section class="form-section">
                    <h3>Informations de base</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="char-name">Nom du personnage :</label>
                            <input type="text" id="char-name" name="name" class="input-uniform" placeholder="...">
                        </div>
                        <div class="form-group">
                            <label for="char-level">Niveau :</label>
                            <input type="number" id="char-level" name="level" min="1" max="20" value="1">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="char-type">Type de personnage :</label>
                            <select id="char-type" name="type">
                                <option value="">Choisir un type</option>
                                <option value="agent">Agent du Gouvernement</option>
                                <option value="initie">Initié</option>
                                <option value="sorcier">Sorcier</option>
                                <option value="citoyen">Citoyen</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="char-class">Classe :</label>
                            <select id="char-class" name="class" disabled>
                                <option value="">Choisir d'abord un type</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="char-deity">Divinité :</label>
                            <select id="char-deity" name="deity" disabled>
                                <option value="">Choisir d'abord un type</option>
                            </select>
                        </div>
                    </div>
                </section>

                <!-- Boutons d'action -->
                <div class="action-buttons">
                    <div>
                        <button type="button" id="newCharacter" class="btn-secondary"> Nouveau</button>
                        <button type="button" id="loadCharacter" class="btn-secondary"> Charger</button>
                        <input type="file" id="fileInput" accept=".json" style="display: none;">
                    </div>
                    <div>
                        <button type="button" id="saveCharacter" class="btn-primary"> Sauvegarder</button>
                        <button type="button" id="playCharacter" class="btn-success"> Jouer</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Scripts en mode local -->
    <script src="../javascript/character-manager.js"></script>
    <script src="../javascript/jeux.js"></script>
</body>
</html>