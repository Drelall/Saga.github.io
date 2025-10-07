class CharacterSheetManager {
    constructor() {
        this.character = {
            name: '',
            type: '',
            class: '',
            deity: ''
        };

        this.universe = {
            sorcier: {
                name: 'Sorcier',
                classes: [
                    { value: 'enchanteur', name: 'Enchanteur' }
                ],
                deities: [
                    { value: 'dragons', name: 'Les Dragons' }
                ]
            }
        };

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const modal = document.getElementById('characterModal');
        const closeBtn = document.getElementById('closeModal');
        const frameHoverArea = document.getElementById('frameHoverArea');
        const typeSelect = document.getElementById('char-type');
        const playBtn = document.getElementById('playCharacter');

        frameHoverArea.addEventListener('click', () => {
            console.log('Zone tableau cliquée, ouverture fiche personnage');
            this.openModal();
        });

        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeModal();
            }
        });

        typeSelect.addEventListener('change', () => this.updateClassOptions());

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.updateCharacterFromForm();
                if (typeof window.sagaStart === 'function') {
                    window.sagaStart(this.character, document.getElementById('characterModal'));
                } else {
                    // Fallback : affiche un message dans la modal en conservant la structure
                    const modal = document.getElementById('characterModal');
                    modal.innerHTML = `
                        <div class="character-sheet" style="background-image: url('../images/illustration/lemur.png'); background-size: cover; background-position: center; background-repeat: no-repeat;">
                            <div class="character-header" style="border: none;">
                                <button id="closeModal" class="close-btn">&times;</button>
                            </div>
                            <div style="padding: 30px; text-align: center; color: #f5deb3; background: rgba(0, 0, 0, 0.7); border-radius: 10px; margin: 20px;">
                                <h1 style="color: #28a745; margin-bottom: 30px;">Bienvenue ${this.character.name ? this.character.name : 'Aventurier'}</h1>
                                <div style="background: rgba(34, 109, 84, 0.4); border: 1px solid #226d54; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                    <p><strong>Type :</strong> ${this.character.type || '-'}</p>
                                    <p><strong>Classe :</strong> ${this.character.class || '-'}</p>
                                    <p><strong>Divinité :</strong> ${this.character.deity || '-'}</p>
                                </div>
                                <div style="margin-top: 30px;">
                                    <button type="button" id="backToCharacter" class="btn-secondary">Retour à la fiche</button>
                                    <button type="button" id="startGame" class="btn-primary">Commencer l'aventure</button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Réattacher les événements pour les nouveaux boutons
                    document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
                    document.getElementById('backToCharacter').addEventListener('click', () => {
                        // Recharger la page pour revenir à la fiche personnage
                        location.reload();
                    });
                    document.getElementById('startGame').addEventListener('click', () => {
                        // Ici vous pouvez ajouter la logique pour démarrer le jeu
                        alert('Le jeu va bientôt commencer !');
                    });
                }
            });
        }
    }

    openModal() {
        const modal = document.getElementById('characterModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('characterModal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    updateCharacterFromForm() {
        const form = document.getElementById('characterForm');
        const formData = new FormData(form);
        this.character.name = formData.get('name') || '';
        this.character.type = formData.get('type') || '';
        this.character.class = formData.get('class') || '';
        this.character.deity = formData.get('deity') || '';
    }

    updateClassOptions() {
        const typeSelect = document.getElementById('char-type');
        const classSelect = document.getElementById('char-class');
        const deitySelect = document.getElementById('char-deity');
        const selectedType = typeSelect.value;

        classSelect.innerHTML = '';
        deitySelect.innerHTML = '';

        if (selectedType && this.universe[selectedType]) {
            classSelect.disabled = false;
            deitySelect.disabled = false;
            this.universe[selectedType].classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.value;
                option.textContent = cls.name;
                classSelect.appendChild(option);
            });
            this.universe[selectedType].deities.forEach(deity => {
                const option = document.createElement('option');
                option.value = deity.value;
                option.textContent = deity.name;
                deitySelect.appendChild(option);
            });
        } else {
            classSelect.disabled = true;
            deitySelect.disabled = true;
            classSelect.innerHTML = '<option value="">Choisir d\'abord un type</option>';
            deitySelect.innerHTML = '<option value="">Choisir d\'abord un type</option>';
        }
    }
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    window.characterSheetManager = new CharacterSheetManager();
});