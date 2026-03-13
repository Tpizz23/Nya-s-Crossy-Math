// SoundManager - Web Audio API sound synthesis (Phase 6 implementation)

class SoundManager {
    constructor() {
        this.audioCtx = null;
        this.enabled = true;
    }

    // Ensure AudioContext is created (lazy initialization after user gesture)
    _ensureContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    // Play a tone (internal helper)
    _playTone(frequency, duration, waveType = 'sine', gain = 0.3, startTime = 0) {
        if (!this.enabled) return;

        const ctx = this._ensureContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

        gainNode.gain.setValueAtTime(gain, ctx.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime + startTime);
        oscillator.stop(ctx.currentTime + startTime + duration / 1000);
    }

    // Play correct answer sound - Two-note ascending: C5 then E5
    playCorrect() {
        const spec = SOUND_SPECS.correct;
        this._playTone(spec.freq1, spec.duration1, spec.wave, spec.gain, 0);
        this._playTone(spec.freq2, spec.duration2, spec.wave, spec.gain, spec.duration1 / 1000);
    }

    // Play wrong answer sound - Single low buzz
    playWrong() {
        const spec = SOUND_SPECS.wrong;
        this._playTone(spec.freq, spec.duration, spec.wave, spec.gain);
    }

    // Play hop forward sound - Quick boop
    playHopForward() {
        const spec = SOUND_SPECS.hopForward;
        this._playTone(spec.freq, spec.duration, spec.wave, spec.gain);
    }

    // Play hop sideways sound - Shorter lower boop
    playHopSide() {
        const spec = SOUND_SPECS.hopSide;
        this._playTone(spec.freq, spec.duration, spec.wave, spec.gain);
    }

    // Play game over sound - Descending sad tone
    playGameOver() {
        if (!this.enabled) return;

        const spec = SOUND_SPECS.gameOver;
        const ctx = this._ensureContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = spec.wave;
        oscillator.frequency.setValueAtTime(spec.freq1, ctx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(spec.freq2, ctx.currentTime + spec.duration / 1000);

        gainNode.gain.setValueAtTime(spec.gain, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + spec.duration / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + spec.duration / 1000);
    }

    // Play character unlock sound - 4-note celebratory arpeggio
    playUnlock() {
        const spec = SOUND_SPECS.unlock;
        spec.freqs.forEach((freq, index) => {
            this._playTone(freq, spec.duration, spec.wave, spec.gain, index * spec.duration / 1000);
        });
    }

    // Play UI button tap sound - Tiny click sound
    playTap() {
        const spec = SOUND_SPECS.tap;
        this._playTone(spec.freq, spec.duration, spec.wave, spec.gain);
    }

    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Global sound manager instance
const soundManager = new SoundManager();
