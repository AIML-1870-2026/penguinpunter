// Mouse/Touch Interaction Handler for bleeding effect
class InteractionHandler {
    constructor(canvas, simulation, controls = null) {
        this.canvas = canvas;
        this.simulation = simulation;
        this.controls = controls;
        this.isPainting = false;
        this.brushRadius = 4;  // Default brush size

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            this.isPainting = true;
            // Unpause simulation when user starts dragging (ruptures membrane)
            if (this.controls && this.controls.isPaused) {
                this.controls.togglePlayPause();
            }
            this.paint(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isPainting) {
                this.paint(e);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isPainting = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isPainting = false;
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isPainting = true;
            this.paintTouch(e);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isPainting) {
                this.paintTouch(e);
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isPainting = false;
        });

        // Change cursor on hover
        this.canvas.style.cursor = 'crosshair';
    }

    paint(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.injectAtPosition(x, y);
    }

    paintTouch(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        this.injectAtPosition(x, y);
    }

    injectAtPosition(x, y) {
        // Inject chemical B at this position
        this.simulation.inject(
            x,
            y,
            this.canvas.width,
            this.canvas.height,
            this.brushRadius
        );
    }

    setBrushRadius(radius) {
        this.brushRadius = radius;
    }
}
