// UI Controls Manager
class ControlsManager {
    constructor(simulation, renderer) {
        this.simulation = simulation;
        this.renderer = renderer;
        this.isPaused = false;

        this.currentPreset = PRESET_PATTERNS[0];  // Default to Mitosis
        this.parentA = 0;  // Parent A index for breeding
        this.parentB = 1;  // Parent B index for breeding

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Preset pattern buttons
        const presetButtons = document.querySelectorAll('.preset-item');
        presetButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                this.loadPreset(index);
            });
        });

        // Play/Pause button
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                this.togglePlayPause();
            });
        }

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.simulation.reset();
            });
        }

        // Theme selector
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.renderer.setTheme(e.target.value);
            });
        }

        // Parameter sliders
        const fSlider = document.getElementById('f-slider');
        const kSlider = document.getElementById('k-slider');
        const fValue = document.getElementById('f-value');
        const kValue = document.getElementById('k-value');

        if (fSlider && fValue) {
            fSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.simulation.f = value;
                fValue.textContent = value.toFixed(4);
            });
        }

        if (kSlider && kValue) {
            kSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.simulation.k = value;
                kValue.textContent = value.toFixed(4);
            });
        }

        // Breeding controls
        const parentASelect = document.getElementById('parent-a-select');
        const parentBSelect = document.getElementById('parent-b-select');
        const blendSlider = document.getElementById('blend-slider');
        const blendValue = document.getElementById('blend-value');
        const breedBtn = document.getElementById('breed-btn');

        if (parentASelect) {
            parentASelect.addEventListener('change', (e) => {
                this.parentA = parseInt(e.target.value);
            });
        }

        if (parentBSelect) {
            parentBSelect.addEventListener('change', (e) => {
                this.parentB = parseInt(e.target.value);
            });
        }

        if (blendSlider && blendValue) {
            blendSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                blendValue.textContent = value + '%';
            });
        }

        if (breedBtn) {
            breedBtn.addEventListener('click', () => {
                this.breedAndApply();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeypress(e);
        });
    }

    loadPreset(index) {
        if (index >= 0 && index < PRESET_PATTERNS.length) {
            const preset = PRESET_PATTERNS[index];
            this.currentPreset = preset;

            this.simulation.setParameters(preset.f, preset.k);
            this.simulation.reset();

            // Update UI
            this.updateParameterDisplays();

            // Highlight selected preset
            const presetButtons = document.querySelectorAll('.preset-item');
            presetButtons.forEach((btn, i) => {
                if (i === index) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }

    togglePlayPause() {
        this.isPaused = !this.isPaused;
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.textContent = this.isPaused ? 'Play' : 'Pause';
        }
    }

    breedAndApply() {
        const blendSlider = document.getElementById('blend-slider');
        const blendFactor = blendSlider ? parseFloat(blendSlider.value) / 100 : 0.5;

        const presetA = PRESET_PATTERNS[this.parentA];
        const presetB = PRESET_PATTERNS[this.parentB];

        const offspring = breedPatterns(presetA, presetB, blendFactor);

        this.simulation.setParameters(offspring.f, offspring.k);
        this.simulation.reset();

        // Update UI
        this.updateParameterDisplays();
    }

    updateParameterDisplays() {
        const fSlider = document.getElementById('f-slider');
        const kSlider = document.getElementById('k-slider');
        const fValue = document.getElementById('f-value');
        const kValue = document.getElementById('k-value');

        if (fSlider) fSlider.value = this.simulation.f;
        if (kSlider) kSlider.value = this.simulation.k;
        if (fValue) fValue.textContent = this.simulation.f.toFixed(4);
        if (kValue) kValue.textContent = this.simulation.k.toFixed(4);
    }

    handleKeypress(e) {
        switch (e.key) {
            case ' ':  // Space - play/pause
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'r':
            case 'R':  // R - reset
                this.simulation.reset();
                break;
            case 'e':
            case 'E':  // E - export (will be handled by export.js)
                const exportBtn = document.getElementById('export-btn');
                if (exportBtn) exportBtn.click();
                break;
            // Number keys 1-9 for quick preset loading
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                const presetIndex = parseInt(e.key) - 1;
                if (presetIndex < PRESET_PATTERNS.length) {
                    this.loadPreset(presetIndex);
                }
                break;
        }
    }

    getIsPaused() {
        return this.isPaused;
    }
}
