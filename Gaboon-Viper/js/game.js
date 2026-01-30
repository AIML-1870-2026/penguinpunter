// Main game controller for Gaboon Viper: Sahara Hunt

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        // Grid settings
        this.cellSize = 20;
        this.gridWidth = 40;
        this.gridHeight = 30;

        // Canvas size
        this.canvas.width = this.gridWidth * this.cellSize;
        this.canvas.height = this.gridHeight * this.cellSize;

        // Create offscreen canvas for static background
        this.bgCanvas = document.createElement('canvas');
        this.bgCanvas.width = this.canvas.width;
        this.bgCanvas.height = this.canvas.height;
        this.bgCtx = this.bgCanvas.getContext('2d');
        this.bgCached = false;

        // Game state
        this.state = 'menu'; // menu, playing, paused, gameOver, levelComplete
        this.currentLevel = 1;
        this.isEndlessMode = false;

        // Score
        this.score = 0;
        this.highScore = 0;
        this.preyCaught = 0;
        this.combo = 0;
        this.lastCatchTime = 0;

        // Timing
        this.lastUpdate = 0;
        this.tickInterval = 150;
        this.tickAccumulator = 0;
        this.levelStartTime = 0;
        this.playTime = 0;

        // Settings
        this.settings = Utils.loadData('gaboonViper_settings', {
            sfxVolume: 70,
            musicVolume: 50,
            difficulty: 'normal',
            showGrid: false
        });

        // Initialize components
        this.snake = new Snake(this.gridWidth, this.gridHeight, this.cellSize);
        this.aiSnake = new AISnake(this.gridWidth, this.gridHeight, this.cellSize);
        this.aiEnabled = true;
        this.foodManager = new FoodManager(this.gridWidth, this.gridHeight, this.cellSize);
        this.powerUpManager = new PowerUpManager(this.gridWidth, this.gridHeight, this.cellSize);
        this.obstacleManager = new ObstacleManager(this.gridWidth, this.gridHeight, this.cellSize);
        this.controls = new Controls(this.canvas);
        this.ui = new UI();
        this.audio = new AudioManager();

        // Apply settings
        this.applySettings();

        // Setup callbacks
        this.setupCallbacks();

        // Load high scores
        this.loadHighScores();

        // Start game loop
        this.lastUpdate = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    applySettings() {
        this.audio.setSFXVolume(this.settings.sfxVolume);
        this.audio.setMusicVolume(this.settings.musicVolume);
    }

    setupCallbacks() {
        // UI callbacks
        this.ui.setCallback('startGame', () => this.startGame(1));
        this.ui.setCallback('showLevelSelect', () => this.showLevelSelect());
        this.ui.setCallback('selectLevel', (level) => this.startGame(level));
        this.ui.setCallback('startEndless', () => this.startEndlessMode());
        this.ui.setCallback('showHighScores', () => this.showHighScores());
        this.ui.setCallback('showSettings', () => this.ui.showSettings(this.settings));
        this.ui.setCallback('showHowToPlay', () => this.ui.showHowToPlay());
        this.ui.setCallback('backToMenu', () => this.backToMenu());
        this.ui.setCallback('resume', () => this.resume());
        this.ui.setCallback('restart', () => this.restart());
        this.ui.setCallback('quitToMenu', () => this.quitToMenu());
        this.ui.setCallback('retry', () => this.restart());
        this.ui.setCallback('nextLevel', () => this.nextLevel());

        this.ui.setCallback('settingChanged', (setting, value) => {
            this.settings[setting] = value;
            Utils.saveData('gaboonViper_settings', this.settings);
            this.applySettings();
        });

        // Control callbacks
        this.controls.setCallback('onPause', () => this.togglePause());
        this.controls.setCallback('onEscape', () => this.handleEscape());
        this.controls.setCallback('onMouseToggle', (isOn) => {
            this.ui.updateMouseMode(isOn);
        });
    }

    loadHighScores() {
        const scores = Utils.loadData('gaboonViper_highScores', []);
        this.highScores = scores;
        this.highScore = scores.length > 0 ? scores[0].score : 0;
    }

    saveHighScore(score, level) {
        const entry = {
            score: score,
            level: level,
            date: new Date().toISOString()
        };

        this.highScores.push(entry);
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 10); // Keep top 10

        Utils.saveData('gaboonViper_highScores', this.highScores);

        if (score > this.highScore) {
            this.highScore = score;
        }
    }

    showLevelSelect() {
        const unlocked = Levels.getUnlockedLevels();
        this.ui.showLevelSelect(unlocked, Levels.getLevelCount());
    }

    showHighScores() {
        this.ui.showHighScores(this.highScores);
    }

    startGame(level) {
        this.currentLevel = level;
        this.isEndlessMode = false;

        const levelConfig = Levels.getLevel(level);

        // Reset game state
        this.score = 0;
        this.preyCaught = 0;
        this.combo = 0;
        this.lastCatchTime = 0;
        this.playTime = 0;
        this.levelStartTime = performance.now();

        // Calculate tick interval based on level and difficulty
        const diffMod = levelConfig.speedModifiers[this.settings.difficulty] || 1;
        this.tickInterval = levelConfig.speed * diffMod;

        // Reset components
        this.snake.reset();
        this.aiSnake.reset();
        this.aiSnake.setDifficulty(level);
        this.controls.reset();

        // Setup food manager
        this.foodManager.setAvailableTypes(levelConfig.preyTypes);
        this.foodManager.spawn(this.snake, this.obstacleManager.getAllObstacles());

        // Setup power-ups
        this.powerUpManager.setAvailableTypes(levelConfig.powerUps || []);
        this.powerUpManager.reset();

        // Setup obstacles
        this.obstacleManager.loadLevel(levelConfig);

        // Update UI
        this.ui.hideAllScreens();
        this.ui.showHUD();
        this.ui.updateHUD(this.score, this.highScore, this.currentLevel);
        this.ui.updateMouseMode(this.controls.isMouseMode());

        // Start audio
        this.audio.resume();
        this.audio.startMusic();

        this.state = 'playing';
    }

    startEndlessMode() {
        if (!Levels.isEndlessModeUnlocked()) {
            // Show message that endless isn't unlocked
            alert('Complete all levels to unlock Endless Mode!');
            return;
        }

        this.isEndlessMode = true;
        this.currentLevel = 0;

        const config = Levels.endless;

        this.score = 0;
        this.preyCaught = 0;
        this.combo = 0;
        this.playTime = 0;
        this.levelStartTime = performance.now();

        this.tickInterval = config.startSpeed;

        this.snake.reset();
        this.aiSnake.reset();
        this.aiSnake.setDifficulty(5); // Harder in endless mode
        this.controls.reset();

        this.foodManager.setAvailableTypes(config.preyTypes);
        this.foodManager.spawn(this.snake, []);

        this.powerUpManager.setAvailableTypes(config.powerUps);
        this.powerUpManager.reset();

        this.obstacleManager.reset();

        this.ui.hideAllScreens();
        this.ui.showHUD();
        this.ui.updateHUD(this.score, this.highScore, 'Endless');
        this.ui.updateMouseMode(this.controls.isMouseMode());

        this.audio.resume();
        this.audio.startMusic();

        this.state = 'playing';
    }

    backToMenu() {
        this.state = 'menu';
        this.audio.stopMusic();
        this.ui.showMainMenu();
    }

    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.audio.pause();
            this.ui.showPause();
        } else if (this.state === 'paused') {
            this.resume();
        }
    }

    resume() {
        this.state = 'playing';
        this.audio.unpause();
        this.ui.hidePause();
        this.lastUpdate = performance.now();
    }

    handleEscape() {
        if (this.state === 'playing') {
            this.togglePause();
        } else if (this.state === 'paused') {
            this.resume();
        }
    }

    restart() {
        if (this.isEndlessMode) {
            this.startEndlessMode();
        } else {
            this.startGame(this.currentLevel);
        }
    }

    quitToMenu() {
        this.audio.stopMusic();
        this.state = 'menu';
        this.ui.showMainMenu();
    }

    nextLevel() {
        if (this.currentLevel < Levels.getLevelCount()) {
            this.startGame(this.currentLevel + 1);
        } else {
            // Completed all levels - unlock endless mode
            Levels.unlockNextLevel(this.currentLevel);
            this.quitToMenu();
        }
    }

    gameOver(won = false) {
        this.state = 'gameOver';
        this.audio.stopMusic();

        if (won) {
            this.audio.playLevelComplete();

            // Calculate bonus
            const levelBonus = this.currentLevel * 100;
            const totalScore = this.score + levelBonus;

            // Unlock next level
            Levels.unlockNextLevel(this.currentLevel);

            // Save score
            this.saveHighScore(totalScore, this.currentLevel);

            this.ui.showLevelComplete({
                score: this.score,
                bonus: levelBonus,
                total: totalScore
            });
        } else {
            this.audio.playDeath();

            // Save score
            this.saveHighScore(this.score, this.isEndlessMode ? 'Endless' : this.currentLevel);

            this.ui.showGameOver({
                score: this.score,
                highScore: this.highScore,
                preyCaught: this.preyCaught,
                won: false,
                hasNextLevel: false
            });
        }
    }

    checkLevelComplete() {
        if (this.isEndlessMode) return false;

        const levelConfig = Levels.getLevel(this.currentLevel);

        // Check score target
        if (this.score >= levelConfig.targetScore) {
            return true;
        }

        // Check time limit (if survival mode)
        if (levelConfig.timeLimit) {
            const elapsed = (performance.now() - this.levelStartTime) / 1000;
            if (elapsed >= levelConfig.timeLimit && this.score >= levelConfig.targetScore) {
                return true;
            }
        }

        return false;
    }

    update(deltaTime) {
        if (this.state !== 'playing') return;

        // Update play time
        this.playTime += deltaTime;

        // Update tick accumulator
        const speedMod = this.powerUpManager.getSpeedMultiplier();
        this.tickAccumulator += deltaTime;

        const adjustedInterval = this.tickInterval / speedMod;

        // Process game ticks
        while (this.tickAccumulator >= adjustedInterval) {
            this.tickAccumulator -= adjustedInterval;
            this.gameTick();
        }

        // Update components that need smooth updates
        this.foodManager.update();
        this.powerUpManager.update(deltaTime, this.snake, this.obstacleManager.getAllObstacles());
        this.obstacleManager.update(deltaTime, this.snake);

        // Update AI snake
        if (this.aiEnabled && this.aiSnake.alive) {
            this.aiSnake.updateAI(deltaTime, this.snake, this.foodManager.food, this.obstacleManager.getAllObstacles());
        }

        // Update HUD
        this.ui.updateHUD(this.score, this.highScore, this.isEndlessMode ? 'Endless' : this.currentLevel);
        this.ui.updatePowerUp(this.powerUpManager.getActiveEffect());

        // Endless mode difficulty scaling
        if (this.isEndlessMode) {
            this.updateEndlessDifficulty();
        }
    }

    gameTick() {
        // Get direction
        let direction;
        if (this.controls.isMouseMode()) {
            direction = this.controls.getMouseDirection(this.snake.head, this.cellSize);
            if (direction) {
                this.snake.setDirection(direction.x, direction.y);
            }
        } else {
            direction = this.controls.getNextDirection();
            this.snake.setDirection(direction.x, direction.y);
        }

        // Update snake
        if (!this.snake.update()) {
            this.gameOver(false);
            return;
        }

        // Check obstacle collision
        const obstacleHit = this.obstacleManager.checkCollision(
            this.snake.head.x,
            this.snake.head.y,
            this.snake.hasShield
        );

        if (obstacleHit === 'death') {
            this.audio.playCollision();
            this.gameOver(false);
            return;
        } else if (obstacleHit === 'blocked') {
            this.audio.playCollision();
            this.snake.hasShield = false;
        }

        // Check food collision
        const caughtPrey = this.foodManager.checkCollision(this.snake.head.x, this.snake.head.y);
        if (caughtPrey) {
            this.handlePreyCaught(caughtPrey);
        }

        // Check power-up collision
        const caughtPowerUp = this.powerUpManager.checkCollision(
            this.snake.head.x,
            this.snake.head.y,
            this.snake
        );
        if (caughtPowerUp) {
            this.audio.playPowerUp();
            this.score += 5; // Power-up collection bonus
        }

        // Update AI snake
        if (this.aiEnabled && this.aiSnake.alive) {
            this.aiSnake.update();

            // Check if AI caught food
            const aiCaughtPrey = this.foodManager.checkCollision(this.aiSnake.head.x, this.aiSnake.head.y);
            if (aiCaughtPrey) {
                this.aiSnake.grow(1);
                this.foodManager.spawn(this.snake, this.obstacleManager.getAllObstacles());
            }

            // Check if player collided with AI snake body
            if (this.snake.checkCollisionWithSnake(this.aiSnake)) {
                if (!this.snake.hasShield) {
                    this.audio.playCollision();
                    this.gameOver(false);
                    return;
                }
                this.snake.hasShield = false;
            }

            // Check if AI collided with player snake body (AI dies)
            if (this.aiSnake.checkCollisionWithSnake(this.snake)) {
                this.aiSnake.alive = false;
                this.score += 100; // Bonus for killing the mamba!
            }
        }

        // Check level complete
        if (this.checkLevelComplete()) {
            this.gameOver(true);
        }
    }

    handlePreyCaught(prey) {
        // Calculate score with multipliers
        let points = prey.points;

        // Score multiplier power-up
        points *= this.powerUpManager.getScoreMultiplier();

        // Combo multiplier
        const now = performance.now();
        if (now - this.lastCatchTime < 3000) {
            this.combo++;
            points *= (1 + this.combo * 0.1);
        } else {
            this.combo = 0;
        }
        this.lastCatchTime = now;

        this.score += Math.floor(points);
        this.preyCaught++;

        // Grow snake
        this.snake.grow(1);

        // Play sound
        this.audio.playEat();

        // Spawn new food
        this.foodManager.spawn(this.snake, this.obstacleManager.getAllObstacles());
    }

    updateEndlessDifficulty() {
        const config = Levels.endless;
        const elapsedSeconds = this.playTime / 1000;

        // Increase speed over time
        const speedDecrease = Math.floor(elapsedSeconds / config.speedIncreaseInterval) * config.speedIncrease;
        this.tickInterval = Math.max(config.minSpeed, config.startSpeed - speedDecrease);

        // Add obstacles over time
        if (Math.random() < 0.001 && this.obstacleManager.staticObstacles.length < config.maxObstacles) {
            // Add random obstacle
            let x, y;
            do {
                x = Utils.randomInt(3, this.gridWidth - 4);
                y = Utils.randomInt(3, this.gridHeight - 4);
            } while (this.snake.checkCollisionAt(x, y) || this.obstacleManager.isOccupied(x, y));

            this.obstacleManager.staticObstacles.push({
                x: x,
                y: y,
                type: 'rock',
                ...ObstacleTypes.rock
            });
        }
    }

    draw() {
        const ctx = this.ctx;

        // Clear canvas
        ctx.fillStyle = '#D4A574';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background pattern (sand texture)
        this.drawBackground();

        // Draw grid (if enabled)
        if (this.settings.showGrid) {
            this.drawGrid();
        }

        // Draw obstacles
        this.obstacleManager.draw(ctx, this.snake.head);

        // Draw food
        this.foodManager.draw(ctx);

        // Draw power-ups
        this.powerUpManager.draw(ctx);

        // Draw AI snake (Black Mamba)
        if (this.aiEnabled && this.aiSnake.alive) {
            this.aiSnake.draw(ctx);
        }

        // Draw player snake
        this.snake.draw(ctx);
    }

    cacheBackground() {
        const ctx = this.bgCtx;

        // Base sand color
        ctx.fillStyle = '#D4A574';
        ctx.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);

        // Create subtle sand dune patterns
        ctx.fillStyle = 'rgba(196, 149, 106, 0.3)';

        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.ellipse(
                150 + i * 180,
                200 + (i % 2) * 100,
                120,
                30,
                0.2,
                0, Math.PI * 2
            );
            ctx.fill();
        }

        // Add some scattered dots for texture
        ctx.fillStyle = 'rgba(139, 90, 43, 0.1)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 17) % this.bgCanvas.width;
            const y = (i * 23) % this.bgCanvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        this.bgCached = true;
    }

    drawBackground() {
        if (!this.bgCached) {
            this.cacheBackground();
        }
        this.ctx.drawImage(this.bgCanvas, 0, 0);
    }

    drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(139, 90, 43, 0.2)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= this.gridWidth; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.cellSize, 0);
            ctx.lineTo(x * this.cellSize, this.canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y <= this.gridHeight; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.cellSize);
            ctx.lineTo(this.canvas.width, y * this.cellSize);
            ctx.stroke();
        }
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastUpdate;
        this.lastUpdate = currentTime;

        // Update game logic
        this.update(deltaTime);

        // Draw
        if (this.state === 'playing' || this.state === 'paused') {
            this.draw();
        }

        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
