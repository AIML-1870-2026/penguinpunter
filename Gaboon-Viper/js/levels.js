// Level definitions for Gaboon Viper game

const Levels = {
    levels: [
        // Level 1: Sandy Plains
        {
            id: 1,
            name: 'Sandy Plains',
            description: 'Open desert with minimal obstacles',
            targetScore: 100,
            timeLimit: null,
            speed: 150, // ms per tick (higher = slower)
            speedModifiers: { easy: 1.3, normal: 1, hard: 0.7 },
            preyTypes: ['mouse', 'jerboa'],
            powerUps: [],
            staticObstacles: [
                { type: 'rock', positions: [[5, 5], [15, 10], [25, 8], [35, 20]] }
            ],
            dynamicObstacles: [],
            background: 'sandy'
        },

        // Level 2: Rocky Outcrop
        {
            id: 2,
            name: 'Rocky Outcrop',
            description: 'Desert area with more rock formations',
            targetScore: 200,
            timeLimit: 120, // 2 minutes
            speed: 130,
            speedModifiers: { easy: 1.3, normal: 1, hard: 0.7 },
            preyTypes: ['mouse', 'jerboa', 'lizard', 'hare'],
            powerUps: ['speed'],
            staticObstacles: [
                { type: 'rock', positions: [[3, 3], [8, 7], [15, 5], [22, 12], [30, 8], [35, 15], [10, 20], [25, 22]] },
                { type: 'tree', positions: [[20, 10], [5, 18]] }
            ],
            dynamicObstacles: [
                { type: 'tumbleweed', count: 1, speed: 0.5 }
            ],
            background: 'rocky'
        },

        // Level 3: Oasis Edge
        {
            id: 3,
            name: 'Oasis Edge',
            description: 'Near a desert oasis with vegetation',
            targetScore: 350,
            goldenScarabs: 3,
            speed: 120,
            speedModifiers: { easy: 1.3, normal: 1, hard: 0.7 },
            preyTypes: ['mouse', 'jerboa', 'lizard', 'hare', 'fennec'],
            powerUps: ['speed', 'shield'],
            staticObstacles: [
                { type: 'tree', positions: [[5, 5], [7, 6], [10, 8], [30, 5], [32, 7], [28, 10]] },
                { type: 'rock', positions: [[15, 15], [20, 18], [25, 12]] }
            ],
            dynamicObstacles: [
                { type: 'scorpion', count: 2, speed: 0.3 }
            ],
            waterBoundary: { y: 25, side: 'bottom' },
            background: 'oasis'
        },

        // Level 4: Bone Valley
        {
            id: 4,
            name: 'Bone Valley',
            description: 'Area littered with ancient remains',
            targetScore: 500,
            speed: 100,
            speedModifiers: { easy: 1.3, normal: 1, hard: 0.7 },
            preyTypes: ['mouse', 'jerboa', 'lizard', 'hare', 'fennec', 'golden'],
            powerUps: ['speed', 'shield', 'ghost'],
            staticObstacles: [
                { type: 'bone', positions: [
                    [5, 5], [6, 5], [7, 5], [8, 5],
                    [5, 6], [8, 6],
                    [5, 10], [6, 10], [7, 10], [8, 10],
                    [20, 3], [21, 3], [22, 3],
                    [20, 4], [22, 4],
                    [20, 8], [21, 8], [22, 8],
                    [30, 12], [31, 12], [32, 12], [33, 12],
                    [30, 13], [33, 13],
                    [30, 18], [31, 18], [32, 18], [33, 18]
                ]},
                { type: 'rock', positions: [[15, 10], [25, 20]] }
            ],
            dynamicObstacles: [
                { type: 'scorpion', count: 3, speed: 0.5 },
                { type: 'eagle', count: 1, patrolRadius: 8 }
            ],
            background: 'bone'
        },

        // Level 5: Sandstorm Survival
        {
            id: 5,
            name: 'Sandstorm Survival',
            description: 'Open desert during a sandstorm',
            targetScore: 750,
            timeLimit: 180, // 3 minutes
            speed: 90,
            speedModifiers: { easy: 1.3, normal: 1, hard: 0.7 },
            preyTypes: ['mouse', 'jerboa', 'lizard', 'hare', 'fennec', 'golden'],
            powerUps: ['speed', 'shield', 'ghost', 'magnet'],
            staticObstacles: [
                { type: 'rock', positions: [[10, 10], [20, 15], [30, 8], [15, 22], [35, 18]] }
            ],
            dynamicObstacles: [
                { type: 'scorpion', count: 3, speed: 0.6, hidden: true },
                { type: 'sandstorm', frequency: 10 }
            ],
            fogOfWar: true,
            visibilityRadius: 6,
            background: 'sandstorm'
        },

        // Level 6: The Gauntlet
        {
            id: 6,
            name: 'The Gauntlet',
            description: 'Canyon passage through mountains',
            targetScore: 1000,
            speed: 80,
            speedModifiers: { easy: 1.2, normal: 1, hard: 0.8 },
            preyTypes: ['mouse', 'jerboa', 'lizard', 'hare', 'fennec', 'golden'],
            powerUps: ['speed', 'slow', 'shield', 'multiplier', 'shrink', 'ghost', 'magnet'],
            staticObstacles: [
                // Canyon walls
                { type: 'rock', positions: [
                    // Left wall
                    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
                    [1, 0], [1, 1], [1, 2],
                    [2, 0], [2, 1],
                    // Right wall
                    [39, 0], [39, 1], [39, 2], [39, 3], [39, 4], [39, 5],
                    [38, 0], [38, 1], [38, 2],
                    [37, 0], [37, 1],
                    // Scattered rocks
                    [10, 10], [15, 8], [20, 15], [25, 12], [30, 18], [35, 10]
                ]},
                { type: 'cactus', positions: [[8, 20], [18, 5], [28, 22], [33, 8]] }
            ],
            dynamicObstacles: [
                { type: 'scorpion', count: 4, speed: 0.7 },
                { type: 'eagle', count: 2, patrolRadius: 6 },
                { type: 'tumbleweed', count: 2, speed: 1 },
                { type: 'rockfall', frequency: 15 }
            ],
            background: 'canyon'
        }
    ],

    // Endless mode configuration
    endless: {
        name: 'Endless Mode',
        description: 'Survive as long as you can',
        startSpeed: 120,
        minSpeed: 60,
        speedIncreaseInterval: 30, // seconds
        speedIncrease: 5, // ms decrease per interval
        preyTypes: ['mouse', 'jerboa', 'lizard', 'hare', 'fennec', 'golden'],
        powerUps: ['speed', 'slow', 'shield', 'multiplier', 'shrink', 'ghost', 'magnet'],
        obstacleFrequency: 45, // seconds between new obstacles
        maxObstacles: 20,
        background: 'endless'
    },

    getLevel(id) {
        return this.levels.find(l => l.id === id) || this.levels[0];
    },

    getLevelCount() {
        return this.levels.length;
    },

    getUnlockedLevels() {
        const progress = Utils.loadData('gaboonViper_progress', { unlockedLevel: 1 });
        return progress.unlockedLevel;
    },

    unlockNextLevel(currentLevel) {
        const progress = Utils.loadData('gaboonViper_progress', { unlockedLevel: 1 });
        if (currentLevel >= progress.unlockedLevel && currentLevel < this.levels.length) {
            progress.unlockedLevel = currentLevel + 1;
            Utils.saveData('gaboonViper_progress', progress);
        }
        return progress.unlockedLevel;
    },

    isEndlessModeUnlocked() {
        return this.getUnlockedLevels() > this.levels.length;
    }
};
