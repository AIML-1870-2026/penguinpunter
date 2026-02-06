// Preset Patterns - Gray-Scott parameter combinations
const PRESET_PATTERNS = [
    { name: 'Mitosis', f: 0.0367, k: 0.0649, description: 'Dividing cells' },
    { name: 'Coral', f: 0.0545, k: 0.0620, description: 'Branching structures' },
    { name: 'Spots', f: 0.0350, k: 0.0580, description: 'Circular domains' },
    { name: 'Stripes', f: 0.0300, k: 0.0550, description: 'Linear patterns' },
    { name: 'Labyrinth', f: 0.0290, k: 0.0570, description: 'Maze-like' },
    { name: 'Waves', f: 0.0140, k: 0.0450, description: 'Flowing patterns' },
    { name: 'Bubbles', f: 0.0380, k: 0.0610, description: 'Large circular domains' },
    { name: 'Solitons', f: 0.0300, k: 0.0620, description: 'Moving blobs' },
    { name: 'Chaos', f: 0.0260, k: 0.0510, description: 'Turbulent' },
    { name: 'Fingerprint', f: 0.0550, k: 0.0630, description: 'Whorl patterns' }
];

// Color Themes - Gradient stops for mapping concentration to colors
const COLOR_THEMES = {
    'Blood Cells': {
        name: 'Blood Cells',
        stops: [
            { position: 0.0, color: { r: 10, g: 0, b: 0 } },      // #0a0000
            { position: 0.3, color: { r: 139, g: 0, b: 0 } },     // #8b0000
            { position: 0.7, color: { r: 255, g: 0, b: 0 } },     // #ff0000
            { position: 1.0, color: { r: 255, g: 107, b: 107 } }  // #ff6b6b
        ]
    },
    'Poison': {
        name: 'Poison',
        stops: [
            { position: 0.0, color: { r: 0, g: 26, b: 0 } },      // #001a00
            { position: 0.5, color: { r: 0, g: 255, b: 0 } },     // #00ff00
            { position: 0.8, color: { r: 204, g: 255, b: 0 } },   // #ccff00
            { position: 1.0, color: { r: 57, g: 255, b: 20 } }    // #39ff14
        ]
    },
    'Bruise': {
        name: 'Bruise',
        stops: [
            { position: 0.0, color: { r: 13, g: 0, b: 21 } },     // #0d0015
            { position: 0.4, color: { r: 75, g: 0, b: 130 } },    // #4b0082
            { position: 0.7, color: { r: 147, g: 112, b: 219 } }, // #9370db
            { position: 1.0, color: { r: 221, g: 160, b: 221 } }  // #dda0dd
        ]
    },
    'Infected': {
        name: 'Infected',
        stops: [
            { position: 0.0, color: { r: 26, g: 18, b: 0 } },     // #1a1200
            { position: 0.4, color: { r: 255, g: 140, b: 0 } },   // #ff8c00
            { position: 0.7, color: { r: 255, g: 215, b: 0 } },   // #ffd700
            { position: 1.0, color: { r: 255, g: 255, b: 153 } }  // #ffff99
        ]
    },
    'Coral Reef': {
        name: 'Coral Reef',
        stops: [
            { position: 0.0, color: { r: 0, g: 26, b: 51 } },     // #001a33
            { position: 0.4, color: { r: 255, g: 107, b: 157 } }, // #ff6b9d
            { position: 0.7, color: { r: 255, g: 182, b: 193 } }, // #ffb6c1
            { position: 1.0, color: { r: 255, g: 255, b: 255 } }  // #ffffff
        ]
    },
    'Cells': {
        name: 'Cells',
        stops: [
            { position: 0.0, color: { r: 15, g: 15, b: 15 } },    // #0f0f0f
            { position: 0.5, color: { r: 74, g: 144, b: 226 } },  // #4a90e2
            { position: 0.8, color: { r: 135, g: 206, b: 235 } }, // #87ceeb
            { position: 1.0, color: { r: 224, g: 247, b: 250 } }  // #e0f7fa
        ]
    },
    'Foam': {
        name: 'Foam',
        stops: [
            { position: 0.0, color: { r: 26, g: 26, b: 26 } },    // #1a1a1a
            { position: 0.5, color: { r: 240, g: 240, b: 240 } }, // #f0f0f0
            { position: 0.8, color: { r: 255, g: 255, b: 255 } }, // #ffffff
            { position: 1.0, color: { r: 232, g: 244, b: 248 } }  // #e8f4f8
        ]
    },
    'Moss': {
        name: 'Moss',
        stops: [
            { position: 0.0, color: { r: 13, g: 31, b: 13 } },    // #0d1f0d
            { position: 0.4, color: { r: 45, g: 80, b: 22 } },    // #2d5016
            { position: 0.7, color: { r: 143, g: 188, b: 143 } }, // #8fbc8f
            { position: 1.0, color: { r: 152, g: 251, b: 152 } }  // #98fb98
        ]
    }
};
