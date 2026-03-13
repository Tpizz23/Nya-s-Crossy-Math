// SaveManager - Handles all localStorage operations

class SaveManager {
    static SAVE_KEY = 'nya_math_game_save';

    // Get default save data structure
    static getDefaults() {
        return {
            version: 1,
            selectedCharacter: 0,
            cumulativeScore: 0,
            highScore: 0,
            unlockedCharacters: [0], // Froggy is always unlocked
            lastPlayedMathType: 'addition',
            lastPlayedDifficulty: 'easy'
        };
    }

    // Load save data from localStorage
    static load() {
        try {
            const savedData = localStorage.getItem(this.SAVE_KEY);
            if (!savedData) {
                return this.getDefaults();
            }

            const data = JSON.parse(savedData);

            // Ensure all required fields exist (for version migration)
            const defaults = this.getDefaults();
            return { ...defaults, ...data };
        } catch (error) {
            console.warn('Failed to load save data, using defaults:', error);
            return this.getDefaults();
        }
    }

    // Save data to localStorage
    static save(data) {
        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    // Update cumulative score and save
    static updateCumulativeScore(additionalPoints) {
        const data = this.load();
        data.cumulativeScore += additionalPoints;
        this.save(data);
        return data.cumulativeScore;
    }

    // Update high score if current score is higher
    static updateHighScore(currentScore) {
        const data = this.load();
        if (currentScore > data.highScore) {
            data.highScore = currentScore;
            this.save(data);
            return true; // New high score!
        }
        return false;
    }

    // Unlock a character
    static unlockCharacter(characterId) {
        const data = this.load();
        if (!data.unlockedCharacters.includes(characterId)) {
            data.unlockedCharacters.push(characterId);
            this.save(data);
            return true;
        }
        return false;
    }

    // Set selected character
    static setSelectedCharacter(characterId) {
        const data = this.load();
        data.selectedCharacter = characterId;
        this.save(data);
    }

    // Update last played settings
    static updateLastPlayed(mathType, difficulty) {
        const data = this.load();
        data.lastPlayedMathType = mathType;
        data.lastPlayedDifficulty = difficulty;
        this.save(data);
    }

    // Reset character progression (keep scores)
    static resetCharacterProgression() {
        const data = this.load();
        data.unlockedCharacters = [0]; // Only Froggy unlocked
        data.selectedCharacter = 0; // Back to Froggy
        this.save(data);
    }

    // Reset all data (nuclear option)
    static resetAllData() {
        this.save(this.getDefaults());
    }
}
