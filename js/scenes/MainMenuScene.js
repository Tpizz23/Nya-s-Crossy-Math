// MainMenuScene - Title screen with Play and Characters buttons

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x4facfe, 0x4facfe, 0x00f2fe, 0x00f2fe, 1);
        graphics.fillRect(0, 0, width, height);

        // Title emoji
        this.add.text(width / 2, 120, '🧮', {
            fontSize: '80px'
        }).setOrigin(0.5);

        // Game title
        this.add.text(width / 2, 200, "Nya's Crossy Math", {
            fontSize: '36px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#2c3e50',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, 240, 'Hop & Learn!', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Load save data to show high score
        const saveData = SaveManager.load();
        if (saveData.highScore > 0) {
            this.add.text(width / 2, 280, `High Score: ${saveData.highScore}`, {
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffeb3b',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        // Play button
        this.createButton(width / 2, 340, '▶️ Play', () => {
            this.scene.start('Settings');
        });

        // Characters button
        this.createButton(width / 2, 420, '🎭 Characters', () => {
            this.scene.start('CharacterSelect');
        });

        // Options button
        this.createButton(width / 2, 500, '⚙️ Options', () => {
            this.scene.start('Options');
        });

        // Footer
        this.add.text(width / 2, height - 30, 'Made with 💜 for Nya', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            alpha: 0.7
        }).setOrigin(0.5);
    }

    createButton(x, y, text, callback) {
        const button = this.add.text(x, y, text, {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            backgroundColor: '#ff6b6b',
            padding: { x: 30, y: 15 },
            borderRadius: 10
        }).setOrigin(0.5);

        button.setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            button.setScale(1.05);
        });

        button.on('pointerout', () => {
            button.setScale(1);
        });

        button.on('pointerdown', () => {
            button.setScale(0.95);
        });

        button.on('pointerup', () => {
            button.setScale(1.05);
            soundManager.playTap();
            callback();
        });

        return button;
    }
}
