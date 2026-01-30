// Food/Prey system for Gaboon Viper game

const PreyTypes = {
    mouse: {
        name: 'Desert Mouse',
        points: 10,
        rarity: 0.35,
        color: Colors.prey.mouse,
        size: 0.6
    },
    jerboa: {
        name: 'Jerboa',
        points: 15,
        rarity: 0.30,
        color: Colors.prey.jerboa,
        size: 0.65
    },
    lizard: {
        name: 'Lizard',
        points: 20,
        rarity: 0.15,
        color: Colors.prey.lizard,
        size: 0.7
    },
    hare: {
        name: 'Desert Hare',
        points: 25,
        rarity: 0.12,
        color: Colors.prey.hare,
        size: 0.8
    },
    fennec: {
        name: 'Fennec Fox Kit',
        points: 30,
        rarity: 0.06,
        color: Colors.prey.fennec,
        size: 0.85
    },
    golden: {
        name: 'Golden Prey',
        points: 50,
        rarity: 0.02,
        color: Colors.prey.golden,
        size: 0.75,
        glow: true
    }
};

class FoodManager {
    constructor(gridWidth, gridHeight, cellSize) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.cellSize = cellSize;
        this.food = null;
        this.availableTypes = ['mouse', 'jerboa'];
        this.animationFrame = 0;
    }

    setAvailableTypes(types) {
        this.availableTypes = types;
    }

    spawn(snake, obstacles = []) {
        // Find valid position
        let attempts = 0;
        let position;

        do {
            position = {
                x: Utils.randomInt(1, this.gridWidth - 2),
                y: Utils.randomInt(1, this.gridHeight - 2)
            };
            attempts++;
        } while (
            attempts < 100 &&
            (snake.checkCollisionAt(position.x, position.y) ||
             this.isObstacleAt(position.x, position.y, obstacles))
        );

        if (attempts >= 100) return null;

        // Select prey type based on rarity
        const type = this.selectPreyType();

        this.food = {
            x: position.x,
            y: position.y,
            type: type,
            ...PreyTypes[type]
        };

        return this.food;
    }

    selectPreyType() {
        // Filter available types and normalize rarities
        const available = this.availableTypes.filter(t => PreyTypes[t]);
        const totalRarity = available.reduce((sum, t) => sum + PreyTypes[t].rarity, 0);

        let random = Math.random() * totalRarity;
        for (const type of available) {
            random -= PreyTypes[type].rarity;
            if (random <= 0) return type;
        }

        return available[0];
    }

    isObstacleAt(x, y, obstacles) {
        for (const obs of obstacles) {
            if (obs.x === x && obs.y === y) return true;
        }
        return false;
    }

    checkCollision(headX, headY) {
        if (!this.food) return null;

        if (this.food.x === headX && this.food.y === headY) {
            const caught = { ...this.food };
            this.food = null;
            return caught;
        }

        return null;
    }

    update() {
        this.animationFrame++;
    }

    draw(ctx) {
        if (!this.food) return;

        const x = this.food.x * this.cellSize;
        const y = this.food.y * this.cellSize;
        const size = this.cellSize * this.food.size;
        const offset = (this.cellSize - size) / 2;

        // Glow effect for golden prey
        if (this.food.glow) {
            const glowSize = 4 + Math.sin(this.animationFrame * 0.1) * 2;
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = glowSize;
        }

        // Draw prey based on type
        this.drawPrey(ctx, x + offset, y + offset, size, this.food.type);

        ctx.shadowBlur = 0;
    }

    drawPrey(ctx, x, y, size, type) {
        const prey = PreyTypes[type];
        ctx.fillStyle = prey.color;

        switch (type) {
            case 'mouse':
                this.drawMouse(ctx, x, y, size);
                break;
            case 'jerboa':
                this.drawJerboa(ctx, x, y, size);
                break;
            case 'lizard':
                this.drawLizard(ctx, x, y, size);
                break;
            case 'hare':
                this.drawHare(ctx, x, y, size);
                break;
            case 'fennec':
                this.drawFennec(ctx, x, y, size);
                break;
            case 'golden':
                this.drawGolden(ctx, x, y, size);
                break;
            default:
                // Simple circle fallback
                ctx.beginPath();
                ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
                ctx.fill();
        }
    }

    drawMouse(ctx, x, y, size) {
        // Body
        ctx.beginPath();
        ctx.ellipse(x + size/2, y + size/2, size/2, size/3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.arc(x + size * 0.3, y + size * 0.2, size/6, 0, Math.PI * 2);
        ctx.arc(x + size * 0.7, y + size * 0.2, size/6, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + size * 0.35, y + size * 0.4, 2, 0, Math.PI * 2);
        ctx.arc(x + size * 0.65, y + size * 0.4, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawJerboa(ctx, x, y, size) {
        // Body (round)
        ctx.beginPath();
        ctx.arc(x + size/2, y + size * 0.55, size/3, 0, Math.PI * 2);
        ctx.fill();

        // Big ears
        ctx.beginPath();
        ctx.ellipse(x + size * 0.3, y + size * 0.2, size/8, size/4, -0.3, 0, Math.PI * 2);
        ctx.ellipse(x + size * 0.7, y + size * 0.2, size/8, size/4, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Long tail
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + size/2, y + size * 0.8);
        ctx.quadraticCurveTo(x + size * 0.8, y + size, x + size, y + size * 0.9);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + size * 0.4, y + size * 0.45, 2, 0, Math.PI * 2);
        ctx.arc(x + size * 0.6, y + size * 0.45, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawLizard(ctx, x, y, size) {
        // Body
        ctx.beginPath();
        ctx.ellipse(x + size/2, y + size/2, size/2.5, size/4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(x + size * 0.15, y + size/2, size/5, size/6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.beginPath();
        ctx.moveTo(x + size * 0.75, y + size/2);
        ctx.quadraticCurveTo(x + size, y + size * 0.4, x + size * 1.1, y + size * 0.6);
        ctx.lineWidth = 3;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.stroke();

        // Legs
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.3, y + size/2);
        ctx.lineTo(x + size * 0.2, y + size * 0.2);
        ctx.moveTo(x + size * 0.3, y + size/2);
        ctx.lineTo(x + size * 0.2, y + size * 0.8);
        ctx.moveTo(x + size * 0.65, y + size/2);
        ctx.lineTo(x + size * 0.75, y + size * 0.2);
        ctx.moveTo(x + size * 0.65, y + size/2);
        ctx.lineTo(x + size * 0.75, y + size * 0.8);
        ctx.stroke();

        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + size * 0.1, y + size * 0.45, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawHare(ctx, x, y, size) {
        // Body
        ctx.beginPath();
        ctx.ellipse(x + size/2, y + size * 0.6, size/2.5, size/3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(x + size * 0.25, y + size * 0.4, size/4, 0, Math.PI * 2);
        ctx.fill();

        // Long ears
        ctx.beginPath();
        ctx.ellipse(x + size * 0.15, y + size * 0.1, size/10, size/3, -0.2, 0, Math.PI * 2);
        ctx.ellipse(x + size * 0.35, y + size * 0.1, size/10, size/3, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + size * 0.2, y + size * 0.35, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFennec(ctx, x, y, size) {
        // Body
        ctx.beginPath();
        ctx.ellipse(x + size/2, y + size * 0.6, size/2.5, size/3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(x + size * 0.25, y + size * 0.45, size/4, 0, Math.PI * 2);
        ctx.fill();

        // Big ears (fennec characteristic)
        ctx.beginPath();
        ctx.moveTo(x + size * 0.1, y + size * 0.35);
        ctx.lineTo(x + size * 0.05, y);
        ctx.lineTo(x + size * 0.25, y + size * 0.25);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + size * 0.35, y + size * 0.3);
        ctx.lineTo(x + size * 0.45, y);
        ctx.lineTo(x + size * 0.5, y + size * 0.25);
        ctx.closePath();
        ctx.fill();

        // Snout
        ctx.beginPath();
        ctx.ellipse(x + size * 0.1, y + size * 0.5, size/8, size/10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + size * 0.2, y + size * 0.4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.beginPath();
        ctx.arc(x + size * 0.05, y + size * 0.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGolden(ctx, x, y, size) {
        // Glowing golden scarab beetle
        const cx = x + size/2;
        const cy = y + size/2;

        // Body
        ctx.beginPath();
        ctx.ellipse(cx, cy, size/2.5, size/3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(cx - size/3, cy, size/5, 0, Math.PI * 2);
        ctx.fill();

        // Wing line
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - size/6, cy - size/4);
        ctx.lineTo(cx - size/6, cy + size/4);
        ctx.stroke();

        // Legs
        ctx.lineWidth = 1.5;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * size/5, cy);
            ctx.lineTo(cx + i * size/5 - size/6, cy + size/3);
            ctx.moveTo(cx + i * size/5, cy);
            ctx.lineTo(cx + i * size/5 + size/6, cy + size/3);
            ctx.stroke();
        }
    }
}
