// Audio management for Gaboon Viper game
// Uses Web Audio API for sound synthesis (no external files needed)

class AudioManager {
    constructor() {
        this.context = null;
        this.sfxVolume = 0.7;
        this.musicVolume = 0.5;
        this.enabled = true;
        this.musicEnabled = true;

        this.musicOscillator = null;
        this.musicGain = null;

        this.init();
    }

    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = volume / 100;
    }

    setMusicVolume(volume) {
        this.musicVolume = volume / 100;
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume * 0.1;
        }
    }

    // Play a simple tone
    playTone(frequency, duration, type = 'sine', volume = 1) {
        if (!this.enabled || !this.context) return;

        this.resume();

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        const actualVolume = this.sfxVolume * volume;
        gainNode.gain.setValueAtTime(actualVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    }

    // Sound effects
    playEat() {
        if (!this.enabled) return;

        // Satisfying crunch sound
        this.playTone(400, 0.05, 'square', 0.3);
        setTimeout(() => this.playTone(600, 0.05, 'square', 0.2), 30);
        setTimeout(() => this.playTone(800, 0.1, 'sine', 0.3), 60);
    }

    playPowerUp() {
        if (!this.enabled) return;

        // Mystical chime
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.3), i * 80);
        });
    }

    playDeath() {
        if (!this.enabled) return;

        // Dramatic sting with descending tones
        this.playTone(400, 0.1, 'sawtooth', 0.4);
        setTimeout(() => this.playTone(300, 0.1, 'sawtooth', 0.35), 100);
        setTimeout(() => this.playTone(200, 0.2, 'sawtooth', 0.3), 200);
        setTimeout(() => this.playTone(100, 0.3, 'sawtooth', 0.25), 350);
    }

    playCollision() {
        if (!this.enabled) return;

        // Thud sound
        this.playTone(80, 0.15, 'sine', 0.5);
        this.playTone(60, 0.2, 'triangle', 0.3);
    }

    playLevelComplete() {
        if (!this.enabled) return;

        // Triumphant fanfare
        const melody = [
            { freq: 523, delay: 0, dur: 0.15 },    // C5
            { freq: 659, delay: 150, dur: 0.15 },  // E5
            { freq: 784, delay: 300, dur: 0.15 },  // G5
            { freq: 1047, delay: 450, dur: 0.4 },  // C6
        ];

        melody.forEach(note => {
            setTimeout(() => this.playTone(note.freq, note.dur, 'sine', 0.4), note.delay);
        });
    }

    playMove() {
        if (!this.enabled) return;

        // Subtle slither (very quiet)
        this.playTone(100 + Math.random() * 50, 0.03, 'sine', 0.05);
    }

    playMenuSelect() {
        if (!this.enabled) return;

        this.playTone(440, 0.08, 'sine', 0.2);
    }

    playEagleWarning() {
        if (!this.enabled) return;

        // High screech
        this.playTone(1200, 0.1, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(1400, 0.15, 'sawtooth', 0.25), 100);
    }

    // Background music (simple procedural)
    startMusic() {
        if (!this.enabled || !this.musicEnabled || !this.context) return;

        this.resume();
        this.stopMusic();

        // Create a simple ambient drone
        this.musicGain = this.context.createGain();
        this.musicGain.gain.value = this.musicVolume * 0.1;
        this.musicGain.connect(this.context.destination);

        // Base drone
        this.musicOscillator = this.context.createOscillator();
        this.musicOscillator.type = 'sine';
        this.musicOscillator.frequency.value = 110; // A2

        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;

        this.musicOscillator.connect(filter);
        filter.connect(this.musicGain);

        this.musicOscillator.start();

        // Add subtle modulation
        const lfo = this.context.createOscillator();
        const lfoGain = this.context.createGain();
        lfo.frequency.value = 0.2;
        lfoGain.gain.value = 5;
        lfo.connect(lfoGain);
        lfoGain.connect(this.musicOscillator.frequency);
        lfo.start();
    }

    stopMusic() {
        if (this.musicOscillator) {
            try {
                this.musicOscillator.stop();
            } catch (e) {
                // Already stopped
            }
            this.musicOscillator = null;
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.startMusic();
        } else {
            this.stopMusic();
        }
        return this.musicEnabled;
    }

    // Pause/resume context
    pause() {
        if (this.context) {
            this.context.suspend();
        }
    }

    unpause() {
        if (this.context) {
            this.context.resume();
        }
    }
}
