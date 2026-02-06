// Main Application Coordinator
let simulation;
let renderer;
let controls;
let interaction;

// FPS tracking
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

// Initialize application when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Turing Patterns Explorer...');

    // Get canvas element
    const canvas = document.getElementById('simulation-canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // Set canvas size
    canvas.width = 800;
    canvas.height = 800;

    // Initialize simulation (256x256 grid)
    simulation = new GrayScottSimulation(256, 256);
    simulation.setParameters(0.0367, 0.0649);  // Default: Mitosis
    simulation.reset();
    console.log('Simulation initialized');

    // Initialize renderer
    renderer = new Renderer(canvas, 256, 256);
    renderer.setTheme('Blood Cells');
    console.log('Renderer initialized');

    // Initialize interaction handler
    interaction = new InteractionHandler(canvas, simulation);
    console.log('Interaction handler initialized');

    // Initialize controls
    controls = new ControlsManager(simulation, renderer);
    controls.updateParameterDisplays();
    console.log('Controls initialized');

    // Setup export functionality
    setupExportButton(canvas, renderer, simulation);
    console.log('Export setup complete');

    // Populate preset selectors for breeding
    populateBreedingSelectors();

    // Start animation loop
    console.log('Starting animation loop...');
    requestAnimationFrame(animate);
});

function animate(currentTime) {
    // Calculate FPS
    frameCount++;
    const elapsed = currentTime - lastTime;
    if (elapsed >= 1000) {
        fps = Math.round((frameCount * 1000) / elapsed);
        frameCount = 0;
        lastTime = currentTime;

        // Update FPS display if element exists
        const fpsDisplay = document.getElementById('fps-display');
        if (fpsDisplay) {
            fpsDisplay.textContent = `FPS: ${fps}`;
        }
    }

    // Run simulation step (if not paused)
    if (!controls.getIsPaused()) {
        simulation.step();
    }

    // Render to canvas
    renderer.render(simulation.gridA, simulation.gridB);

    // Continue loop
    requestAnimationFrame(animate);
}

function populateBreedingSelectors() {
    const parentASelect = document.getElementById('parent-a-select');
    const parentBSelect = document.getElementById('parent-b-select');

    if (parentASelect && parentBSelect) {
        PRESET_PATTERNS.forEach((preset, index) => {
            const optionA = document.createElement('option');
            optionA.value = index;
            optionA.textContent = preset.name;
            parentASelect.appendChild(optionA);

            const optionB = document.createElement('option');
            optionB.value = index;
            optionB.textContent = preset.name;
            parentBSelect.appendChild(optionB);
        });

        // Set default selections
        parentASelect.value = 0;
        parentBSelect.value = 1;
    }
}
