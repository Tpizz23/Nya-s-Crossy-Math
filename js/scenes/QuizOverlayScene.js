// QuizOverlayScene - Math quiz popup overlay (Phase 5 implementation)

class QuizOverlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'QuizOverlay' });
    }

    init(data) {
        this.problem = data.problem || null;
        this.onComplete = data.onComplete || null;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

        const panelWidth = width - 40;
        const panelHeight = 280;
        const panelY = height / 2;

        this.panel = this.add.rectangle(width / 2, panelY, panelWidth, panelHeight, 0xffffff, 1);
        this.panel.setStrokeStyle(4, 0x4a90d9);

        this.problemText = this.add.text(width / 2, panelY - 80, this.problem.displayString, {
            fontSize: '36px',
            fontFamily: 'Arial, sans-serif',
            color: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.buttons = [];
        const buttonWidth = (panelWidth - 60) / 2;
        const buttonHeight = 60;
        const gapX = 20;
        const gapY = 15;
        const startY = panelY + 10;

        const leftX = width / 2 - gapX / 2 - buttonWidth / 2;
        const rightX = width / 2 + gapX / 2 + buttonWidth / 2;

        const positions = [
            { x: leftX, y: startY },
            { x: rightX, y: startY },
            { x: leftX, y: startY + buttonHeight + gapY },
            { x: rightX, y: startY + buttonHeight + gapY }
        ];

        this.problem.choices.forEach((choice, index) => {
            const pos = positions[index];

            const btn = this.add.rectangle(pos.x, pos.y, buttonWidth, buttonHeight, 0x4a90d9);
            btn.setInteractive({ useHandCursor: true });

            const btnText = this.add.text(pos.x, pos.y, choice.toString(), {
                fontSize: '28px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            btn.on('pointerover', () => btn.setFillStyle(0x357abd));
            btn.on('pointerout', () => btn.setFillStyle(0x4a90d9));
            btn.on('pointerdown', () => this.handleAnswer(choice));

            this.buttons.push({ bg: btn, text: btnText, value: choice });
        });

        this.instructionText = this.add.text(width / 2, panelY - 120, 'Solve to continue!', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#666666'
        }).setOrigin(0.5);
    }

    handleAnswer(selectedAnswer) {
        const isCorrect = selectedAnswer === this.problem.answer;

        this.buttons.forEach(btn => btn.bg.disableInteractive());

        if (isCorrect) {
            soundManager.playCorrect();
            this.buttons.forEach(btn => {
                if (btn.value === this.problem.answer) btn.bg.setFillStyle(0x4caf50);
            });
            this.instructionText.setText('Correct!');
            this.instructionText.setColor('#4caf50');
            this.time.delayedCall(800, () => this.startCountdown(true));
        } else {
            soundManager.playWrong();
            this.buttons.forEach(btn => {
                if (btn.value === selectedAnswer) btn.bg.setFillStyle(0xf44336);
                if (btn.value === this.problem.answer) btn.bg.setFillStyle(0x4caf50);
            });
            this.instructionText.setText('Try again next time!');
            this.instructionText.setColor('#f44336');
            this.time.delayedCall(1200, () => this.startCountdown(false));
        }
    }

    startCountdown(wasCorrect) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const panelElements = [this.panel, this.problemText, this.instructionText, ...this.buttons.map(b => b.bg), ...this.buttons.map(b => b.text)];
        this.tweens.add({ targets: panelElements, y: '-=600', duration: 400, ease: 'Power2' });
        this.tweens.add({ targets: this.overlay, fillAlpha: 0.3, duration: 400 });

        this.countdownText = this.add.text(width / 2, height / 2, '3', {
            fontSize: '120px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.readyText = this.add.text(width / 2, height / 2 - 100, 'Get Ready!', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        let count = 3;
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                count--;
                if (count > 0) {
                    this.countdownText.setText(count.toString());
                    this.tweens.add({ targets: this.countdownText, scale: 1.3, duration: 150, yoyo: true, ease: 'Power2' });
                } else {
                    this.countdownText.setText('GO!');
                    this.countdownText.setColor('#4caf50');
                    this.readyText.setVisible(false);
                    this.tweens.add({
                        targets: this.countdownText,
                        scale: 1.5,
                        duration: 200,
                        yoyo: true,
                        ease: 'Power2',
                        onComplete: () => this.closeQuiz(wasCorrect)
                    });
                }
            },
            repeat: 3
        });
    }

    closeQuiz(wasCorrect) {
        if (this.onComplete) this.onComplete(wasCorrect);
        this.scene.stop();
    }
}
