// Game Data - All static configuration and constants

// Character definitions with unlock requirements
const CHARACTERS = [
    { id: 0, emoji: '🐸', name: 'Froggy', unlockScore: 0, description: 'Your first friend!' },
    { id: 1, emoji: '🐥', name: 'Chick', unlockScore: 100, description: 'Unlock at 100 points' },
    { id: 2, emoji: '🐶', name: 'Doggo', unlockScore: 300, description: 'Unlock at 300 points' },
    { id: 3, emoji: '🐱', name: 'Kitty', unlockScore: 600, description: 'Unlock at 600 points' },
    { id: 4, emoji: '🦊', name: 'Foxy', unlockScore: 1000, description: 'Unlock at 1,000 points' },
    { id: 5, emoji: '🐼', name: 'Panda', unlockScore: 1500, description: 'Unlock at 1,500 points' },
    { id: 6, emoji: '🦄', name: 'Unicorn', unlockScore: 2500, description: 'Unlock at 2,500 points' },
    { id: 7, emoji: '🐲', name: 'Dragon', unlockScore: 4000, description: 'Unlock at 4,000 points' },
    { id: 8, emoji: '🚀', name: 'Rocket', unlockScore: 6000, description: 'Unlock at 6,000 points' },
    { id: 9, emoji: '👑', name: 'King', unlockScore: 10000, description: 'Unlock at 10,000 points' },
    { id: 10, emoji: '🐧', name: 'Penguin', unlockScore: 12000, description: 'Unlock at 12,000 points' },
    { id: 11, emoji: '🦁', name: 'Lion', unlockScore: 14000, description: 'Unlock at 14,000 points' },
    { id: 12, emoji: '🐯', name: 'Tiger', unlockScore: 16000, description: 'Unlock at 16,000 points' },
    { id: 13, emoji: '🐻', name: 'Bear', unlockScore: 18000, description: 'Unlock at 18,000 points' },
    { id: 14, emoji: '🐨', name: 'Koala', unlockScore: 20000, description: 'Unlock at 20,000 points' },
    { id: 15, emoji: '🦉', name: 'Owl', unlockScore: 22500, description: 'Unlock at 22,500 points' },
    { id: 16, emoji: '🦅', name: 'Eagle', unlockScore: 25000, description: 'Unlock at 25,000 points' },
    { id: 17, emoji: '🦋', name: 'Butterfly', unlockScore: 27500, description: 'Unlock at 27,500 points' },
    { id: 18, emoji: '🐝', name: 'Bee', unlockScore: 30000, description: 'Unlock at 30,000 points' },
    { id: 19, emoji: '🐢', name: 'Turtle', unlockScore: 33000, description: 'Unlock at 33,000 points' },
    { id: 20, emoji: '🐙', name: 'Octopus', unlockScore: 36000, description: 'Unlock at 36,000 points' },
    { id: 21, emoji: '🦈', name: 'Shark', unlockScore: 39000, description: 'Unlock at 39,000 points' },
    { id: 22, emoji: '🐬', name: 'Dolphin', unlockScore: 42000, description: 'Unlock at 42,000 points' },
    { id: 23, emoji: '🦕', name: 'Dino', unlockScore: 45000, description: 'Unlock at 45,000 points' },
    { id: 24, emoji: '🦖', name: 'T-Rex', unlockScore: 50000, description: 'Unlock at 50,000 points' },
    { id: 25, emoji: '🐉', name: 'Serpent', unlockScore: 55000, description: 'Unlock at 55,000 points' },
    { id: 26, emoji: '🦚', name: 'Peacock', unlockScore: 60000, description: 'Unlock at 60,000 points' },
    { id: 27, emoji: '🦜', name: 'Parrot', unlockScore: 70000, description: 'Unlock at 70,000 points' },
    { id: 28, emoji: '🌟', name: 'Star', unlockScore: 80000, description: 'Unlock at 80,000 points' },
    { id: 29, emoji: '🏆', name: 'Champion', unlockScore: 100000, description: 'Unlock at 100,000 points' }
];

const MATH_RANGES = {
    addition: {
        easy: { minA: 1, maxA: 5, minB: 1, maxB: 5 },
        medium: { minA: 1, maxA: 10, minB: 1, maxB: 10 },
        hard: { minA: 1, maxA: 25, minB: 1, maxB: 25 },
        expert: { minA: 1, maxA: 50, minB: 1, maxB: 50 }
    },
    subtraction: {
        easy: { minResult: 1, maxResult: 9, minB: 1, maxB: 9 },
        medium: { minResult: 0, maxResult: 19, minB: 1, maxB: 19 },
        hard: { minResult: 0, maxResult: 49, minB: 1, maxB: 49 },
        expert: { minResult: 0, maxResult: 99, minB: 1, maxB: 99 }
    },
    multiplication: {
        easy: { minA: 1, maxA: 5, minB: 1, maxB: 3 },
        medium: { minA: 1, maxA: 5, minB: 1, maxB: 5 },
        hard: { minA: 1, maxA: 10, minB: 1, maxB: 5 },
        expert: { minA: 1, maxA: 12, minB: 1, maxB: 12 }
    },
    division: {
        easy: { minDivisor: 1, maxDivisor: 2, minMultiplier: 1, maxMultiplier: 10 },
        medium: { minDivisor: 1, maxDivisor: 5, minMultiplier: 1, maxMultiplier: 10 },
        hard: { minDivisor: 2, maxDivisor: 10, minMultiplier: 1, maxMultiplier: 10 },
        expert: { minDivisor: 2, maxDivisor: 12, minMultiplier: 1, maxMultiplier: 12 }
    }
};

const OPERATION_SYMBOLS = {
    addition: '+',
    subtraction: '-',
    multiplication: '×',
    division: '÷'
};

const SOUND_SPECS = {
    correct: { freq1: 523, freq2: 659, duration1: 100, duration2: 200, wave: 'sine', gain: 0.3 },
    wrong: { freq: 200, duration: 400, wave: 'square', gain: 0.25 },
    hopForward: { freq: 440, duration: 80, wave: 'sine', gain: 0.2 },
    hopSide: { freq: 330, duration: 60, wave: 'sine', gain: 0.15 },
    gameOver: { freq1: 300, freq2: 150, duration: 800, wave: 'sawtooth', gain: 0.3 },
    unlock: { freqs: [523, 659, 784, 1047], duration: 150, wave: 'sine', gain: 0.3 },
    tap: { freq: 500, duration: 60, wave: 'sine', gain: 0.15 }
};
