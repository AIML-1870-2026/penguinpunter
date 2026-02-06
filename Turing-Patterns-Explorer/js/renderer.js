// Canvas 2D Renderer with color theme mapping
class Renderer {
    constructor(canvas, simWidth, simHeight) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.simWidth = simWidth;
        this.simHeight = simHeight;

        // Default to Blood Cells theme
        this.currentTheme = COLOR_THEMES['Blood Cells'];
    }

    // Set color theme
    setTheme(themeName) {
        if (COLOR_THEMES[themeName]) {
            this.currentTheme = COLOR_THEMES[themeName];
        }
    }

    // Map value [0-1] to color using theme gradient
    mapValueToColor(value, theme) {
        // Clamp value to [0, 1]
        value = Math.max(0, Math.min(1, value));

        const stops = theme.stops;

        // Find surrounding color stops
        let lowerStop = stops[0];
        let upperStop = stops[stops.length - 1];

        for (let i = 0; i < stops.length - 1; i++) {
            if (value >= stops[i].position && value <= stops[i + 1].position) {
                lowerStop = stops[i];
                upperStop = stops[i + 1];
                break;
            }
        }

        // Linear interpolation between stops
        const range = upperStop.position - lowerStop.position;
        const t = range > 0 ? (value - lowerStop.position) / range : 0;

        const r = Math.floor(lowerStop.color.r + (upperStop.color.r - lowerStop.color.r) * t);
        const g = Math.floor(lowerStop.color.g + (upperStop.color.g - lowerStop.color.g) * t);
        const b = Math.floor(lowerStop.color.b + (upperStop.color.b - lowerStop.color.b) * t);

        return { r, g, b };
    }

    // Render simulation grid to canvas
    render(gridA, gridB) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        const imageData = this.ctx.createImageData(canvasWidth, canvasHeight);
        const data = imageData.data;

        const cellWidth = canvasWidth / this.simWidth;
        const cellHeight = canvasHeight / this.simHeight;

        // Map each pixel to simulation grid
        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
                // Convert canvas pixel to grid cell
                const gridX = Math.floor(x / cellWidth);
                const gridY = Math.floor(y / cellHeight);
                const gridIdx = gridY * this.simWidth + gridX;

                // Use B concentration for coloring
                const value = gridB[gridIdx];
                const color = this.mapValueToColor(value, this.currentTheme);

                // Set pixel color
                const pixelIdx = (y * canvasWidth + x) * 4;
                data[pixelIdx] = color.r;
                data[pixelIdx + 1] = color.g;
                data[pixelIdx + 2] = color.b;
                data[pixelIdx + 3] = 255;  // Full opacity
            }
        }

        // Draw to canvas
        this.ctx.putImageData(imageData, 0, 0);
    }
}
