// Snake (Gaboon Viper) logic - Optimized

class Snake {
    constructor(gridWidth, gridHeight, cellSize, isAI = false) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.cellSize = cellSize;
        this.isAI = isAI;
        this.reset();
    }

    reset() {
        // Start position depends on if AI or player
        const startX = this.isAI ? Math.floor(this.gridWidth * 3 / 4) : Math.floor(this.gridWidth / 4);
        const startY = Math.floor(this.gridHeight / 2);
        const dir = this.isAI ? -1 : 1;

        this.segments = [
            { x: startX, y: startY },
            { x: startX - dir, y: startY },
            { x: startX - dir * 2, y: startY }
        ];

        this.direction = { x: dir, y: 0 };
        this.nextDirection = { x: dir, y: 0 };
        this.growing = 0;
        this.alive = true;

        // Power-up states
        this.hasShield = false;
        this.isGhost = false;
        this.speedMultiplier = 1;
    }

    get head() {
        return this.segments[0];
    }

    get length() {
        return this.segments.length;
    }

    setDirection(dx, dy) {
        if (this.direction.x + dx !== 0 || this.direction.y + dy !== 0) {
            this.nextDirection = { x: dx, y: dy };
        }
    }

    update() {
        if (!this.alive) return false;

        this.direction = { ...this.nextDirection };

        const newHead = {
            x: this.head.x + this.direction.x,
            y: this.head.y + this.direction.y
        };

        if (!Utils.inBounds(newHead.x, newHead.y, this.gridWidth, this.gridHeight)) {
            if (!this.hasShield) {
                this.alive = false;
                return false;
            }
            this.hasShield = false;
            newHead.x = (newHead.x + this.gridWidth) % this.gridWidth;
            newHead.y = (newHead.y + this.gridHeight) % this.gridHeight;
        }

        if (!this.isGhost && this.checkSelfCollision(newHead)) {
            if (!this.hasShield) {
                this.alive = false;
                return false;
            }
            this.hasShield = false;
        }

        this.segments.unshift(newHead);

        if (this.growing > 0) {
            this.growing--;
        } else {
            this.segments.pop();
        }

        return true;
    }

    checkSelfCollision(pos) {
        for (let i = 1; i < this.segments.length; i++) {
            if (this.segments[i].x === pos.x && this.segments[i].y === pos.y) {
                return true;
            }
        }
        return false;
    }

    checkCollisionAt(x, y) {
        for (const seg of this.segments) {
            if (seg.x === x && seg.y === y) {
                return true;
            }
        }
        return false;
    }

    checkCollisionWithSnake(otherSnake) {
        for (const seg of otherSnake.segments) {
            if (this.head.x === seg.x && this.head.y === seg.y) {
                return true;
            }
        }
        return false;
    }

    grow(amount = 1) {
        this.growing += amount;
    }

    shrink(amount = 3) {
        const minLength = 3;
        const removeCount = Math.min(amount, this.segments.length - minLength);
        if (removeCount > 0) {
            this.segments.splice(-removeCount, removeCount);
        }
    }

    draw(ctx) {
        const cellSize = this.cellSize;
        const colors = this.isAI ? Colors.mamba : Colors.viper;

        // Draw all body segments in one batch for performance
        for (let i = this.segments.length - 1; i >= 0; i--) {
            const seg = this.segments[i];
            const x = seg.x * cellSize;
            const y = seg.y * cellSize;

            if (i === 0) {
                this.drawHead(ctx, x, y, colors);
            } else {
                this.drawBodySegment(ctx, x, y, i, colors);
            }
        }

        // Ghost effect
        if (this.isGhost) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#E1BEE7';
            for (const seg of this.segments) {
                ctx.fillRect(seg.x * cellSize + 2, seg.y * cellSize + 2, cellSize - 4, cellSize - 4);
            }
            ctx.globalAlpha = 1;
        }

        // Shield indicator
        if (this.hasShield) {
            ctx.strokeStyle = '#4FC3F7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.head.x * cellSize + cellSize/2, this.head.y * cellSize + cellSize/2, cellSize * 0.7, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawHead(ctx, x, y, colors) {
        const size = this.cellSize;
        const cx = x + size / 2;
        const cy = y + size / 2;

        // Simplified head - just a rounded rectangle pointing in direction
        ctx.fillStyle = colors.primary;

        if (this.isAI) {
            // Black Mamba - sleeker, more angular head
            ctx.beginPath();
            ctx.moveTo(cx + this.direction.x * size/2, cy + this.direction.y * size/2);
            if (this.direction.x !== 0) {
                ctx.lineTo(cx - this.direction.x * size/2, cy - size/4);
                ctx.lineTo(cx - this.direction.x * size/2, cy + size/4);
            } else {
                ctx.lineTo(cx - size/4, cy - this.direction.y * size/2);
                ctx.lineTo(cx + size/4, cy - this.direction.y * size/2);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            // Gaboon Viper - broader leaf-shaped head
            ctx.beginPath();
            ctx.moveTo(cx + this.direction.x * size/2, cy + this.direction.y * size/2);
            if (this.direction.x !== 0) {
                ctx.lineTo(cx - this.direction.x * size/3, cy - size/3);
                ctx.lineTo(cx - this.direction.x * size/2, cy);
                ctx.lineTo(cx - this.direction.x * size/3, cy + size/3);
            } else {
                ctx.lineTo(cx - size/3, cy - this.direction.y * size/3);
                ctx.lineTo(cx, cy - this.direction.y * size/2);
                ctx.lineTo(cx + size/3, cy - this.direction.y * size/3);
            }
            ctx.closePath();
            ctx.fill();

            // Head pattern for Gaboon
            ctx.fillStyle = colors.secondary;
            ctx.beginPath();
            ctx.arc(cx, cy, size/5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Eyes
        ctx.fillStyle = this.isAI ? '#FFF' : '#000';
        const eyeSize = this.isAI ? 1.5 : 2;
        if (this.direction.x !== 0) {
            ctx.fillRect(cx + this.direction.x * size/6 - eyeSize/2, cy - size/6 - eyeSize/2, eyeSize, eyeSize);
            ctx.fillRect(cx + this.direction.x * size/6 - eyeSize/2, cy + size/6 - eyeSize/2, eyeSize, eyeSize);
        } else {
            ctx.fillRect(cx - size/6 - eyeSize/2, cy + this.direction.y * size/6 - eyeSize/2, eyeSize, eyeSize);
            ctx.fillRect(cx + size/6 - eyeSize/2, cy + this.direction.y * size/6 - eyeSize/2, eyeSize, eyeSize);
        }
    }

    drawBodySegment(ctx, x, y, index, colors) {
        const size = this.cellSize;
        const isEven = index % 2 === 0;

        if (this.isAI) {
            // Black Mamba - solid dark with slight gradient feel
            ctx.fillStyle = isEven ? colors.primary : colors.secondary;
            ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        } else {
            // Gaboon Viper - patterned
            ctx.fillStyle = isEven ? colors.primary : colors.secondary;
            ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

            // Diamond pattern
            ctx.fillStyle = colors.pattern;
            const cx = x + size / 2;
            const cy = y + size / 2;
            const ps = size / 5;
            ctx.beginPath();
            ctx.moveTo(cx, cy - ps);
            ctx.lineTo(cx + ps, cy);
            ctx.lineTo(cx, cy + ps);
            ctx.lineTo(cx - ps, cy);
            ctx.closePath();
            ctx.fill();
        }
    }
}

// AI Snake (Black Mamba) - hunts the player
class AISnake extends Snake {
    constructor(gridWidth, gridHeight, cellSize) {
        super(gridWidth, gridHeight, cellSize, true);
        this.targetUpdateTimer = 0;
        this.targetUpdateInterval = 500; // Update target every 500ms
        this.currentTarget = null;
        this.difficulty = 0.7; // 0-1, higher = smarter
    }

    reset() {
        super.reset();
        this.currentTarget = null;
    }

    updateAI(deltaTime, playerSnake, food, obstacles) {
        this.targetUpdateTimer += deltaTime;

        if (this.targetUpdateTimer >= this.targetUpdateInterval) {
            this.targetUpdateTimer = 0;
            this.chooseTarget(playerSnake, food);
        }

        if (this.currentTarget) {
            this.moveTowardTarget(playerSnake, obstacles);
        }
    }

    chooseTarget(playerSnake, food) {
        // Decide whether to chase player or food
        const distToPlayer = Utils.distance(
            this.head.x, this.head.y,
            playerSnake.head.x, playerSnake.head.y
        );

        const distToFood = food ? Utils.distance(
            this.head.x, this.head.y,
            food.x, food.y
        ) : Infinity;

        // More aggressive when player is close or AI is longer
        const aggression = this.length > playerSnake.length ? 0.7 : 0.4;

        if (Math.random() < aggression && distToPlayer < 15) {
            // Chase player
            this.currentTarget = { x: playerSnake.head.x, y: playerSnake.head.y, type: 'player' };
        } else if (food) {
            // Go for food
            this.currentTarget = { x: food.x, y: food.y, type: 'food' };
        } else {
            // Wander
            this.currentTarget = {
                x: Utils.randomInt(5, this.gridWidth - 5),
                y: Utils.randomInt(5, this.gridHeight - 5),
                type: 'wander'
            };
        }
    }

    moveTowardTarget(playerSnake, obstacles) {
        const dx = this.currentTarget.x - this.head.x;
        const dy = this.currentTarget.y - this.head.y;

        let possibleMoves = [];

        // Determine possible moves (not reversing)
        if (this.direction.x !== 1) possibleMoves.push({ x: -1, y: 0 });
        if (this.direction.x !== -1) possibleMoves.push({ x: 1, y: 0 });
        if (this.direction.y !== 1) possibleMoves.push({ x: 0, y: -1 });
        if (this.direction.y !== -1) possibleMoves.push({ x: 0, y: 1 });

        // Filter out dangerous moves
        possibleMoves = possibleMoves.filter(move => {
            const newX = this.head.x + move.x;
            const newY = this.head.y + move.y;

            // Check bounds
            if (!Utils.inBounds(newX, newY, this.gridWidth, this.gridHeight)) return false;

            // Check self collision
            if (this.checkCollisionAt(newX, newY)) return false;

            // Check player collision (avoid player body, but head is ok if attacking)
            for (let i = 1; i < playerSnake.segments.length; i++) {
                if (playerSnake.segments[i].x === newX && playerSnake.segments[i].y === newY) {
                    return false;
                }
            }

            // Check obstacles
            if (obstacles) {
                for (const obs of obstacles) {
                    if (obs.x === newX && obs.y === newY && obs.deadly) return false;
                }
            }

            return true;
        });

        if (possibleMoves.length === 0) return;

        // Choose best move toward target (with some randomness based on difficulty)
        let bestMove = possibleMoves[0];
        let bestScore = -Infinity;

        for (const move of possibleMoves) {
            const newX = this.head.x + move.x;
            const newY = this.head.y + move.y;
            const newDist = Utils.distance(newX, newY, this.currentTarget.x, this.currentTarget.y);

            // Score: closer to target is better
            let score = -newDist;

            // Add randomness based on difficulty
            score += (1 - this.difficulty) * Utils.randomInt(-5, 5);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        this.setDirection(bestMove.x, bestMove.y);
    }

    setDifficulty(level) {
        // Increase difficulty with level
        this.difficulty = Math.min(0.9, 0.5 + level * 0.05);
        this.targetUpdateInterval = Math.max(200, 600 - level * 50);
    }
}

// Add Black Mamba colors to Colors object
Colors.mamba = {
    primary: '#1a1a1a',
    secondary: '#333333',
    accent: '#4a4a4a'
};
