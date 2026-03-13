// CharacterSelectScene - Character selection grid (Phase 2 implementation)

class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelect' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Load save data
        const saveData = SaveManager.load();
        this.selectedCharacter = saveData.selectedCharacter;
        this.unlockedCharacters = saveData.unlockedCharacters;

        // Calculate total grid height
        const cols = 2;
        const rows = Math.ceil(CHARACTERS.length / cols);
        const cellHeight = 85;
        const gridStartY = 80;
        const totalGridHeight = rows * cellHeight;
        const worldHeight = Math.max(height, gridStartY + totalGridHeight + 80);

        // Background (extends to full scrollable height)
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x667eea, 0x667eea, 0x764ba2, 0x764ba2, 1);
        graphics.fillRect(0, 0, width, worldHeight);

        // Title
        this.add.text(width / 2, 40, 'Choose Your Character', {
            fontSize: '26px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);

        // Set camera bounds to allow scrolling
        this.cameras.main.setBounds(0, 0, width, worldHeight);

        // Create character grid (scrollable)
        this.createCharacterGrid();

        // Add scroll controls
        this.setupScrollControls();

        // Back button (fixed position)
        this.createButton(100, height - 50, '⬅️ Back', () => {
            this.scene.start('MainMenu');
        }).setScrollFactor(0);

        // Play button (fixed position)
        this.createButton(300, height - 50, '▶️ Play', () => {
            this.scene.start('Settings');
        }).setScrollFactor(0);
    }

    setupScrollControls() {
        // Mouse wheel scrolling
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            this.cameras.main.scrollY += deltaY * 0.5;
            this.clampCameraScroll();
        });

        // Touch drag scrolling
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                this.cameras.main.scrollY -= pointer.velocity.y / 10;
                this.clampCameraScroll();
            }
        });
    }

    clampCameraScroll() {
        const height = this.cameras.main.height;
        const maxScroll = this.cameras.main.getBounds().height - height;
        this.cameras.main.scrollY = Phaser.Math.Clamp(this.cameras.main.scrollY, 0, maxScroll);
    }

    createCharacterGrid() {
        const gridStartX = 40;
        const gridStartY = 80;
        const cellWidth = 160;
        const cellHeight = 85;
        const cols = 2;

        CHARACTERS.forEach((character, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = gridStartX + col * cellWidth;
            const y = gridStartY + row * cellHeight;

            this.createCharacterCell(character, x, y, cellWidth - 10, cellHeight - 10);
        });
    }

    createCharacterCell(character, x, y, width, height) {
        const isUnlocked = this.unlockedCharacters.includes(character.id);
        const isSelected = character.id === this.selectedCharacter;

        // Cell background
        const cellBg = this.add.graphics();

        if (isUnlocked) {
            // Unlocked - colorful background
            cellBg.fillStyle(isSelected ? 0x4CAF50 : 0x5c6bc0, 1);
        } else {
            // Locked - grey background
            cellBg.fillStyle(0x424242, 0.6);
        }

        cellBg.fillRoundedRect(x, y, width, height, 10);

        // Selected border
        if (isSelected && isUnlocked) {
            cellBg.lineStyle(4, 0xffeb3b, 1);
            cellBg.strokeRoundedRect(x, y, width, height, 10);
        }

        // Character emoji
        const emoji = this.add.text(x + width / 2, y + 25, character.emoji, {
            fontSize: '40px'
        }).setOrigin(0.5);

        // Character name
        const name = this.add.text(x + width / 2, y + 55, character.name, {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Lock info or unlock requirement
        if (!isUnlocked) {
            // Show lock icon and requirement
            this.add.text(x + width / 2, y + 75, `🔒 ${character.unlockScore} pts`, {
                fontSize: '11px',
                fontFamily: 'Arial, sans-serif',
                color: '#cccccc'
            }).setOrigin(0.5);

            // Make emoji and name semi-transparent
            emoji.setAlpha(0.4);
            name.setAlpha(0.5);
        }

        // Make unlocked characters clickable
        if (isUnlocked) {
            const hitArea = new Phaser.Geom.Rectangle(x, y, width, height);
            cellBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
            cellBg.on('pointerdown', () => {
                this.selectCharacter(character.id);
            });
        }
    }

    selectCharacter(characterId) {
        soundManager.playTap();
        // Save selection
        SaveManager.setSelectedCharacter(characterId);

        // Recreate the scene to show updated selection
        this.scene.restart();
    }

    createButton(x, y, text, callback) {
        const button = this.add.text(x, y, text, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            backgroundColor: '#4a90e2',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        button.setInteractive({ useHandCursor: true });

        button.on('pointerover', () => button.setScale(1.05));
        button.on('pointerout', () => button.setScale(1));
        button.on('pointerdown', () => button.setScale(0.95));
        button.on('pointerup', () => {
            button.setScale(1.05);
            soundManager.playTap();
            callback();
        });

        return button;
    }
}
