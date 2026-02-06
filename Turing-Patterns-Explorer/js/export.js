// PNG Export Functionality
function exportPNG(canvas, renderer, simulation, scale = 1) {
    // Create temporary canvas at target resolution
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = simulation.width * scale;
    tempCanvas.height = simulation.height * scale;

    // Create temporary renderer for high-res export
    const tempRenderer = new Renderer(tempCanvas, simulation.width, simulation.height);
    tempRenderer.currentTheme = renderer.currentTheme;

    // Render current frame at high resolution
    tempRenderer.render(simulation.gridA, simulation.gridB);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `turing-pattern-${timestamp}.png`;

    // Trigger download
    const link = document.createElement('a');
    link.download = filename;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
}

// Setup export button
function setupExportButton(canvas, renderer, simulation) {
    const exportBtn = document.getElementById('export-btn');
    const scaleSelect = document.getElementById('export-scale');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const scale = scaleSelect ? parseInt(scaleSelect.value) : 1;
            exportPNG(canvas, renderer, simulation, scale);
        });
    }
}
