// Utility functions for Gaboon Viper game

const Utils = {
    // Random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Random element from array
    randomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    // Distance between two points
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    // Check if two rectangles collide
    rectCollision(r1, r2) {
        return r1.x < r2.x + r2.width &&
               r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height &&
               r1.y + r1.height > r2.y;
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    // Lerp (linear interpolation)
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    // Format number with leading zeros
    padNumber(num, size) {
        let s = num.toString();
        while (s.length < size) s = '0' + s;
        return s;
    },

    // Load from localStorage
    loadData(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    // Save to localStorage
    saveData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    },

    // Convert grid position to canvas coordinates
    gridToCanvas(gridX, gridY, cellSize) {
        return {
            x: gridX * cellSize,
            y: gridY * cellSize
        };
    },

    // Convert canvas coordinates to grid position
    canvasToGrid(canvasX, canvasY, cellSize) {
        return {
            x: Math.floor(canvasX / cellSize),
            y: Math.floor(canvasY / cellSize)
        };
    },

    // Check if position is within grid bounds
    inBounds(x, y, gridWidth, gridHeight) {
        return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
    },

    // Shuffle array (Fisher-Yates)
    shuffle(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    },

    // Throttle function calls
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Debounce function calls
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
};

// Color palette for the game
const Colors = {
    sand: ['#D4A574', '#C4956A', '#E8D4B8'],
    viper: {
        primary: '#8B6914',
        secondary: '#D4A574',
        accent: '#4A3520',
        pattern: '#654321'
    },
    // Black Mamba - dark gray/olive with coffin-shaped head
    mamba: {
        primary: '#2d2d2d',
        secondary: '#454545',
        accent: '#1a1a1a'
    },
    ui: {
        gold: '#DAA520',
        brown: '#4A3520',
        cream: '#E8D4B8'
    },
    prey: {
        mouse: '#A0826D',
        jerboa: '#C4956A',
        lizard: '#6B8E23',
        fennec: '#F4A460',
        hare: '#D2B48C',
        golden: '#FFD700'
    },
    powerups: {
        speed: '#FF6B35',
        slow: '#4FC3F7',
        shield: '#8B4513',
        multiplier: '#FFD700',
        shrink: '#9E9E9E',
        ghost: '#E1BEE7',
        magnet: '#607D8B'
    },
    obstacles: {
        rock: '#8B7355',
        tree: '#228B22',
        bone: '#F5F5DC',
        cactus: '#2E8B57',
        scorpion: '#2F1B14'
    }
};
