// Game Configuration and Initialization

const gameConfig = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    parent: 'game',
    backgroundColor: '#2c3e50',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        MainMenuScene,
        CharacterSelectScene,
        SettingsScene,
        OptionsScene,
        GameScene,
        QuizOverlayScene,
        GameOverScene
    ]
};

// Initialize the game when the page loads
window.addEventListener('load', () => {
    const game = new Phaser.Game(gameConfig);
});
