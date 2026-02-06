// Gray-Scott Reaction-Diffusion Simulation
class GrayScottSimulation {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        // Double-buffered grids for chemicals A and B
        this.gridA = new Float32Array(width * height);
        this.gridB = new Float32Array(width * height);
        this.nextA = new Float32Array(width * height);
        this.nextB = new Float32Array(width * height);

        // Default Gray-Scott parameters (Mitosis preset)
        this.f = 0.0367;  // Feed rate
        this.k = 0.0649;  // Kill rate
        this.Da = 1.0;    // Diffusion rate for chemical A
        this.Db = 0.5;    // Diffusion rate for chemical B
        this.dt = 1.0;    // Time step
    }

    // Set new simulation parameters
    setParameters(f, k) {
        this.f = f;
        this.k = k;
    }

    // Reset simulation with solid blood bubbles
    reset() {
        // Initialize: full A everywhere, no B
        for (let i = 0; i < this.gridA.length; i++) {
            this.gridA[i] = 1.0;
            this.gridB[i] = 0.0;
        }

        // Create 8-12 solid blood bubbles scattered across canvas
        const numBubbles = 8 + Math.floor(Math.random() * 5);
        const bubbleRadius = 15 + Math.floor(Math.random() * 10);  // 15-25 pixel radius

        for (let bubble = 0; bubble < numBubbles; bubble++) {
            // Random position, avoiding edges
            const margin = 40;
            const bubbleX = margin + Math.floor(Math.random() * (this.width - 2 * margin));
            const bubbleY = margin + Math.floor(Math.random() * (this.height - 2 * margin));

            // Fill circular area with high B concentration (solid bubble)
            for (let dy = -bubbleRadius; dy <= bubbleRadius; dy++) {
                for (let dx = -bubbleRadius; dx <= bubbleRadius; dx++) {
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Create solid bubble with slight gradient at edges
                    if (dist <= bubbleRadius) {
                        const x = bubbleX + dx;
                        const y = bubbleY + dy;

                        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                            const idx = y * this.width + x;
                            // Solid core with slight falloff at edges
                            const concentration = dist < bubbleRadius * 0.8 ? 1.0 : 0.8;
                            this.gridB[idx] = concentration;
                        }
                    }
                }
            }
        }
    }

    // Compute Laplacian using 9-point weighted stencil
    laplacian(grid, x, y) {
        const width = this.width;
        const height = this.height;

        // Wrap coordinates (toroidal boundary conditions)
        const xm1 = (x - 1 + width) % width;
        const xp1 = (x + 1) % width;
        const ym1 = (y - 1 + height) % height;
        const yp1 = (y + 1) % height;

        const center = grid[y * width + x];

        // 9-point weighted stencil
        const sum =
            grid[ym1 * width + xm1] * 0.05 +
            grid[ym1 * width + x] * 0.2 +
            grid[ym1 * width + xp1] * 0.05 +
            grid[y * width + xm1] * 0.2 +
            center * -1.0 +
            grid[y * width + xp1] * 0.2 +
            grid[yp1 * width + xm1] * 0.05 +
            grid[yp1 * width + x] * 0.2 +
            grid[yp1 * width + xp1] * 0.05;

        return sum;
    }

    // Perform one simulation step
    step() {
        const width = this.width;
        const height = this.height;

        // Compute next state for all cells
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = y * width + x;
                const a = this.gridA[i];
                const b = this.gridB[i];

                // Compute Laplacian for diffusion
                const lapA = this.laplacian(this.gridA, x, y);
                const lapB = this.laplacian(this.gridB, x, y);

                // Gray-Scott reaction-diffusion equations
                const abb = a * b * b;
                const dA = this.Da * lapA - abb + this.f * (1 - a);
                const dB = this.Db * lapB + abb - (this.k + this.f) * b;

                // Update with time step
                this.nextA[i] = a + dA * this.dt;
                this.nextB[i] = b + dB * this.dt;

                // Clamp to valid range [0, 1]
                this.nextA[i] = Math.max(0, Math.min(1, this.nextA[i]));
                this.nextB[i] = Math.max(0, Math.min(1, this.nextB[i]));
            }
        }

        // Swap buffers (double buffering)
        [this.gridA, this.nextA] = [this.nextA, this.gridA];
        [this.gridB, this.nextB] = [this.nextB, this.gridB];
    }

    // Inject chemical B at position (for bleeding effect)
    inject(canvasX, canvasY, canvasWidth, canvasHeight, radius = 10) {
        // Convert canvas coordinates to grid coordinates
        const gridX = Math.floor((canvasX / canvasWidth) * this.width);
        const gridY = Math.floor((canvasY / canvasHeight) * this.height);

        // Inject B in circular area
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= radius) {
                    let x = gridX + dx;
                    let y = gridY + dy;

                    // Wrap coordinates
                    x = (x + this.width) % this.width;
                    y = (y + this.height) % this.height;

                    const idx = y * this.width + x;
                    this.gridB[idx] = 1.0;  // Full B concentration
                }
            }
        }
    }
}
