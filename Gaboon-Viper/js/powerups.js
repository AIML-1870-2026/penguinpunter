// Power-up system for Gaboon Viper game

const PowerUpTypes = {
    speed: {
        name: 'Speed Burst',
        icon: '💨',
        duration: 5000,
        color: Colors.powerups.speed,
        effect: 'speedMultiplier',
        value: 1.5
    },
    slow: {
        name: 'Slow Motion',
        icon: '💧',
        duration: 5000,
        color: Colors.powerups.slow,
        effect: 'speedMultiplier',
        value: 0.5
    },
    shield: {
        name: 'Shield',
        icon: '🛡️',
        duration: 8000,
        color: Colors.powerups.shield,
        effect: 'shield',
        value: true
    },
    multiplier: {
        name: 'Score Multiplier',
        icon: '⭐',
        duration: 10000,
        color: Colors.powerups.multiplier,
        effect: 'scoreMultiplier',
        value: 2
    },
    shrink: {
        name: 'Shrink',
        icon: '📉',
        duration: 0, // Instant
        color: Colors.powerups.shrink,
        effect: 'shrink',
        value: 3
    },
    ghost: {
        name: 'Ghost',
        icon: '👻',
        duration: 6000,
        color: Colors.powerups.ghost,
        effect: 'ghost',
        value: true
    },
    magnet: {
        name: 'Magnet',
        icon: '🧲',
        duration: 7000,
        color: Colors.powerups.magnet,
        effect: 'magnet',
        value: true
    }
};

class PowerUpManager {
    constructor(gridWidth, gridHeight, cellSize) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.cellSize = cellSize;
        this.powerUp = null;
        this.availableTypes = [];
        this.spawnTimer = 0;
        this.despawnTimer = 0;
        this.activeEffects = {};
        this.animationFrame = 0;

        // Spawn timing
        this.minSpawnTime = 15000; // 15 seconds
        this.maxSpawnTime = 30000; // 30 seconds
        this.despawnTime = 10000;  // 10 seconds
    }

    setAvailableTypes(types) {
        this.availableTypes = types.filter(t => PowerUpTypes[t]);
    }

    reset() {
        this.powerUp = null;
        this.spawnTimer = 0;
        this.despawnTimer = 0;
        this.activeEffects = {};
        this.scheduleNextSpawn();
    }

    scheduleNextSpawn() {
        this.spawnTimer = Utils.randomInt(this.minSpawnTime, this.maxSpawnTime);
    }

    update(deltaTime, snake, obstacles = []) {
        this.animationFrame++;

        // Update active effects
        for (const effect in this.activeEffects) {
            this.activeEffects[effect].remaining -= deltaTime;
            if (this.activeEffects[effect].remaining <= 0) {
                this.removeEffect(effect, snake);
            }
        }

        // Handle powerup on field
        if (this.powerUp) {
            this.despawnTimer -= deltaTime;
            if (this.despawnTimer <= 0) {
                this.powerUp = null;
                this.scheduleNextSpawn();
            }
        } else if (this.availableTypes.length > 0) {
            // Spawn timer
            this.spawnTimer -= deltaTime;
            if (this.spawnTimer <= 0) {
                this.spawn(snake, obstacles);
            }
        }

        // Magnet effect - move prey toward snake
        if (this.activeEffects.magnet) {
            return true; // Signal that magnet is active
        }

        return false;
    }

    spawn(snake, obstacles = []) {
        if (this.availableTypes.length === 0) return null;

        let attempts = 0;
        let position;

        do {
            position = {
                x: Utils.randomInt(2, this.gridWidth - 3),
                y: Utils.randomInt(2, this.gridHeight - 3)
            };
            attempts++;
        } while (
            attempts < 100 &&
            (snake.checkCollisionAt(position.x, position.y) ||
             this.isObstacleAt(position.x, position.y, obstacles))
        );

        if (attempts >= 100) {
            this.scheduleNextSpawn();
            return null;
        }

        const type = Utils.randomElement(this.availableTypes);

        this.powerUp = {
            x: position.x,
            y: position.y,
            type: type,
            ...PowerUpTypes[type]
        };

        this.despawnTimer = this.despawnTime;
        return this.powerUp;
    }

    isObstacleAt(x, y, obstacles) {
        for (const obs of obstacles) {
            if (obs.x === x && obs.y === y) return true;
        }
        return false;
    }

    checkCollision(headX, headY, snake) {
        if (!this.powerUp) return null;

        if (this.powerUp.x === headX && this.powerUp.y === headY) {
            const collected = { ...this.powerUp };
            this.applyEffect(collected, snake);
            this.powerUp = null;
            this.scheduleNextSpawn();
            return collected;
        }

        return null;
    }

    applyEffect(powerUp, snake) {
        const effect = powerUp.effect;
        const value = powerUp.value;
        const duration = powerUp.duration;

        switch (effect) {
            case 'speedMultiplier':
                this.activeEffects.speed = { value, remaining: duration };
                snake.speedMultiplier = value;
                break;

            case 'shield':
                this.activeEffects.shield = { value, remaining: duration };
                snake.hasShield = true;
                break;

            case 'scoreMultiplier':
                this.activeEffects.scoreMultiplier = { value, remaining: duration };
                break;

            case 'shrink':
                snake.shrink(value);
                break;

            case 'ghost':
                this.activeEffects.ghost = { value, remaining: duration };
                snake.isGhost = true;
                break;

            case 'magnet':
                this.activeEffects.magnet = { value, remaining: duration };
                break;
        }
    }

    removeEffect(effect, snake) {
        switch (effect) {
            case 'speed':
                snake.speedMultiplier = 1;
                break;
            case 'shield':
                snake.hasShield = false;
                break;
            case 'ghost':
                snake.isGhost = false;
                break;
        }

        delete this.activeEffects[effect];
    }

    getScoreMultiplier() {
        return this.activeEffects.scoreMultiplier ? this.activeEffects.scoreMultiplier.value : 1;
    }

    getSpeedMultiplier() {
        return this.activeEffects.speed ? this.activeEffects.speed.value : 1;
    }

    isMagnetActive() {
        return !!this.activeEffects.magnet;
    }

    getActiveEffect() {
        // Return the first active effect for HUD display
        for (const effect in this.activeEffects) {
            return {
                name: effect,
                remaining: this.activeEffects[effect].remaining,
                icon: this.getEffectIcon(effect)
            };
        }
        return null;
    }

    getEffectIcon(effect) {
        switch (effect) {
            case 'speed': return PowerUpTypes.speed.icon;
            case 'shield': return PowerUpTypes.shield.icon;
            case 'scoreMultiplier': return PowerUpTypes.multiplier.icon;
            case 'ghost': return PowerUpTypes.ghost.icon;
            case 'magnet': return PowerUpTypes.magnet.icon;
            default: return '✨';
        }
    }

    draw(ctx) {
        if (!this.powerUp) return;

        const x = this.powerUp.x * this.cellSize;
        const y = this.powerUp.y * this.cellSize;
        const size = this.cellSize;

        // Pulsing animation
        const pulse = 1 + Math.sin(this.animationFrame * 0.15) * 0.1;
        const drawSize = size * pulse;
        const offset = (size - drawSize) / 2;

        // Glow effect
        ctx.shadowColor = this.powerUp.color;
        ctx.shadowBlur = 10 + Math.sin(this.animationFrame * 0.1) * 5;

        // Background circle
        ctx.fillStyle = this.powerUp.color;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, drawSize/2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner circle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, drawSize/3 - 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Despawn indicator (shrinking ring)
        if (this.despawnTimer < 5000) {
            const progress = this.despawnTimer / 5000;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2 + 3, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * progress);
            ctx.stroke();
        }
    }
}
