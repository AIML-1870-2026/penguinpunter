// UI management for Gaboon Viper game

class UI {
    constructor() {
        this.screens = {
            mainMenu: document.getElementById('main-menu'),
            levelSelect: document.getElementById('level-select-menu'),
            settings: document.getElementById('settings-menu'),
            howToPlay: document.getElementById('how-to-play-menu'),
            highScores: document.getElementById('high-scores-menu'),
            pause: document.getElementById('pause-menu'),
            gameOver: document.getElementById('game-over-menu'),
            levelComplete: document.getElementById('level-complete-menu')
        };

        this.hud = {
            container: document.getElementById('game-hud'),
            score: document.getElementById('hud-score'),
            high: document.getElementById('hud-high'),
            level: document.getElementById('hud-level'),
            powerup: document.getElementById('hud-powerup'),
            powerupIcon: document.getElementById('powerup-icon'),
            powerupTimer: document.getElementById('powerup-timer')
        };

        this.controlsInfo = document.getElementById('controls-info');
        this.mouseModeIndicator = document.getElementById('mouse-mode-indicator');

        this.callbacks = {};
        this.currentScreen = 'mainMenu';

        this.setupButtons();
    }

    setupButtons() {
        // Main menu buttons
        this.addButtonListener('btn-start', 'startGame');
        this.addButtonListener('btn-select-level', 'showLevelSelect');
        this.addButtonListener('btn-endless', 'startEndless');
        this.addButtonListener('btn-high-scores', 'showHighScores');
        this.addButtonListener('btn-settings', 'showSettings');
        this.addButtonListener('btn-how-to-play', 'showHowToPlay');

        // Back buttons
        this.addButtonListener('btn-back-from-levels', 'backToMenu');
        this.addButtonListener('btn-back-from-settings', 'backToMenu');
        this.addButtonListener('btn-back-from-help', 'backToMenu');
        this.addButtonListener('btn-back-from-scores', 'backToMenu');

        // Pause menu buttons
        this.addButtonListener('btn-resume', 'resume');
        this.addButtonListener('btn-restart', 'restart');
        this.addButtonListener('btn-pause-settings', 'showSettings');
        this.addButtonListener('btn-quit', 'quitToMenu');

        // Game over buttons
        this.addButtonListener('btn-retry', 'retry');
        this.addButtonListener('btn-next-level', 'nextLevel');
        this.addButtonListener('btn-game-over-menu', 'quitToMenu');

        // Level complete buttons
        this.addButtonListener('btn-next', 'nextLevel');
        this.addButtonListener('btn-level-menu', 'quitToMenu');
    }

    addButtonListener(buttonId, callbackName) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                if (this.callbacks[callbackName]) {
                    this.callbacks[callbackName]();
                }
            });
        }
    }

    setCallback(event, callback) {
        this.callbacks[event] = callback;
    }

    showScreen(screenName) {
        // Hide all screens
        for (const screen of Object.values(this.screens)) {
            if (screen) {
                screen.classList.add('hidden');
            }
        }

        // Show requested screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.remove('hidden');
            this.currentScreen = screenName;
        }
    }

    hideAllScreens() {
        for (const screen of Object.values(this.screens)) {
            if (screen) {
                screen.classList.add('hidden');
            }
        }
    }

    showMainMenu() {
        this.showScreen('mainMenu');
        this.hideHUD();
    }

    showLevelSelect(unlockedLevel, totalLevels) {
        this.showScreen('levelSelect');

        const container = document.getElementById('level-buttons');
        container.innerHTML = '';

        for (let i = 1; i <= totalLevels; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = `Level ${i}`;

            if (i > unlockedLevel) {
                btn.classList.add('locked');
                btn.textContent += ' 🔒';
            } else {
                btn.addEventListener('click', () => {
                    if (this.callbacks.selectLevel) {
                        this.callbacks.selectLevel(i);
                    }
                });
            }

            container.appendChild(btn);
        }
    }

    showSettings(settings) {
        this.showScreen('settings');

        // Load current settings
        document.getElementById('sfx-volume').value = settings.sfxVolume || 70;
        document.getElementById('music-volume').value = settings.musicVolume || 50;
        document.getElementById('difficulty').value = settings.difficulty || 'normal';
        document.getElementById('show-grid').checked = settings.showGrid || false;

        // Add change listeners
        document.getElementById('sfx-volume').onchange = (e) => {
            if (this.callbacks.settingChanged) {
                this.callbacks.settingChanged('sfxVolume', parseInt(e.target.value));
            }
        };

        document.getElementById('music-volume').onchange = (e) => {
            if (this.callbacks.settingChanged) {
                this.callbacks.settingChanged('musicVolume', parseInt(e.target.value));
            }
        };

        document.getElementById('difficulty').onchange = (e) => {
            if (this.callbacks.settingChanged) {
                this.callbacks.settingChanged('difficulty', e.target.value);
            }
        };

        document.getElementById('show-grid').onchange = (e) => {
            if (this.callbacks.settingChanged) {
                this.callbacks.settingChanged('showGrid', e.target.checked);
            }
        };
    }

    showHowToPlay() {
        this.showScreen('howToPlay');
    }

    showHighScores(scores) {
        this.showScreen('highScores');

        const container = document.getElementById('high-scores-list');
        container.innerHTML = '';

        if (!scores || scores.length === 0) {
            container.innerHTML = '<p style="color: #E8D4B8; text-align: center;">No high scores yet!</p>';
            return;
        }

        scores.forEach((score, index) => {
            const entry = document.createElement('div');
            entry.className = 'score-entry';
            if (index === 0) entry.classList.add('highlight');

            entry.innerHTML = `
                <span>#${index + 1}</span>
                <span>${score.name || 'Level ' + score.level}</span>
                <span>${score.score}</span>
            `;
            container.appendChild(entry);
        });
    }

    showPause() {
        this.showScreen('pause');
    }

    hidePause() {
        this.screens.pause.classList.add('hidden');
    }

    showGameOver(stats) {
        this.showScreen('gameOver');

        document.getElementById('game-over-title').textContent =
            stats.won ? 'LEVEL COMPLETE!' : 'GAME OVER';

        document.getElementById('final-score').textContent = stats.score;
        document.getElementById('final-high').textContent = stats.highScore;
        document.getElementById('prey-caught').textContent = stats.preyCaught;

        const nextBtn = document.getElementById('btn-next-level');
        if (stats.won && stats.hasNextLevel) {
            nextBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.add('hidden');
        }
    }

    showLevelComplete(stats) {
        this.showScreen('levelComplete');

        document.getElementById('level-score').textContent = stats.score;
        document.getElementById('level-bonus').textContent = stats.bonus;
        document.getElementById('level-total').textContent = stats.total;
    }

    showHUD() {
        this.hud.container.classList.remove('hidden');
        this.controlsInfo.classList.remove('hidden');
    }

    hideHUD() {
        this.hud.container.classList.add('hidden');
        this.controlsInfo.classList.add('hidden');
    }

    updateHUD(score, highScore, level) {
        this.hud.score.textContent = `Score: ${score}`;
        this.hud.high.textContent = `High: ${highScore}`;
        this.hud.level.textContent = `Level: ${level}`;
    }

    updatePowerUp(powerUp) {
        if (powerUp) {
            this.hud.powerup.classList.remove('hidden');
            this.hud.powerupIcon.textContent = powerUp.icon;
            this.hud.powerupTimer.textContent = Math.ceil(powerUp.remaining / 1000) + 's';
        } else {
            this.hud.powerup.classList.add('hidden');
        }
    }

    updateMouseMode(isMouseMode) {
        this.mouseModeIndicator.textContent = `[M] Mouse Mode: ${isMouseMode ? 'ON' : 'OFF'}`;
    }
}
