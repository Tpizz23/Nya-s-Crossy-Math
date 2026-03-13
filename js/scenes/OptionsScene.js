// OptionsScene - Game options and settings

class OptionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Options' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x667eea, 0x667eea, 0x764ba2, 0x764ba2, 1);
        graphics.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, 60, '⚙️ Options', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Options panel background
        const panelY = 180;
        const panelHeight = 300;
        const panel = this.add.graphics();
        panel.fillStyle(0xffffff, 0.1);
        panel.fillRoundedRect(20, panelY - 20, width - 40, panelHeight, 10);

        // Section: Character Progression
        this.add.text(width / 2, panelY + 20, 'Character Progression', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, panelY + 55, 'Reset all unlocked characters\n(keeps your scores)', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);

        // Reset Characters button
        this.createButton(width / 2, panelY + 120, '🔒 Reset Characters', () => {
            this.showConfirmation(
                'Reset Character Unlocks?',
                'All characters except Froggy will be locked.\nYour scores will be kept.',
                () => {
                    SaveManager.resetCharacterProgression();
                    soundManager.playCorrect();
                    this.showMessage('Characters Reset!');
                }
            );
        }, '#e74c3c');

        // Section: All Data
        this.add.text(width / 2, panelY + 180, 'All Data', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, panelY + 215, 'Reset everything to default', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#cccccc'
        }).setOrigin(0.5);

        // Reset All button
        this.createButton(width / 2, panelY + 260, '⚠️ Reset All Data', () => {
            this.showConfirmation(
                'Reset Everything?',
                'This will delete all progress:\n• Characters\n• Scores\n• Settings',
                () => {
                    SaveManager.resetAllData();
                    soundManager.playCorrect();
                    this.showMessage('All Data Reset!');
                }
            );
        }, '#c0392b');

        // Back button
        this.createButton(width / 2, height - 60, '⬅️ Back to Menu', () => {
            this.scene.start('MainMenu');
        }, '#4a90e2');
    }

    createButton(x, y, text, callback, color = '#4a90e2') {
        const button = this.add.text(x, y, text, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            backgroundColor: color,
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

    showConfirmation(title, message, onConfirm) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setDepth(100);
        overlay.setInteractive();

        const panelWidth = width - 40;
        const panelHeight = 240;
        const panel = this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0xffffff, 1);
        panel.setStrokeStyle(4, 0xe74c3c);
        panel.setDepth(101);

        const titleText = this.add.text(width / 2, height / 2 - 80, title, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        titleText.setDepth(102);

        const messageText = this.add.text(width / 2, height / 2 - 20, message, {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#666666',
            align: 'center'
        }).setOrigin(0.5);
        messageText.setDepth(102);

        const confirmBtn = this.add.text(width / 2 - 70, height / 2 + 70, '✓ Yes', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            backgroundColor: '#e74c3c',
            padding: { x: 25, y: 10 }
        }).setOrigin(0.5);
        confirmBtn.setDepth(102);
        confirmBtn.setInteractive({ useHandCursor: true });

        confirmBtn.on('pointerover', () => confirmBtn.setScale(1.05));
        confirmBtn.on('pointerout', () => confirmBtn.setScale(1));
        confirmBtn.on('pointerup', () => {
            soundManager.playTap();
            onConfirm();
            overlay.destroy();
            panel.destroy();
            titleText.destroy();
            messageText.destroy();
            confirmBtn.destroy();
            cancelBtn.destroy();
        });

        const cancelBtn = this.add.text(width / 2 + 70, height / 2 + 70, '✗ No', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            backgroundColor: '#95a5a6',
            padding: { x: 25, y: 10 }
        }).setOrigin(0.5);
        cancelBtn.setDepth(102);
        cancelBtn.setInteractive({ useHandCursor: true });

        cancelBtn.on('pointerover', () => cancelBtn.setScale(1.05));
        cancelBtn.on('pointerout', () => cancelBtn.setScale(1));
        cancelBtn.on('pointerup', () => {
            soundManager.playTap();
            overlay.destroy();
            panel.destroy();
            titleText.destroy();
            messageText.destroy();
            confirmBtn.destroy();
            cancelBtn.destroy();
        });
    }

    showMessage(text) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const message = this.add.text(width / 2, height / 2, text, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            backgroundColor: '#4caf50',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5);
        message.setDepth(200);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: height / 2 - 50,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                message.destroy();
            }
        });
    }
}
