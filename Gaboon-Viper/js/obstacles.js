// Obstacle system for Gaboon Viper game

const ObstacleTypes = {
    rock: {
        name: 'Rock',
        deadly: true,
        color: Colors.obstacles.rock,
        static: true
    },
    tree: {
        name: 'Acacia Tree',
        deadly: true,
        color: Colors.obstacles.tree,
        static: true
    },
    bone: {
        name: 'Bones',
        deadly: true,
        color: Colors.obstacles.bone,
        static: true
    },
    cactus: {
        name: 'Cactus',
        deadly: true,
        color: Colors.obstacles.cactus,
        static: true
    },
    scorpion: {
        name: 'Scorpion',
        deadly: true,
        color: Colors.obstacles.scorpion,
        static: false
    },
    eagle: {
        name: 'Eagle Shadow',
        deadly: true,
        color: 'rgba(0, 0, 0, 0.4)',
        static: false
    },
    tumbleweed: {
        name: 'Tumbleweed',
        deadly: false, // Just pushes
        color: '#8B7355',
        static: false
    }
};

class ObstacleManager {
    constructor(gridWidth, gridHeight, cellSize) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.cellSize = cellSize;
        this.staticObstacles = [];
        this.dynamicObstacles = [];
        this.animationFrame = 0;
        this.fogOfWar = false;
        this.visibilityRadius = 10;
    }

    reset() {
        this.staticObstacles = [];
        this.dynamicObstacles = [];
    }

    loadLevel(levelConfig) {
        this.reset();

        // Load static obstacles
        if (levelConfig.staticObstacles) {
            for (const obsGroup of levelConfig.staticObstacles) {
                for (const pos of obsGroup.positions) {
                    this.staticObstacles.push({
                        x: pos[0],
                        y: pos[1],
                        type: obsGroup.type,
                        ...ObstacleTypes[obsGroup.type]
                    });
                }
            }
        }

        // Load dynamic obstacles
        if (levelConfig.dynamicObstacles) {
            for (const dynObs of levelConfig.dynamicObstacles) {
                for (let i = 0; i < (dynObs.count || 1); i++) {
                    this.spawnDynamicObstacle(dynObs);
                }
            }
        }

        // Set fog of war
        this.fogOfWar = levelConfig.fogOfWar || false;
        this.visibilityRadius = levelConfig.visibilityRadius || 10;
    }

    spawnDynamicObstacle(config) {
        const type = config.type;
        let x, y;
        let attempts = 0;

        do {
            x = Utils.randomInt(3, this.gridWidth - 4);
            y = Utils.randomInt(3, this.gridHeight - 4);
            attempts++;
        } while (attempts < 50 && this.isOccupied(x, y));

        const obstacle = {
            x: x,
            y: y,
            type: type,
            speed: config.speed || 0.5,
            hidden: config.hidden || false,
            patrolRadius: config.patrolRadius || 5,
            startX: x,
            startY: y,
            direction: Utils.randomElement([
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ]),
            moveTimer: 0,
            ...ObstacleTypes[type]
        };

        this.dynamicObstacles.push(obstacle);
    }

    isOccupied(x, y) {
        for (const obs of this.staticObstacles) {
            if (obs.x === x && obs.y === y) return true;
        }
        for (const obs of this.dynamicObstacles) {
            if (Math.floor(obs.x) === x && Math.floor(obs.y) === y) return true;
        }
        return false;
    }

    getAllObstacles() {
        const all = [...this.staticObstacles];
        for (const dyn of this.dynamicObstacles) {
            all.push({ x: Math.floor(dyn.x), y: Math.floor(dyn.y), ...dyn });
        }
        return all;
    }

    update(deltaTime, snake) {
        this.animationFrame++;

        // Update dynamic obstacles
        for (const obs of this.dynamicObstacles) {
            obs.moveTimer += deltaTime;

            const moveInterval = 1000 / obs.speed;

            if (obs.moveTimer >= moveInterval) {
                obs.moveTimer = 0;

                switch (obs.type) {
                    case 'scorpion':
                        this.updateScorpion(obs, snake);
                        break;
                    case 'eagle':
                        this.updateEagle(obs);
                        break;
                    case 'tumbleweed':
                        this.updateTumbleweed(obs);
                        break;
                }
            }
        }
    }

    updateScorpion(obs, snake) {
        // Move toward snake slowly
        const dx = snake.head.x - obs.x;
        const dy = snake.head.y - obs.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 2) {
            // Random movement with slight bias toward snake
            if (Math.random() < 0.3) {
                obs.x += Math.sign(dx);
            } else if (Math.random() < 0.5) {
                obs.y += Math.sign(dy);
            } else {
                // Random direction
                const dir = Utils.randomElement([
                    { x: 1, y: 0 }, { x: -1, y: 0 },
                    { x: 0, y: 1 }, { x: 0, y: -1 }
                ]);
                obs.x += dir.x;
                obs.y += dir.y;
            }
        }

        // Keep in bounds
        obs.x = Utils.clamp(obs.x, 1, this.gridWidth - 2);
        obs.y = Utils.clamp(obs.y, 1, this.gridHeight - 2);
    }

    updateEagle(obs) {
        // Circular patrol pattern
        const angle = this.animationFrame * 0.02;
        obs.x = obs.startX + Math.cos(angle) * obs.patrolRadius;
        obs.y = obs.startY + Math.sin(angle) * obs.patrolRadius;

        // Keep in bounds
        obs.x = Utils.clamp(obs.x, 1, this.gridWidth - 2);
        obs.y = Utils.clamp(obs.y, 1, this.gridHeight - 2);
    }

    updateTumbleweed(obs) {
        // Move in one direction, wrap around
        obs.x += obs.direction.x;
        obs.y += obs.direction.y;

        // Wrap around screen
        if (obs.x < 0) obs.x = this.gridWidth - 1;
        if (obs.x >= this.gridWidth) obs.x = 0;
        if (obs.y < 0) obs.y = this.gridHeight - 1;
        if (obs.y >= this.gridHeight) obs.y = 0;
    }

    checkCollision(headX, headY, hasShield) {
        // Check static obstacles
        for (const obs of this.staticObstacles) {
            if (obs.x === headX && obs.y === headY && obs.deadly) {
                return hasShield ? 'blocked' : 'death';
            }
        }

        // Check dynamic obstacles
        for (const obs of this.dynamicObstacles) {
            const obsX = Math.floor(obs.x);
            const obsY = Math.floor(obs.y);

            if (obsX === headX && obsY === headY) {
                if (obs.deadly) {
                    return hasShield ? 'blocked' : 'death';
                }
            }
        }

        return null;
    }

    draw(ctx, snakeHead) {
        // Draw static obstacles
        for (const obs of this.staticObstacles) {
            if (this.fogOfWar && !this.isVisible(obs.x, obs.y, snakeHead)) {
                continue;
            }
            this.drawObstacle(ctx, obs, obs.x, obs.y);
        }

        // Draw dynamic obstacles
        for (const obs of this.dynamicObstacles) {
            const drawX = obs.x;
            const drawY = obs.y;

            if (this.fogOfWar && obs.hidden && !this.isVisible(drawX, drawY, snakeHead)) {
                continue;
            }

            this.drawDynamicObstacle(ctx, obs, drawX, drawY);
        }

        // Draw fog of war
        if (this.fogOfWar) {
            this.drawFogOfWar(ctx, snakeHead);
        }
    }

    isVisible(x, y, snakeHead) {
        const dx = x - snakeHead.x;
        const dy = y - snakeHead.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.visibilityRadius;
    }

    drawObstacle(ctx, obs, x, y) {
        const px = x * this.cellSize;
        const py = y * this.cellSize;
        const size = this.cellSize;

        switch (obs.type) {
            case 'rock':
                this.drawRock(ctx, px, py, size);
                break;
            case 'tree':
                this.drawTree(ctx, px, py, size);
                break;
            case 'bone':
                this.drawBone(ctx, px, py, size);
                break;
            case 'cactus':
                this.drawCactus(ctx, px, py, size);
                break;
            default:
                ctx.fillStyle = obs.color;
                ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
        }
    }

    drawDynamicObstacle(ctx, obs, x, y) {
        const px = x * this.cellSize;
        const py = y * this.cellSize;
        const size = this.cellSize;

        switch (obs.type) {
            case 'scorpion':
                this.drawScorpion(ctx, px, py, size);
                break;
            case 'eagle':
                this.drawEagle(ctx, px, py, size);
                break;
            case 'tumbleweed':
                this.drawTumbleweed(ctx, px, py, size);
                break;
        }
    }

    drawRock(ctx, x, y, size) {
        ctx.fillStyle = Colors.obstacles.rock;

        // Main rock body
        ctx.beginPath();
        ctx.moveTo(x + size * 0.2, y + size * 0.8);
        ctx.lineTo(x + size * 0.1, y + size * 0.5);
        ctx.lineTo(x + size * 0.3, y + size * 0.2);
        ctx.lineTo(x + size * 0.6, y + size * 0.15);
        ctx.lineTo(x + size * 0.85, y + size * 0.35);
        ctx.lineTo(x + size * 0.9, y + size * 0.7);
        ctx.lineTo(x + size * 0.7, y + size * 0.85);
        ctx.closePath();
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + size * 0.4, y + size * 0.35, size * 0.15, size * 0.1, -0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTree(ctx, x, y, size) {
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + size * 0.35, y + size * 0.5, size * 0.3, size * 0.5);

        // Canopy (acacia-style flat top)
        ctx.fillStyle = Colors.obstacles.tree;
        ctx.beginPath();
        ctx.ellipse(x + size/2, y + size * 0.35, size * 0.45, size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Darker patches
        ctx.fillStyle = 'rgba(0, 80, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(x + size * 0.3, y + size * 0.35, size * 0.12, 0, Math.PI * 2);
        ctx.arc(x + size * 0.65, y + size * 0.3, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBone(ctx, x, y, size) {
        ctx.fillStyle = Colors.obstacles.bone;
        ctx.strokeStyle = '#D3D3D3';
        ctx.lineWidth = 1;

        // Bone shape
        ctx.beginPath();
        ctx.ellipse(x + size * 0.2, y + size * 0.3, size * 0.15, size * 0.1, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(x + size * 0.8, y + size * 0.7, size * 0.15, size * 0.1, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Connecting shaft
        ctx.lineWidth = size * 0.12;
        ctx.strokeStyle = Colors.obstacles.bone;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.25, y + size * 0.35);
        ctx.lineTo(x + size * 0.75, y + size * 0.65);
        ctx.stroke();
    }

    drawCactus(ctx, x, y, size) {
        ctx.fillStyle = Colors.obstacles.cactus;

        // Main stem
        ctx.beginPath();
        ctx.roundRect(x + size * 0.35, y + size * 0.2, size * 0.3, size * 0.75, 5);
        ctx.fill();

        // Arms
        ctx.beginPath();
        ctx.roundRect(x + size * 0.1, y + size * 0.35, size * 0.25, size * 0.12, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(x + size * 0.1, y + size * 0.25, size * 0.12, size * 0.22, 3);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(x + size * 0.65, y + size * 0.45, size * 0.25, size * 0.12, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(x + size * 0.78, y + size * 0.35, size * 0.12, size * 0.22, 3);
        ctx.fill();

        // Spines (dots)
        ctx.fillStyle = '#90EE90';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(x + size * 0.5, y + size * (0.25 + i * 0.13), 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawScorpion(ctx, x, y, size) {
        ctx.fillStyle = Colors.obstacles.scorpion;

        // Body
        ctx.beginPath();
        ctx.ellipse(x + size/2, y + size * 0.55, size * 0.25, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(x + size * 0.25, y + size * 0.55, size * 0.12, size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail (curved up)
        ctx.strokeStyle = Colors.obstacles.scorpion;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.75, y + size * 0.55);
        ctx.quadraticCurveTo(x + size * 0.95, y + size * 0.3, x + size * 0.85, y + size * 0.15);
        ctx.stroke();

        // Stinger
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(x + size * 0.85, y + size * 0.12, 3, 0, Math.PI * 2);
        ctx.fill();

        // Claws
        ctx.strokeStyle = Colors.obstacles.scorpion;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.2, y + size * 0.55);
        ctx.lineTo(x + size * 0.05, y + size * 0.35);
        ctx.lineTo(x + size * 0.15, y + size * 0.3);
        ctx.moveTo(x + size * 0.05, y + size * 0.35);
        ctx.lineTo(x, y + size * 0.4);
        ctx.stroke();
    }

    drawEagle(ctx, x, y, size) {
        // Shadow on ground
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x + size/2, y + size/2, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wing shapes in shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.moveTo(x + size/2, y + size * 0.3);
        ctx.lineTo(x - size * 0.1, y + size * 0.5);
        ctx.lineTo(x + size/2, y + size * 0.7);
        ctx.lineTo(x + size * 1.1, y + size * 0.5);
        ctx.closePath();
        ctx.fill();
    }

    drawTumbleweed(ctx, x, y, size) {
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 1.5;

        const cx = x + size/2;
        const cy = y + size/2;
        const radius = size * 0.4;

        // Draw tangled lines
        for (let i = 0; i < 12; i++) {
            const angle1 = (i / 12) * Math.PI * 2 + this.animationFrame * 0.05;
            const angle2 = angle1 + Math.PI * 0.7;

            ctx.beginPath();
            ctx.moveTo(
                cx + Math.cos(angle1) * radius,
                cy + Math.sin(angle1) * radius
            );
            ctx.quadraticCurveTo(
                cx + Math.cos(angle1 + 0.5) * radius * 0.3,
                cy + Math.sin(angle1 + 0.5) * radius * 0.3,
                cx + Math.cos(angle2) * radius,
                cy + Math.sin(angle2) * radius
            );
            ctx.stroke();
        }
    }

    drawFogOfWar(ctx, snakeHead) {
        const centerX = snakeHead.x * this.cellSize + this.cellSize/2;
        const centerY = snakeHead.y * this.cellSize + this.cellSize/2;
        const radius = this.visibilityRadius * this.cellSize;

        // Create radial gradient for fog
        const gradient = ctx.createRadialGradient(
            centerX, centerY, radius * 0.7,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, 'rgba(194, 178, 128, 0)');
        gradient.addColorStop(1, 'rgba(194, 178, 128, 0.9)');

        // Draw fog over entire canvas except visible area
        ctx.fillStyle = 'rgba(194, 178, 128, 0.85)';
        ctx.fillRect(0, 0, this.gridWidth * this.cellSize, this.gridHeight * this.cellSize);

        // Clear visible area
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // Add gradient edge
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
