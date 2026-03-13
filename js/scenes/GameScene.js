// GameScene - Main game loop (Phase 4 implementation)

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    init(data) {
        this.mathType = data.mathType || 'addition';
        this.difficulty = data.difficulty || 'easy';
        this.characterId = data.characterId || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.ROW_HEIGHT = 60;
        this.COLS = 7;
        this.COL_WIDTH = width / this.COLS;
        this.scrollSpeed = 55;

        this.playerCol = 3;
        this.playerRow = Math.floor((height - 120) / this.ROW_HEIGHT);
        this.score = 0;
        this.rowsCrossed = 0;
        this.lastScoredY = height - 120;
        this.lives = 3;

        this.lastRowWasDangerous = false;
        this.grassRowsSinceDanger = 0;

        const bg = this.add.graphics();
        bg.fillStyle(0x87CEEB, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(-10);

        this.rows = [];
        this.rowCounter = 0;

        const numRows = Math.ceil(height / this.ROW_HEIGHT) + 2;
        for (let i = 0; i < numRows; i++) {
            this.spawnRow(i * this.ROW_HEIGHT, 'grass');
        }

        const character = CHARACTERS[this.characterId];

        this.player = this.add.text(
            this.playerCol * this.COL_WIDTH + this.COL_WIDTH / 2,
            this.playerRow * this.ROW_HEIGHT + this.ROW_HEIGHT / 2,
            character.emoji,
            { fontSize: '40px' }
        ).setOrigin(0.5);
        this.player.setDepth(10);

        this.livesContainer = this.add.container(10, 10);
        this.livesContainer.setDepth(100);
        this.heartEmojis = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.text(i * 35, 0, '❤️', { fontSize: '28px' });
            this.heartEmojis.push(heart);
            this.livesContainer.add(heart);
        }

        this.scoreText = this.add.text(width - 10, 10, 'Score: 0', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0);
        this.scoreText.setDepth(100);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        this.canMoveUp = true;
        this.canMoveLeft = true;
        this.canMoveRight = true;

        this.isInWater = false;

        this.mathGenerator = new MathProblemGenerator(this.mathType, this.difficulty);
        this.quizActive = false;
        this.quizCooldown = false;
        this.rowsForNextNudge = 5;

        this.dangerousRowsSpawned = 0;
        this.speedMultiplier = 1.0;
        this.baseScrollSpeed = this.scrollSpeed;
    }

    getNextRowType() {
        const minGrassRows = 2;

        if (this.lastRowWasDangerous) {
            this.lastRowWasDangerous = false;
            this.grassRowsSinceDanger = 1;
            return 'grass';
        }

        if (this.grassRowsSinceDanger < minGrassRows) {
            this.grassRowsSinceDanger++;
            return 'grass';
        }

        const roll = Phaser.Math.Between(0, 2);

        if (roll === 0) {
            this.grassRowsSinceDanger++;
            return 'grass';
        } else {
            this.lastRowWasDangerous = true;
            this.grassRowsSinceDanger = 0;

            this.dangerousRowsSpawned++;
            if (this.dangerousRowsSpawned % 3 === 0) {
                this.speedMultiplier += 0.15;
                this.scrollSpeed = this.baseScrollSpeed * this.speedMultiplier;
            }

            const dangerTypes = ['road', 'water', 'traintrack'];
            return Phaser.Utils.Array.GetRandom(dangerTypes);
        }
    }

    spawnRow(yPosition, rowType = null) {
        if (rowType === null) rowType = this.getNextRowType();

        let rowBg;
        const decorations = [];
        const obstacles = [];
        const width = this.cameras.main.width;

        if (rowType === 'grass') {
            rowBg = this.add.rectangle(width / 2, yPosition + this.ROW_HEIGHT / 2, width, this.ROW_HEIGHT, 0x7CFC00);
            rowBg.setDepth(0);

            const numDecorations = Phaser.Math.Between(2, 3);
            for (let i = 0; i < numDecorations; i++) {
                const x = Phaser.Math.Between(20, width - 20);
                const decoration = this.add.text(x, yPosition + this.ROW_HEIGHT / 2, '🌿', { fontSize: '24px' }).setOrigin(0.5);
                decorations.push(decoration);
            }
        } else if (rowType === 'road') {
            rowBg = this.add.rectangle(width / 2, yPosition + this.ROW_HEIGHT / 2, width, this.ROW_HEIGHT, 0x4a4a4a);
            rowBg.setDepth(0);

            const numCars = 2;
            const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
            const baseSpeed = Phaser.Math.Between(50, 90);
            const speed = baseSpeed * this.speedMultiplier * direction;

            const spacing = width / numCars;
            for (let i = 0; i < numCars; i++) {
                const carEmoji = Phaser.Utils.Array.GetRandom(['🚗', '🚙']);
                const startX = (i * spacing) + Phaser.Math.Between(0, spacing * 0.3);
                const car = this.add.text(startX, yPosition + this.ROW_HEIGHT / 2, carEmoji, { fontSize: '36px' }).setOrigin(0.5);
                obstacles.push({ obj: car, speed: speed, type: 'car' });
            }
        } else if (rowType === 'water') {
            rowBg = this.add.rectangle(width / 2, yPosition + this.ROW_HEIGHT / 2, width, this.ROW_HEIGHT, 0x4682B4);
            rowBg.setDepth(0);

            const numLogs = 3;
            const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
            const baseSpeed = Phaser.Math.Between(35, 55);
            const speed = baseSpeed * this.speedMultiplier * direction;

            const spacing = width / numLogs;
            for (let i = 0; i < numLogs; i++) {
                const startX = (i * spacing) + (spacing / 2);
                const log = this.add.text(startX, yPosition + this.ROW_HEIGHT / 2, '🪵🪵', { fontSize: '32px' }).setOrigin(0.5);
                obstacles.push({ obj: log, speed: speed, type: 'log' });
            }
        } else if (rowType === 'traintrack') {
            rowBg = this.add.rectangle(width / 2, yPosition + this.ROW_HEIGHT / 2, width, this.ROW_HEIGHT, 0x8b7355);
            rowBg.setDepth(0);

            for (let i = 0; i < 5; i++) {
                const x = (i / 4) * width;
                const track = this.add.text(x, yPosition + this.ROW_HEIGHT / 2, '🛤️', { fontSize: '24px' }).setOrigin(0.5);
                track.setAlpha(0.5);
                decorations.push(track);
            }

            const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
            const baseSpeed = Phaser.Math.Between(120, 160);
            const speed = baseSpeed * this.speedMultiplier * direction;
            const startX = direction < 0 ? width + 50 : -50;
            const train = this.add.text(startX, yPosition + this.ROW_HEIGHT / 2, '🚂', { fontSize: '48px' }).setOrigin(0.5);
            obstacles.push({ obj: train, speed: speed, type: 'train' });
        }

        this.rows.push({
            bg: rowBg,
            decorations: decorations,
            obstacles: obstacles,
            y: yPosition,
            rowNumber: this.rowCounter,
            type: rowType
        });

        this.rowCounter++;
    }

    update(time, delta) {
        const scrollAmount = (this.scrollSpeed * delta) / 1000;

        this.rows.forEach(row => {
            row.y += scrollAmount;
            row.bg.y += scrollAmount;
            row.decorations.forEach(dec => { dec.y += scrollAmount; });

            row.obstacles.forEach(obstacle => {
                obstacle.obj.x += (obstacle.speed * delta) / 1000;
                obstacle.obj.y += scrollAmount;

                if (obstacle.speed > 0 && obstacle.obj.x > this.cameras.main.width + 50) {
                    obstacle.obj.x = -50;
                } else if (obstacle.speed < 0 && obstacle.obj.x < -50) {
                    obstacle.obj.x = this.cameras.main.width + 50;
                }
            });
        });

        this.rows = this.rows.filter(row => {
            if (row.y > this.cameras.main.height + this.ROW_HEIGHT) {
                row.bg.destroy();
                row.decorations.forEach(dec => dec.destroy());
                row.obstacles.forEach(obs => obs.obj.destroy());
                return false;
            }
            return true;
        });

        let topRow = null;
        let minY = Infinity;
        this.rows.forEach(row => {
            if (row.y < minY) { minY = row.y; topRow = row; }
        });

        if (topRow && topRow.y > 0) {
            this.spawnRow(topRow.y - this.ROW_HEIGHT);
        }

        this.player.y += scrollAmount;

        this.checkCollisions();

        const upPressed = this.cursors.up.isDown || this.keys.w.isDown;
        const leftPressed = this.cursors.left.isDown || this.keys.a.isDown;
        const rightPressed = this.cursors.right.isDown || this.keys.d.isDown;

        if (upPressed && this.canMoveUp) { this.canMoveUp = false; this.movePlayerForward(); }
        if (!upPressed) this.canMoveUp = true;

        if (leftPressed && this.canMoveLeft) { this.canMoveLeft = false; this.movePlayerLeft(); }
        if (!leftPressed) this.canMoveLeft = true;

        if (rightPressed && this.canMoveRight) { this.canMoveRight = false; this.movePlayerRight(); }
        if (!rightPressed) this.canMoveRight = true;

        if (this.player.y > this.cameras.main.height) this.gameOver();
    }

    checkCollisions() {
        const playerRowIndex = this.rows.findIndex(row => {
            return this.player.y >= row.y && this.player.y < row.y + this.ROW_HEIGHT;
        });

        if (playerRowIndex === -1) return;

        const currentRow = this.rows[playerRowIndex];

        if (currentRow.type === 'water') {
            let onLog = false;

            currentRow.obstacles.forEach(obstacle => {
                if (obstacle.type === 'log') {
                    const distance = Math.abs(this.player.x - obstacle.obj.x);
                    if (distance < 40) {
                        onLog = true;
                        this.player.x += (obstacle.speed * this.game.loop.delta) / 1000;

                        if (this.player.x < this.COL_WIDTH / 2) {
                            this.player.x = this.COL_WIDTH / 2;
                        } else if (this.player.x > this.cameras.main.width - this.COL_WIDTH / 2) {
                            this.player.x = this.cameras.main.width - this.COL_WIDTH / 2;
                        }
                    }
                }
            });

            if (!onLog && !this.isInWater) {
                this.isInWater = true;
                this.triggerQuiz();
            } else if (onLog && this.isInWater) {
                this.isInWater = false;
            }
        } else {
            this.isInWater = false;
        }

        if (currentRow.type === 'road' || currentRow.type === 'traintrack') {
            currentRow.obstacles.forEach(obstacle => {
                if (obstacle.type === 'car' || obstacle.type === 'train') {
                    const distance = Math.abs(this.player.x - obstacle.obj.x);
                    if (distance < 35) this.triggerQuiz();
                }
            });
        }
    }

    triggerQuiz() {
        if (this.quizActive || this.quizCooldown || this.lives <= 0) return;

        this.quizActive = true;
        this.scene.pause();

        const problem = this.mathGenerator.generate();
        this.scene.launch('QuizOverlay', {
            problem: problem,
            onComplete: (wasCorrect) => { this.handleQuizResult(wasCorrect); }
        });
    }

    handleQuizResult(wasCorrect) {
        this.quizActive = false;
        this.isInWater = false;

        this.quizCooldown = true;
        this.time.delayedCall(1000, () => { this.quizCooldown = false; });

        this.scene.resume();

        if (!wasCorrect) {
            this.loseLife();
        } else {
            this.score += 25;
            this.scoreText.setText(`Score: ${this.score}`);

            const maxSafeY = this.cameras.main.height - this.ROW_HEIGHT * 2;
            const grassRow = this.rows.find(row => row.type === 'grass' && row.y > this.player.y && row.y < maxSafeY);
            if (grassRow) this.player.y = grassRow.y + this.ROW_HEIGHT / 2;
        }
    }

    loseLife() {
        if (this.lives <= 0) return;

        this.lives--;

        if (this.lives < 3) this.heartEmojis[this.lives].setAlpha(0.3);

        this.tweens.add({ targets: this.player, alpha: 0, duration: 100, yoyo: true, repeat: 3 });

        const maxSafeY = this.cameras.main.height - this.ROW_HEIGHT * 2;
        const grassRow = this.rows.find(row => row.type === 'grass' && row.y > this.player.y && row.y < maxSafeY);
        if (grassRow) this.player.y = grassRow.y + this.ROW_HEIGHT / 2;

        if (this.lives <= 0) {
            this.time.delayedCall(500, () => { this.gameOver(); });
        }
    }

    movePlayerForward() {
        this.player.y -= this.ROW_HEIGHT;
        soundManager.playHopForward();

        this.rowsCrossed++;
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
        this.lastScoredY -= this.ROW_HEIGHT;

        if (this.rowsCrossed >= this.rowsForNextNudge) {
            this.mathGenerator.nudgeDifficulty();
            this.rowsForNextNudge += 5;
        }
    }

    movePlayerLeft() {
        if (this.playerCol > 0) {
            this.playerCol--;
            this.player.x = this.playerCol * this.COL_WIDTH + this.COL_WIDTH / 2;
            soundManager.playHopSide();
        }
    }

    movePlayerRight() {
        if (this.playerCol < this.COLS - 1) {
            this.playerCol++;
            this.player.x = this.playerCol * this.COL_WIDTH + this.COL_WIDTH / 2;
            soundManager.playHopSide();
        }
    }

    gameOver() {
        soundManager.playGameOver();
        this.scene.start('GameOver', { score: this.score });
    }
}
