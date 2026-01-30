// Snake (Gaboon Viper) logic

class Snake {
    constructor(gridWidth, gridHeight, cellSize) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.cellSize = cellSize;
        this.reset();
    }

    reset() {
        // Start in the middle-left of the grid
        const startX = Math.floor(this.gridWidth / 4);
        const startY = Math.floor(this.gridHeight / 2);

        this.segments = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];

        this.direction = { x: 1, y: 0 }; // Moving right
        this.nextDirection = { x: 1, y: 0 };
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
        // Prevent reversing into self
        if (this.direction.x + dx !== 0 || this.direction.y + dy !== 0) {
            this.nextDirection = { x: dx, y: dy };
        }
    }

    update() {
        if (!this.alive) return false;

        // Apply queued direction
        this.direction = { ...this.nextDirection };

        // Calculate new head position
        const newHead = {
            x: this.head.x + this.direction.x,
            y: this.head.y + this.direction.y
        };

        // Check wall collision
        if (!Utils.inBounds(newHead.x, newHead.y, this.gridWidth, this.gridHeight)) {
            if (!this.hasShield) {
                this.alive = false;
                return false;
            }
            this.hasShield = false;
            // Wrap around instead of dying with shield
            newHead.x = (newHead.x + this.gridWidth) % this.gridWidth;
            newHead.y = (newHead.y + this.gridHeight) % this.gridHeight;
        }

        // Check self collision (if not ghost mode)
        if (!this.isGhost && this.checkSelfCollision(newHead)) {
            if (!this.hasShield) {
                this.alive = false;
                return false;
            }
            this.hasShield = false;
        }

        // Move snake
        this.segments.unshift(newHead);

        // Handle growth
        if (this.growing > 0) {
            this.growing--;
        } else {
            this.segments.pop();
        }

        return true;
    }

    checkSelfCollision(pos) {
        // Skip the first segment (head) when checking
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

        // Draw body segments (from tail to head)
        for (let i = this.segments.length - 1; i >= 0; i--) {
            const seg = this.segments[i];
            const x = seg.x * cellSize;
            const y = seg.y * cellSize;

            // Gaboon Viper pattern colors
            const isEven = i % 2 === 0;

            if (i === 0) {
                // Draw head
                this.drawHead(ctx, x, y);
            } else {
                // Draw body segment with pattern
                this.drawBodySegment(ctx, x, y, i, isEven);
            }
        }

        // Draw ghost effect overlay
        if (this.isGhost) {
            ctx.globalAlpha = 0.3;
            for (const seg of this.segments) {
                ctx.fillStyle = '#E1BEE7';
                ctx.fillRect(seg.x * cellSize, seg.y * cellSize, cellSize, cellSize);
            }
            ctx.globalAlpha = 1;
        }

        // Draw shield indicator
        if (this.hasShield) {
            ctx.strokeStyle = '#4FC3F7';
            ctx.lineWidth = 3;
            const headX = this.head.x * cellSize;
            const headY = this.head.y * cellSize;
            ctx.beginPath();
            ctx.arc(headX + cellSize/2, headY + cellSize/2, cellSize * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawHead(ctx, x, y) {
        const size = this.cellSize;
        const padding = 1;

        // Leaf-shaped head base
        ctx.fillStyle = Colors.viper.primary;
        ctx.beginPath();

        // Direction-aware head shape
        const cx = x + size / 2;
        const cy = y + size / 2;

        ctx.moveTo(cx + this.direction.x * size/2, cy + this.direction.y * size/2);

        if (this.direction.x !== 0) {
            // Horizontal movement
            ctx.lineTo(cx - this.direction.x * size/3, cy - size/3);
            ctx.lineTo(cx - this.direction.x * size/2, cy);
            ctx.lineTo(cx - this.direction.x * size/3, cy + size/3);
        } else {
            // Vertical movement
            ctx.lineTo(cx - size/3, cy - this.direction.y * size/3);
            ctx.lineTo(cx, cy - this.direction.y * size/2);
            ctx.lineTo(cx + size/3, cy - this.direction.y * size/3);
        }

        ctx.closePath();
        ctx.fill();

        // Head pattern
        ctx.fillStyle = Colors.viper.secondary;
        ctx.beginPath();
        ctx.arc(cx, cy, size/4, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        const eyeOffset = size / 4;
        if (this.direction.x !== 0) {
            ctx.beginPath();
            ctx.arc(cx + this.direction.x * size/6, cy - eyeOffset/2, 2, 0, Math.PI * 2);
            ctx.arc(cx + this.direction.x * size/6, cy + eyeOffset/2, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(cx - eyeOffset/2, cy + this.direction.y * size/6, 2, 0, Math.PI * 2);
            ctx.arc(cx + eyeOffset/2, cy + this.direction.y * size/6, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawBodySegment(ctx, x, y, index, isEven) {
        const size = this.cellSize;
        const padding = 1;

        // Base color alternating pattern
        if (isEven) {
            ctx.fillStyle = Colors.viper.primary;
        } else {
            ctx.fillStyle = Colors.viper.secondary;
        }

        // Draw rounded rectangle for segment
        const radius = 4;
        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, size - padding * 2, size - padding * 2, radius);
        ctx.fill();

        // Add geometric pattern (Gaboon Viper characteristic)
        ctx.fillStyle = Colors.viper.pattern;

        // Diamond pattern
        const cx = x + size / 2;
        const cy = y + size / 2;
        const patternSize = size / 4;

        ctx.beginPath();
        ctx.moveTo(cx, cy - patternSize);
        ctx.lineTo(cx + patternSize, cy);
        ctx.lineTo(cx, cy + patternSize);
        ctx.lineTo(cx - patternSize, cy);
        ctx.closePath();
        ctx.fill();
    }
}
