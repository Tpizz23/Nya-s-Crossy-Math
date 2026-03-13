// SettingsScene - Math type and difficulty selection (Phase 2 implementation)

class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Settings' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Load last played settings
        const saveData = SaveManager.load();
        this.selectedMathType = saveData.lastPlayedMathType || 'addition';
        this.selectedDifficulty = saveData.lastPlayedDifficulty || 'easy';
        this.characterId = saveData.selectedCharacter;

        // Background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0xf093fb, 0xf093fb, 0xf5576c, 0xf5576c, 1);
        graphics.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, 35, 'Choose Your Adventure', {
            fontSize: '26px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Math Type Section
        this.add.text(width / 2, 85, 'Math Type', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.createMathTypeButtons();

        // Difficulty Section
        this.add.text(width / 2, 285, 'Difficulty', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.createDifficultyButtons();

        // Navigation buttons
        this.createButton(100, height - 50, '⬅️ Back', () => {
            this.scene.start('MainMenu');
        });

        this.createButton(300, height - 50, '▶️ Start!', () => {
            // Save last played settings
            SaveManager.updateLastPlayed(this.selectedMathType, this.selectedDifficulty);

            // Start game with selected settings
            this.scene.start('Game', {
                mathType: this.selectedMathType,
                difficulty: this.selectedDifficulty,
                characterId: this.characterId
            });
        });
    }

    createMathTypeButtons() {
        const mathTypes = [
            { type: 'addition', label: 'Addition', emoji: '➕' },
            { type: 'subtraction', label: 'Subtraction', emoji: '➖' },
            { type: 'multiplication', label: 'Multiply', emoji: '✖️' },
            { type: 'division', label: 'Division', emoji: '➗' }
        ];

        const buttonWidth = 85;
        const buttonHeight = 70;
        const startX = 25;
        const startY = 120;

        mathTypes.forEach((item, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = startX + col * (buttonWidth + 10);
            const y = startY + row * (buttonHeight + 10);

            this.createSelectableButton(
                x, y, buttonWidth, buttonHeight,
                item.emoji, item.label, item.type,
                this.selectedMathType === item.type,
                (type) => {
                    this.selectedMathType = type;
                    SaveManager.updateLastPlayed(type, this.selectedDifficulty);
                    this.scene.restart();
                }
            );
        });
    }

    createDifficultyButtons() {
        const difficulties = [
            { diff: 'easy', label: 'Easy', emoji: '⭐' },
            { diff: 'medium', label: 'Medium', emoji: '⭐⭐' },
            { diff: 'hard', label: 'Hard', emoji: '⭐⭐⭐' },
            { diff: 'expert', label: 'Expert', emoji: '🔥' }
        ];

        const buttonWidth = 85;
        const buttonHeight = 70;
        const startX = 25;
        const startY = 320;

        difficulties.forEach((item, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = startX + col * (buttonWidth + 10);
            const y = startY + row * (buttonHeight + 10);

            this.createSelectableButton(
                x, y, buttonWidth, buttonHeight,
                item.emoji, item.label, item.diff,
                this.selectedDifficulty === item.diff,
                (diff) => {
                    this.selectedDifficulty = diff;
                    SaveManager.updateLastPlayed(this.selectedMathType, diff);
                    this.scene.restart();
                }
            );
        });
    }

    createSelectableButton(x, y, width, height, emoji, label, value, isSelected, callback) {
        const bg = this.add.graphics();
        bg.setPosition(x, y);

        // Background color based on selection
        if (isSelected) {
            bg.fillStyle(0x4CAF50, 1); // Green when selected
            bg.lineStyle(3, 0xffeb3b, 1); // Yellow border
        } else {
            bg.fillStyle(0x5c6bc0, 0.8); // Purple when not selected
        }

        // Draw at (0, 0) relative to graphics object position
        bg.fillRoundedRect(0, 0, width, height, 8);

        if (isSelected) {
            bg.strokeRoundedRect(0, 0, width, height, 8);
        }

        // Emoji
        this.add.text(x + width / 2, y + 20, emoji, {
            fontSize: '24px'
        }).setOrigin(0.5);

        // Label
        this.add.text(x + width / 2, y + 50, label, {
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create interactive hit area (relative to graphics object at 0,0)
        const hitArea = new Phaser.Geom.Rectangle(0, 0, width, height);
        bg.setInteractive({
            hitArea: hitArea,
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        bg.on('pointerdown', () => {
            soundManager.playTap();
            callback(value);
        });
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
