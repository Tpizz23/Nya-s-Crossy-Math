// GameOverScene - Score display and replay options (Phase 4 implementation)

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOver' });
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0xfc466b, 0xfc466b, 0x3f5efb, 0x3f5efb, 1);
        graphics.fillRect(0, 0, width, height);

        const saveData = SaveManager.load();
        const oldHighScore = saveData.highScore;
        const oldCumulativeScore = saveData.cumulativeScore;

        const isNewHighScore = SaveManager.updateHighScore(this.finalScore);
        const newCumulativeScore = SaveManager.updateCumulativeScore(this.finalScore);

        const newlyUnlocked = [];
        CHARACTERS.forEach(character => {
            if (character.unlockScore > oldCumulativeScore &&
                character.unlockScore <= newCumulativeScore &&
                !saveData.unlockedCharacters.includes(character.id)) {
                newlyUnlocked.push(character);
                SaveManager.unlockCharacter(character.id);
            }
        });

        if (newlyUnlocked.length > 0) {
            soundManager.playUnlock();
        }

        this.add.text(width / 2, 60, 'Game Over!', {
            fontSize: '36px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 120, `Final Score: ${this.finalScore}`, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        let highScoreText = `High Score: ${Math.max(this.finalScore, oldHighScore)}`;
        if (isNewHighScore) highScoreText += ' 🎉 NEW!';
        this.add.text(width / 2, 160, highScoreText, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: isNewHighScore ? '#ffeb3b' : '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 195, `Lifetime Score: ${newCumulativeScore}`, {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            alpha: 0.8
        }).setOrigin(0.5);

        let yOffset = 250;
        if (newlyUnlocked.length > 0) {
            this.add.text(width / 2, yOffset, '🎊 New Characters Unlocked! 🎊', {
                fontSize: '20px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffeb3b',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            yOffset += 40;

            newlyUnlocked.forEach((character, index) => {
                const emoji = this.add.text(width / 2 - 80, yOffset + (index * 50), character.emoji, {
                    fontSize: '40px'
                }).setOrigin(0.5);

                this.tweens.add({
                    targets: emoji,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                this.add.text(width / 2 + 10, yOffset + (index * 50), `${character.name} Unlocked!`, {
                    fontSize: '18px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#ffffff',
                    fontStyle: 'bold'
                }).setOrigin(0, 0.5);
            });

            yOffset += newlyUnlocked.length * 50 + 20;
        } else {
            const nextCharacter = CHARACTERS.find(c => !saveData.unlockedCharacters.includes(c.id));
            if (nextCharacter) {
                const pointsNeeded = nextCharacter.unlockScore - newCumulativeScore;
                this.add.text(width / 2, yOffset, `Next unlock: ${nextCharacter.emoji} ${nextCharacter.name}`, {
                    fontSize: '16px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#ffffff',
                    alpha: 0.7
                }).setOrigin(0.5);
                yOffset += 25;
                this.add.text(width / 2, yOffset, `${pointsNeeded} more points needed`, {
                    fontSize: '14px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#ffffff',
                    alpha: 0.6
                }).setOrigin(0.5);
                yOffset += 40;
            }
        }

        const buttonY = Math.max(yOffset, height - 120);
        this.createButton(width / 2 - 90, buttonY, '🔄 Play Again', () => {
            this.scene.start('Settings');
        });
        this.createButton(width / 2 + 90, buttonY, '🏠 Menu', () => {
            this.scene.start('MainMenu');
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
