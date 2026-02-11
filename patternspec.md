# Turing Patterns Explorer - Technical Specification

## Project Overview
A dark, visceral web-based reaction-diffusion simulator that creates organic bubble-like patterns resembling blood-filled cells. Users can interact with patterns through clicking/dragging to create "bleeding" effects, breed patterns together, and explore various organic color themes.

---

## Core Concept & Vision

### Aesthetic Direction
- **Primary Theme**: Blood-filled bubbles/cells on dark backgrounds
- **Visual Style**: Organic, biological, slightly unsettling but beautiful
- **Color Palette**: Deep reds, crimsons, dark backgrounds with visceral themes
- **Interaction Feel**: Slow, oozing, organic responses to user input

### Key Differentiators
1. **Pattern Breeding System** - Crossbreed two patterns by interpolating their parameters
2. **Visceral Interaction** - Click/drag to "puncture" bubbles and spread blood
3. **Curated Organic Themes** - Multiple color presets for different biological aesthetics
4. **Living Canvas** - Patterns feel alive and responsive

---

## Feature List

### 1. Core Simulation Engine
**Description**: Real-time reaction-diffusion simulation using Gray-Scott model

**Technical Requirements**:
- Canvas-based rendering (WebGL preferred for performance, Canvas 2D fallback)
- 60 FPS target for smooth animation
- Grid resolution: 256x256 default (adjustable: 128x128 to 512x512)
- Simulation parameters:
  - Feed rate (f): 0.01 - 0.10
  - Kill rate (k): 0.045 - 0.07
  - Diffusion rate A (Da): 1.0 (typically constant)
  - Diffusion rate B (Db): 0.5 (typically constant)
  - Time step (dt): 1.0

**Implementation Notes**:
- Use double-buffering for concentration grids
- Implement Laplacian computation for diffusion
- Gray-Scott equations:
  ```
  dA/dt = Da * ∇²A - AB² + f(1-A)
  dB/dt = Db * ∇²B + AB² - (k+f)B
  ```

### 2. Interactive Bleeding System
**Description**: Click or drag on canvas to inject chemical B, creating "bleeding" effect

**Interaction Behaviors**:
- **Single Click**: Injects chemical B in a circular area (radius: 8-15 pixels)
- **Click and Drag**: Creates a trail of injection points following cursor
- **Bleeding Spread**: Injected chemical diffuses according to reaction-diffusion rules
- **Indefinite Spread**: No automatic decay—bleeding continues until reset
- **Visual Feedback**: Cursor changes to indicate "puncture" mode

**Technical Implementation**:
- On mouse down: set painting flag to true
- On mouse move (if painting): inject chemical B at cursor position
- On mouse up: set painting flag to false
- Injection strength: Set B concentration to 1.0 in affected area
- Brush size: 10 pixels radius (adjustable in advanced settings)

### 3. Pattern Breeding System
**Description**: Select two preset patterns and generate offspring with interpolated parameters

**User Flow**:
1. User selects "Parent A" from preset library
2. User selects "Parent B" from preset library
3. User adjusts "crossover slider" (0% = pure A, 50% = blend, 100% = pure B)
4. System interpolates f and k parameters linearly
5. New pattern generates in real-time
6. User can save bred pattern as custom preset

**Technical Implementation**:
```javascript
// Parameter interpolation
breedPattern(patternA, patternB, blendFactor) {
  return {
    f: patternA.f * (1 - blendFactor) + patternB.f * blendFactor,
    k: patternA.k * (1 - blendFactor) + patternB.k * blendFactor,
    name: `${patternA.name} × ${patternB.name}`
  }
}
```

**UI Elements**:
- Breeding panel (collapsible sidebar)
- Parent A selector (dropdown or thumbnail grid)
- Parent B selector (dropdown or thumbnail grid)
- Blend slider (0-100%)
- "Generate Offspring" button
- "Save as Preset" button

### 4. Color Theme System
**Description**: Curated color palettes that map concentration values to colors

**Theme Categories**:

#### Visceral Themes (Primary)
1. **Blood Cells** (Default)
   - Low concentration: `#0a0000` (near black)
   - Mid concentration: `#8b0000` (dark red)
   - High concentration: `#ff0000` (bright red)
   - Highlights: `#ff6b6b` (pink-red)

2. **Poison**
   - Low: `#001a00` (dark green-black)
   - Mid: `#00ff00` (toxic green)
   - High: `#ccff00` (yellow-green)
   - Highlights: `#39ff14` (neon green)

3. **Bruise**
   - Low: `#0d0015` (deep purple-black)
   - Mid: `#4b0082` (indigo)
   - High: `#9370db` (medium purple)
   - Highlights: `#dda0dd` (plum)

4. **Infected**
   - Low: `#1a1200` (dark brown)
   - Mid: `#ff8c00` (dark orange)
   - High: `#ffd700` (gold/pus)
   - Highlights: `#ffff99` (pale yellow)

#### Natural Organic Themes
5. **Coral Reef**
   - Low: `#001a33` (deep ocean blue)
   - Mid: `#ff6b9d` (coral pink)
   - High: `#ffb6c1` (light pink)
   - Highlights: `#ffffff` (white)

6. **Cells**
   - Low: `#0f0f0f` (dark gray)
   - Mid: `#4a90e2` (cell blue)
   - High: `#87ceeb` (sky blue)
   - Highlights: `#e0f7fa` (pale cyan)

7. **Foam**
   - Low: `#1a1a1a` (charcoal)
   - Mid: `#f0f0f0` (off-white)
   - High: `#ffffff` (pure white)
   - Highlights: `#e8f4f8` (pale blue-white)

8. **Moss**
   - Low: `#0d1f0d` (forest black)
   - Mid: `#2d5016` (dark moss)
   - High: `#8fbc8f` (light green)
   - Highlights: `#98fb98` (pale green)

**Technical Implementation**:
- Use gradient mapping or lookup table
- Smooth interpolation between color stops
- Theme stored as array of {position: 0-1, color: hex}
- Real-time theme switching without reset

### 5. Preset Pattern Library
**Description**: Collection of interesting parameter combinations that produce distinct patterns

**Preset Patterns**:

1. **Mitosis** - Dividing cells
   - f: 0.0367, k: 0.0649
   
2. **Coral** - Branching structures
   - f: 0.0545, k: 0.0620
   
3. **Spots** - Circular domains
   - f: 0.0350, k: 0.0580
   
4. **Stripes** - Linear patterns
   - f: 0.0300, k: 0.0550
   
5. **Labyrinth** - Maze-like
   - f: 0.0290, k: 0.0570
   
6. **Waves** - Flowing patterns
   - f: 0.0140, k: 0.0450
   
7. **Bubbles** - Large circular domains
   - f: 0.0380, k: 0.0610
   
8. **Solitons** - Moving blobs
   - f: 0.0300, k: 0.0620
   
9. **Chaos** - Turbulent
   - f: 0.0260, k: 0.0510
   
10. **Fingerprint** - Whorl patterns
    - f: 0.0550, k: 0.0630

**UI Implementation**:
- Thumbnail previews (generated or pre-rendered)
- Grid layout with pattern names
- Click to load preset
- Preset metadata includes: name, f, k, description

### 6. Export Functionality
**Description**: Save current pattern as image

**Export Options**:
- **PNG Export**: Current frame at display resolution
- **High-Res PNG**: Render at 2x or 4x resolution
- **Filename**: `turing-pattern-{timestamp}.png`

**UI Element**:
- "Export Image" button in toolbar
- Quality selector (1x, 2x, 4x)

---

## User Interface Layout

### Canvas Area (Primary)
- **Position**: Center of viewport, fills most of screen
- **Background**: Dark (`#0a0000` to `#1a0a0a`)
- **Border**: Subtle glow effect matching current theme
- **Cursor**: Crosshair when hovering, changes to "drip" icon when clicking

### Control Panel (Right Sidebar)
**Collapsible panel, 300px wide**

**Sections** (in order):

1. **Preset Patterns**
   - Grid of thumbnails (3 columns)
   - Pattern name below each
   - Hover effect: slight scale + glow

2. **Pattern Breeding**
   - "Parent A" dropdown
   - "Parent B" dropdown
   - Blend slider with percentage display
   - "Generate" button
   - "Save Offspring" button (appears after generation)

3. **Color Themes**
   - Dropdown or radio buttons
   - Live preview swatch for each theme
   - Instant switching

4. **Manual Parameters** (Collapsible)
   - Feed rate slider (0.01 - 0.10)
   - Kill rate slider (0.045 - 0.07)
   - Current values displayed numerically
   - "Reset to Preset" button

5. **Simulation Controls**
   - Play/Pause toggle button
   - Reset button (clears to random noise)
   - Speed slider (0.5x - 2x)
   - Resolution selector (128, 256, 512)

6. **Export**
   - Resolution dropdown (1x, 2x, 4x)
   - "Export PNG" button

### Top Toolbar
- **App Title**: "Turing Patterns Explorer"
- **Info Button**: Opens modal with brief explanation of reaction-diffusion
- **GitHub Link**: (if open source)

### Status Bar (Bottom, Optional)
- FPS counter
- Current simulation time
- Grid dimensions

---

## Interaction Behaviors

### Mouse/Touch Interactions

**Canvas Interactions**:
1. **Hover**: Crosshair cursor appears
2. **Click**: 
   - Injects chemical B at cursor position
   - Creates circular "bleed" area
   - Visual feedback: brief red pulse
3. **Click + Drag**:
   - Continuous injection along path
   - Leaves "trail of blood"
   - No limit to stroke length
4. **Release**: Stop injection

**Control Panel Interactions**:
1. **Preset Click**: Load preset, animate transition (500ms parameter tween)
2. **Slider Drag**: Real-time parameter update, simulation continues
3. **Theme Switch**: Instant color palette change, no simulation reset
4. **Breeding**:
   - Select parents: Highlight selection
   - Adjust blend: Live preview in small canvas
   - Generate: Fade transition to new pattern

### Keyboard Shortcuts
- **Space**: Play/Pause toggle
- **R**: Reset simulation
- **E**: Export image
- **1-9**: Load preset 1-9
- **Arrow Keys**: Fine-tune f/k parameters

---

## Visual Design Specifications

### Typography
- **Font Family**: 'Inter', 'Segoe UI', sans-serif
- **Title**: 24px, weight 600
- **Labels**: 14px, weight 500
- **Body**: 14px, weight 400
- **Color**: `#e0e0e0` on dark backgrounds

### Color System
- **Background**: `#0a0a0a` to `#1a1a1a` (gradient)
- **Panel Background**: `#1a1a1a` with `rgba(255,255,255,0.05)` overlay
- **Borders**: `#333333` or theme-matched glow
- **Text**: `#e0e0e0` (primary), `#999999` (secondary)
- **Accents**: Theme-dependent (default blood red `#cc0000`)
- **Buttons**: Dark with theme-colored border, hover brightens

### Spacing & Layout
- **Grid Unit**: 8px
- **Panel Padding**: 24px
- **Section Spacing**: 32px
- **Control Spacing**: 16px
- **Border Radius**: 8px for panels, 4px for buttons

### Animation & Transitions
- **Parameter Changes**: 300ms ease-out
- **Theme Switches**: Instant (no transition needed)
- **Panel Expand/Collapse**: 200ms ease
- **Button Hover**: 150ms ease
- **Preset Load**: 500ms parameter interpolation

---

## Technical Requirements

### Performance Targets
- **Frame Rate**: 60 FPS sustained
- **Grid Update**: < 16ms per frame
- **Interaction Latency**: < 50ms from click to visual feedback
- **Memory**: < 200MB for 256x256 grid
- **Initial Load**: < 3 seconds on average connection

### Browser Support
- **Primary**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Fallback**: Canvas 2D if WebGL unavailable
- **Mobile**: Touch support for iOS Safari, Chrome Android

### Technology Stack
- **Framework**: React (recommended) or vanilla JavaScript
- **Rendering**: WebGL (primary), Canvas 2D (fallback)
- **Bundler**: Vite or Create React App
- **Styling**: CSS Modules or Tailwind CSS

### Code Structure
```
src/
├── components/
│   ├── Canvas.jsx              # Main simulation display
│   ├── ControlPanel.jsx        # Right sidebar
│   ├── PresetGrid.jsx          # Preset pattern selector
│   ├── BreedingPanel.jsx       # Pattern breeding UI
│   ├── ThemeSelector.jsx       # Color theme picker
│   ├── ParameterSliders.jsx    # Manual f/k controls
│   └── ExportButton.jsx        # Image export
├── simulation/
│   ├── GrayScott.js            # Core algorithm
│   ├── WebGLRenderer.js        # WebGL rendering
│   ├── CanvasRenderer.js       # Canvas 2D fallback
│   └── ColorMapper.js          # Theme-to-color conversion
├── data/
│   ├── presets.js              # Pattern library
│   ├── themes.js               # Color themes
│   └── constants.js            # Default parameters
├── utils/
│   ├── breeding.js             # Pattern interpolation
│   ├── export.js               # PNG export logic
│   └── interaction.js          # Mouse/touch handling
└── App.jsx                     # Main application
```

---

## Parameter Ranges & Defaults

### Simulation Parameters
| Parameter | Min | Max | Default | Step |
|-----------|-----|-----|---------|------|
| Feed rate (f) | 0.010 | 0.100 | 0.0367 | 0.001 |
| Kill rate (k) | 0.045 | 0.070 | 0.0649 | 0.001 |
| Diffusion A (Da) | 1.0 | 1.0 | 1.0 | - |
| Diffusion B (Db) | 0.5 | 0.5 | 0.5 | - |
| Time step (dt) | 0.5 | 2.0 | 1.0 | 0.1 |
| Grid size | 128 | 512 | 256 | 128 |

### Interaction Parameters
| Parameter | Value |
|-----------|-------|
| Injection radius | 10 pixels |
| Injection strength | 1.0 (full B concentration) |
| Drag sample rate | Every 5 pixels |

### Visual Parameters
| Parameter | Value |
|-----------|-------|
| Canvas background | `#0a0000` |
| Minimum brightness | 0.0 |
| Maximum brightness | 1.0 |
| Glow intensity | 0.2 (optional post-process) |

---

## Preset Breeding Examples

To help visualize the breeding system, here are example offspring:

**Example 1**: Mitosis × Coral
- Parent A: f=0.0367, k=0.0649 (Mitosis)
- Parent B: f=0.0545, k=0.0620 (Coral)
- 50% Blend: f=0.0456, k=0.0635
- Result: Hybrid between dividing cells and branches

**Example 2**: Spots × Stripes
- Parent A: f=0.0350, k=0.0580 (Spots)
- Parent B: f=0.0300, k=0.0550 (Stripes)
- 30% Blend: f=0.0335, k=0.0571
- Result: Spotted stripes or striped spots

**Example 3**: Labyrinth × Chaos
- Parent A: f=0.0290, k=0.0570 (Labyrinth)
- Parent B: f=0.0260, k=0.0510 (Chaos)
- 70% Blend: f=0.0269, k=0.0528
- Result: Chaotic maze with unstable walls

---

## Implementation Priorities

### Phase 1: Core Functionality (MVP)
1. ✅ Gray-Scott simulation engine
2. ✅ Canvas rendering (Canvas 2D)
3. ✅ Click-to-inject interaction
4. ✅ Blood Cells color theme
5. ✅ 3-5 preset patterns
6. ✅ Basic UI layout
7. ✅ Play/pause/reset controls

### Phase 2: Enhanced Features
1. ✅ WebGL rendering for performance
2. ✅ All 10 preset patterns
3. ✅ All 8 color themes
4. ✅ Drag-to-paint interaction
5. ✅ Manual parameter sliders
6. ✅ Export to PNG

### Phase 3: Advanced Features
1. ✅ Pattern breeding system
2. ✅ Save custom presets (localStorage)
3. ✅ Keyboard shortcuts
4. ✅ High-res export (2x, 4x)
5. ✅ Animation speed control
6. ✅ Responsive design for mobile

### Phase 4: Polish
1. ✅ Smooth animations and transitions
2. ✅ Loading states
3. ✅ Error handling
4. ✅ Performance optimization
5. ✅ Accessibility (keyboard nav, ARIA labels)
6. ✅ Help/info modal

---

## Success Criteria

The application is considered complete when:

1. ✅ Simulation runs at 60 FPS on modern hardware (256x256 grid)
2. ✅ All 10 presets load correctly and produce expected patterns
3. ✅ Click and drag interactions create smooth bleeding effects
4. ✅ Pattern breeding produces visually interesting hybrids
5. ✅ All 8 color themes render correctly with smooth transitions
6. ✅ PNG export generates clean, high-quality images
7. ✅ UI is responsive and works on desktop and tablet
8. ✅ No console errors or warnings
9. ✅ Code is clean, commented, and maintainable
10. ✅ User can achieve the "blood-filled bubbles" aesthetic within 30 seconds

---

## Future Enhancements (Out of Scope for v1)

- Video/GIF recording of simulation evolution
- SVG export for vector-based art
- Audio-reactive parameters (mic input modulates f/k)
- Multi-layer blending (combine multiple simulations)
- 3D height-map visualization
- Shader-based post-processing (bloom, chromatic aberration)
- Sharing via URL parameters
- Gallery of user-created patterns
- VR/AR mode for immersive exploration
- Custom equation editor for advanced users

---

## Notes for Implementation

### Performance Considerations
- Use typed arrays (Float32Array) for concentration grids
- Implement spatial hashing for click detection on large grids
- Debounce parameter updates during slider dragging
- Consider Web Workers for simulation if main thread blocked
- Use requestAnimationFrame for render loop
- Lazy-load preset thumbnails

### Accessibility
- Ensure all controls are keyboard navigable
- Provide ARIA labels for sliders and buttons
- Include alt text for preset thumbnails
- Support high contrast mode
- Provide text descriptions of patterns for screen readers

### Testing Checklist
- [ ] All presets load without errors
- [ ] Breeding interpolation is mathematically correct
- [ ] Click injection works in all grid sizes
- [ ] Drag painting leaves continuous trail
- [ ] Theme switching preserves simulation state
- [ ] Export produces correct dimensions
- [ ] Play/pause accurately controls simulation
- [ ] Reset clears to proper initial state
- [ ] Mobile touch events work correctly
- [ ] No memory leaks during long sessions

---

## Visual Reference

### Expected Appearance (Blood Cells Theme)
```
Dark background (#0a0000) with organic bubble-like structures in 
varying shades of red. Larger bubbles have bright red centers (#ff0000) 
with darker boundaries (#8b0000). When user clicks, a bright red 
injection point appears and slowly diffuses outward, creating 
flowing, organic "bleeding" patterns that merge with existing structures.
The overall effect should be mesmerizing, slightly unsettling, and 
distinctly biological in character.
```

### UI Mood Board Keywords
- Dark, moody, visceral
- Organic, biological, cellular
- Minimalist controls with maximum visual impact
- Professional but artistic
- Subtle animations, bold interactions
- Science meets horror aesthetic

---

## Conclusion

This specification provides a complete blueprint for implementing a unique, visceral Turing Patterns explorer. The focus on dark aesthetics, organic interactions, and pattern breeding sets this apart from typical educational demos. The phased implementation approach ensures a solid MVP while allowing for future enhancements.

**Key Success Factor**: The application should feel alive and responsive, with the "blood-filled bubbles" aesthetic immediately recognizable and the bleeding interaction intuitive and satisfying.
