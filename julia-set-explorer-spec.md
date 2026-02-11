# Julia Set Explorer – Product Specification

## Overview

A web-based fractal visualization tool focused on artistic exploration of Julia Sets and related fractals. Users can interactively manipulate parameters, navigate infinite detail, and create beautiful mathematical art.

**Primary Goals:**
- Stunning visual experience with smooth, responsive rendering
- Intuitive controls that invite exploration
- Easy sharing and export of discoveries

**Target Users:**
- Digital artists and generative art enthusiasts
- Mathematics and fractal enthusiasts
- Casual users curious about fractals
- Educators demonstrating complex dynamics

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Real-time Rendering** | Julia Set renders immediately as parameters change, with progressive refinement from preview to full quality |
| **Pan & Zoom Navigation** | Click-drag to pan, scroll wheel to zoom. Smooth animations with momentum. Pinch-to-zoom on touch devices |
| **C Parameter Control** | Adjust the complex constant c via sliders, direct input, or clicking on a Mandelbrot set |
| **Multiple Color Schemes** | Pre-built artistic gradients with visual selector, plus custom gradient editor |
| **Iteration Depth** | Adjustable max iterations (50–2000) to control detail level and rendering speed |
| **Preset Gallery** | One-click buttons for famous Julia sets (Dendrite, Spiral, Rabbit, Dragon, etc.) |
| **Reset View** | One-click return to default view and parameters |

### Advanced Features

| Feature | Description |
|---------|-------------|
| **Mandelbrot-Julia Split View** | Side-by-side view where clicking any point on the Mandelbrot set instantly generates the corresponding Julia set |
| **Parameter Morphing Animation** | Smoothly animate the c parameter along paths (circular, linear, heart), creating mesmerizing visual journeys through Julia set space |
| **Custom Color Gradient Editor** | Create, edit, and save personal color schemes with draggable color stops |
| **Multiple Fractal Formulas** | Switch between Julia (z² + c), Cubic Julia (z³ + c), Burning Ship, Tricorn, and custom exponent |
| **High-Resolution Export** | Download current view as PNG at 1x, 2x, or 4x resolution (up to 4K) |
| **URL State Sharing** | All parameters encoded in URL—paste link to share exact view with others |
| **Color Cycling Animation** | Optional animated color rotation for hypnotic effect |

---

## User Interface Layout

### View Modes

The application supports two view modes, toggled via a button in the header:

#### Mode 1: Standard View (Default)
Sidebar with controls on the left, Julia Set canvas fills remaining space.

```
┌─────────────────────────────────────────────────────────────────┐
│  Julia Explorer              [Split View] [Share] [Export]      │
├───────────────┬─────────────────────────────────────────────────┤
│               │                                                 │
│    SIDEBAR    │                                                 │
│    280px      │              JULIA SET CANVAS                   │
│               │              (fills remaining space)            │
│  ┌─────────┐  │                                                 │
│  │ Formula │  │         Interactive rendering area              │
│  ├─────────┤  │         - Click + drag to pan                   │
│  │ Presets │  │         - Scroll wheel to zoom                  │
│  ├─────────┤  │         - Shows coordinates on hover            │
│  │C Param  │  │                                                 │
│  ├─────────┤  │                                                 │
│  │ Colors  │  │                                                 │
│  ├─────────┤  │                                                 │
│  │Quality  │  │                                                 │
│  ├─────────┤  │                                                 │
│  │Animation│  │                                                 │
│  └─────────┘  │                                                 │
│               ├─────────────────────────────────────────────────┤
│               │  z = -0.42 + 0.31i    Zoom: 2.5x    [Reset View]│
└───────────────┴─────────────────────────────────────────────────┘
```

#### Mode 2: Split View (Mandelbrot-Julia Connection)
Side-by-side display showing the mathematical relationship between sets.

```
┌─────────────────────────────────────────────────────────────────┐
│  Julia Explorer              [Single View] [Share] [Export]     │
├───────────────┬─────────────────────┬───────────────────────────┤
│               │                     │                           │
│    SIDEBAR    │   MANDELBROT SET    │      JULIA SET            │
│    240px      │   (left canvas)     │      (right canvas)       │
│               │                     │                           │
│  ┌─────────┐  │  Click any point    │   Shows Julia set for     │
│  │ Formula │  │  to select c        │   selected c value        │
│  ├─────────┤  │                     │                           │
│  │ Presets │  │  Current c shown    │   Independent pan/zoom    │
│  ├─────────┤  │  as crosshair       │                           │
│  │ Colors  │  │                     │                           │
│  ├─────────┤  │  Pan/zoom enabled   │                           │
│  │Quality  │  │                     │                           │
│  ├─────────┤  ├─────────────────────┼───────────────────────────┤
│  │Animation│  │ c = -0.7 + 0.27i    │ Zoom: 1.0x   [Reset]      │
│  └─────────┘  │                     │                           │
└───────────────┴─────────────────────┴───────────────────────────┘
```

**Split View Behavior:**
- Left canvas shows the Mandelbrot set
- Clicking anywhere on Mandelbrot instantly updates the Julia set on the right
- A crosshair/marker indicates the currently selected c value
- Both canvases support independent pan and zoom
- Hovering over Mandelbrot shows a tooltip preview of that Julia set
- The c parameter sliders in sidebar sync with Mandelbrot clicks

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1024px) | Full layout as shown above |
| Tablet (768–1023px) | Sidebar collapsible via hamburger; split view stacks vertically |
| Mobile (<768px) | Sidebar becomes bottom drawer; split view disabled (single canvas only) |

---

## Sidebar Sections (Detailed)

### 1. Formula Selector

**Component:** Dropdown select with formula previews

**Options:**
| Formula | Function | Description |
|---------|----------|-------------|
| Classic Julia | z² + c | The standard quadratic Julia set |
| Cubic Julia | z³ + c | Threefold symmetry patterns |
| Burning Ship | (|Re(z)| + i|Im(z)|)² + c | Irregular, flame-like shapes |
| Tricorn | z̄² + c | Uses complex conjugate, "Mandelbar" |
| Custom Power | zⁿ + c | User-specified exponent n (2–8) |

**Behavior:**
- Changing formula immediately re-renders with current c and view
- Tooltip on hover explains each formula briefly
- In split view, Mandelbrot also updates to show the corresponding "Multibrot" set

---

### 2. Preset Gallery (Famous Julia Sets)

**Component:** Grid of thumbnail buttons showing preview of each Julia set

**Presets:**
| Name | c Value | Visual Character |
|------|---------|------------------|
| Dendrite | c = 0 + 1i | Tree-like branching, completely connected |
| San Marco | c = -0.75 + 0i | Basilica/cathedral pattern with parabolic point |
| Siegel Disk | c = -0.391 - 0.587i | Swirling spiral disk, golden ratio related |
| Douady Rabbit | c = -0.123 + 0.745i | Three-lobed "rabbit" with ears |
| Dragon | c = -0.8 + 0.156i | Dragon curve appearance |
| Spiral | c = 0.285 + 0.01i | Tight spiral arms |
| Starfish | c = -0.4 + 0.6i | Star/flower pattern |
| Galaxies | c = -0.7 + 0.27i | Spiral galaxy shapes |
| Lightning | c = -0.1 + 0.651i | Electric, jagged branching |
| Snowflake | c = -0.746 + 0.096i | Six-fold symmetry patterns |

**Behavior:**
- Clicking a preset immediately sets c and resets view to show the full Julia set
- Hovering shows the c value as tooltip
- In split view, also moves the Mandelbrot crosshair to that c location

---

### 3. C Parameter Controls

**Components:**

**a) Precision Sliders**
- **Real part (Re):** Range [-2, 2], step 0.001
- **Imaginary part (Im):** Range [-2, 2], step 0.001
- Labels display current values to 3 decimal places
- Dragging updates Julia set in real-time

**b) Direct Input Fields**
- Two number inputs for Re(c) and Im(c)
- Accepts values outside slider range for advanced exploration
- Updates on Enter key or when field loses focus
- Validates input and shows error state for invalid values

**c) Coordinate Display**
- Shows current c in mathematical notation: c = -0.75 + 0.27i
- Copy button to copy c value to clipboard

**Behavior in Split View:**
- Sliders sync bidirectionally with Mandelbrot canvas clicks
- Moving sliders animates the crosshair on Mandelbrot

---

### 4. Color Scheme Controls

**Components:**

**a) Palette Selector**
Visual grid of color swatches showing gradient preview. Selected palette has highlight ring.

**Built-in Palettes:**
| Name | Colors | Mood |
|------|--------|------|
| Twilight | Purple → Magenta → Orange → Gold | Warm, ethereal |
| Ocean | Deep Navy → Teal → Cyan → White | Cool, calming |
| Fire | Black → Crimson → Orange → Yellow → White | Intense, energetic |
| Neon | Dark → Cycling vivid HSL hues | Vibrant, electric |
| Monochrome | Black → White | Classic, high contrast |
| Infrared | Black → Purple → Red → Pink → White | Scientific, thermal |
| Forest | Dark Green → Emerald → Lime → Yellow | Natural, organic |
| Sunset | Dark Blue → Purple → Orange → Yellow | Atmospheric |
| Ice | Black → Blue → Cyan → White | Cold, crystalline |
| Psychedelic | Cycling rainbow with high saturation | Trippy, bold |

**b) Custom Gradient Editor** (expandable panel)

**Components:**
- **Gradient Preview Bar:** Shows current custom gradient, 100% width
- **Color Stops:** Draggable markers below the gradient bar
  - Click gradient bar to add new stop
  - Drag stops horizontally to reposition (0% to 100%)
  - Click stop to select it for color editing
  - Double-click or delete key to remove stop (minimum 2 stops required)
- **Color Picker:** For selected stop
  - HSL sliders (Hue, Saturation, Lightness)
  - Hex input field
  - Recent colors row (last 8 used)
- **Stop Position Input:** Numeric input for precise positioning (0-100%)
- **Actions:**
  - "Save Gradient" button → saves to local storage with user-provided name
  - "Load Saved" dropdown → shows user's saved gradients
  - "Reset" → returns to default gradient

**Saved Gradients:**
- Stored in browser localStorage
- Maximum 20 saved gradients
- Each saved gradient shows name and preview swatch
- Can be deleted via X button

**c) Color Cycling Toggle**
- On/Off switch
- Speed slider when enabled (0.1x – 5x, default 1x)
- Shifts the color mapping over time, creating animated effect
- Works with both built-in and custom palettes

---

### 5. Quality Settings

**Components:**

**a) Iteration Depth Slider**
- Range: 50 – 2000
- Default: 200
- Labels: "Fast" (left end) ↔ "Detailed" (right end)
- Current value displayed
- Higher values reveal finer detail but increase render time

**b) Anti-aliasing / Supersampling** (collapsed by default)
- Options: None / 2× / 4×
- Default: None (for performance)
- 2× and 4× recommended primarily for export
- Tooltip explains performance impact

**c) Escape Radius** (collapsed by default)
- Range: 2 – 50
- Default: 2
- Affects smoothness of color gradients at edges
- Most users won't need to change this

---

### 6. Animation Controls

**Component:** Collapsible section for parameter morphing animation

**a) Animation Toggle**
- Large Play/Pause button
- When playing, c parameter animates along selected path
- Julia set updates smoothly creating mesmerizing visual journey

**b) Animation Path Type**
| Path | Description |
|------|-------------|
| Circle | c traces a circle in the complex plane |
| Ellipse | c traces an ellipse (adjustable axes) |
| Line | c oscillates between two points |
| Heart | c traces a cardioid/heart shape |
| Lissajous | c follows a Lissajous curve (adjustable frequencies) |
| Custom | User clicks points on Mandelbrot to define waypoints |

**c) Path Parameters** (contextual, based on selected path type)

*For Circle:*
- Center: Re and Im inputs (default: -0.5, 0)
- Radius: slider 0.1 – 1.0 (default: 0.3)

*For Line:*
- Start point: Re, Im inputs
- End point: Re, Im inputs

*For Lissajous:*
- Frequency X: 1–5
- Frequency Y: 1–5
- Phase offset: 0–360°

*For Custom:*
- "Add Point" mode: clicks on Mandelbrot add waypoints
- Waypoint list with delete buttons
- Minimum 2 waypoints required

**d) Animation Speed**
- Slider: 0.25× – 4× (default: 1×)
- Shows estimated cycle duration in seconds

**e) Loop Mode**
- Loop: Continuous forward motion
- Bounce: Forward then reverse (ping-pong)
- Once: Single cycle then stop

**f) Path Visualization**
- In split view: animation path drawn on Mandelbrot as dotted line
- Current c position shown as animated dot on path
- Path preview appears when configuring before playing

---

## Zoom and Pan Controls

### Mouse/Trackpad Controls

| Action | Behavior |
|--------|----------|
| **Scroll wheel** | Zoom in/out centered on cursor position |
| **Click + drag** | Pan the view |
| **Double-click** | Zoom in 2× centered on click point |
| **Shift + double-click** | Zoom out 2× |

### Touch Controls (Mobile/Tablet)

| Action | Behavior |
|--------|----------|
| **Pinch** | Zoom in/out |
| **Single finger drag** | Pan the view |
| **Double-tap** | Zoom in 2× at tap point |
| **Two-finger tap** | Zoom out 2× |

### Zoom Behavior Details

- **Zoom range:** 0.5× (zoomed out, shows [-4, 4] range) to 10,000,000× (deep zoom)
- **Zoom animation:** Smooth 200ms ease-out transition
- **Zoom increments:** Each scroll tick = 1.2× zoom factor
- **Center behavior:** Zoom always centers on cursor/touch position, not canvas center
- **Progressive rendering:** 
  1. Immediate: Quarter resolution preview
  2. 100ms: Half resolution
  3. 300ms: Full resolution
- **Deep zoom:** At extreme zoom levels (>100,000×), may need higher iterations for detail

### On-Screen Zoom Controls (Optional Accessibility)

- Zoom in (+) button
- Zoom out (−) button  
- Zoom level indicator (e.g., "2.5×")
- Located in status bar or as floating buttons

---

## Header Bar

**Left:** 
- App title "Julia Explorer" with subtle fractal icon
- Current view mode indicator

**Center/Right:**
- **[Split View] / [Single View]** toggle button
- **[Share]** button: Copies URL with encoded state to clipboard
  - Shows "Copied!" toast notification
  - URL includes all parameters (c, zoom, pan, palette, formula, etc.)
- **[Export]** button: Opens export modal

---

## Export Modal

**Trigger:** Export button in header

**Layout:** Centered modal with backdrop blur

**Options:**

| Setting | Values | Default |
|---------|--------|---------|
| Resolution | Current size, 2× (HD), 4× (4K), Custom | 2× |
| Custom dimensions | Width × Height inputs (if Custom selected) | — |
| Format | PNG, JPEG, WebP | PNG |
| Quality (JPEG/WebP) | Slider 70–100% | 90% |
| Include parameters | Checkbox: embed c, zoom, palette in metadata | Yes |

**Preview Panel:**
- Shows estimated dimensions (e.g., "3840 × 2160 pixels")
- Shows estimated file size
- Small preview thumbnail

**Actions:**
- "Cancel" button
- "Download" button (primary)

**Behavior:**
- Renders at requested resolution (progress bar for large exports)
- Filename format: `julia_[c-value]_[timestamp].png`
- Example: `julia_-0.75+0.27i_2024-01-15.png`

---

## Status Bar

**Location:** Bottom of canvas area, semi-transparent overlay

**Contents (left to right):**
1. **Coordinates:** Mouse position in complex plane
   - Format: "z = -0.42 + 0.31i"
   - Updates in real-time as mouse moves
2. **Zoom Level:** Current zoom factor
   - Format: "Zoom: 2.5×"
3. **[Reset View]** button
   - Returns to default zoom (1×) and center (0, 0)
   - Does NOT reset c parameter or other settings

**Behavior:**
- Fades to 50% opacity when mouse is still
- Full opacity on mouse movement
- Hidden during animation playback (to reduce distraction)

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ← → ↑ ↓ | Pan view (hold Shift for faster) |
| + / = | Zoom in |
| − / _ | Zoom out |
| 0 | Reset view (zoom and pan) |
| Space | Play/Pause animation |
| V | Toggle split view / single view |
| S | Share (copy URL to clipboard) |
| E | Open export modal |
| 1–9 | Quick switch to palette 1–9 |
| P | Cycle through presets |
| Esc | Close modals, stop animation |
| ? | Show keyboard shortcuts help |

---

## Visual Design

### Theme

**Dark theme** optimized for fractal viewing and artistic focus.

| Element | Color |
|---------|-------|
| Background | Near-black gradient (#0a0a0f → #12121a) |
| Sidebar | Glassmorphism: rgba(20, 20, 30, 0.85) with backdrop-blur |
| Cards/panels | Subtle lighter shade (#1a1a24) |
| Primary text | Light gray (#e0e0e0) |
| Secondary text | Muted gray (#888) |
| Accent color | Soft purple (#8b5cf6) |
| Accent hover | Lighter purple (#a78bfa) |
| Borders | Subtle (#2a2a35) |
| Error states | Soft red (#ef4444) |
| Success states | Soft green (#22c55e) |

**Rationale:** Dark backgrounds make fractal colors appear more vibrant and reduce eye strain during extended exploration sessions.

### Typography

| Element | Specification |
|---------|---------------|
| App title | 20px, font-weight 600, letter-spacing 0.05em |
| Section headers | 11px, uppercase, letter-spacing 0.1em, muted color |
| Labels | 13px, font-weight 400, secondary color |
| Input values | 14px, monospace font (for coordinates and numbers) |
| Buttons | 14px, font-weight 500 |
| Tooltips | 12px, font-weight 400 |

### Spacing

| Element | Value |
|---------|-------|
| Sidebar width | 280px (standard), 240px (split view) |
| Section padding | 16px |
| Gap between controls | 12px |
| Gap between sections | 20px |
| Border radius (cards) | 8px |
| Border radius (inputs) | 6px |
| Border radius (buttons) | 6px |
| Border radius (small elements) | 4px |

### Motion & Animation

| Element | Timing |
|---------|--------|
| Canvas zoom/pan transitions | 200ms ease-out |
| Sidebar section collapse/expand | 150ms ease |
| Modal open/close | 200ms fade + subtle scale |
| Button hover states | 100ms ease |
| Toast notifications | Slide in from top, 2s display, fade out |
| Color cycling | Smooth continuous (requestAnimationFrame) |
| Parameter morphing | Smooth continuous at selected speed |

### Interactive States

| State | Appearance |
|-------|------------|
| Default | Normal appearance |
| Hover | Slightly brightened, subtle scale (1.01×) for buttons |
| Active/Pressed | Accent color, slight inset appearance |
| Focus | Visible focus ring (2px accent color) for accessibility |
| Disabled | 50% opacity, cursor: not-allowed |

---

## Technical Requirements

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile: Chrome for Android, Safari for iOS (iOS 14+)

### Performance Targets

| Metric | Target |
|--------|--------|
| Initial load | < 2 seconds to interactive |
| First render (default view) | < 100ms |
| Parameter change response | < 16ms (60fps feel) |
| Full quality render | < 500ms at 200 iterations |
| Deep zoom render | < 2s to usable preview |
| Animation frame rate | Consistent 60fps |
| Memory usage | < 200MB typical |
| Export (4K) | < 10 seconds |

### Rendering Architecture

**Web Worker Pipeline:**
1. Main thread captures user input, updates React state
2. Render request dispatched to dedicated Web Worker
3. Worker computes fractal using optimized algorithm:
   - Processes in tiles for cancellation granularity
   - Uses smooth coloring for gradient quality
   - Returns ImageData buffer when complete
4. Main thread draws buffer to canvas via OffscreenCanvas or transferable
5. For animation, workers can be pooled or reused efficiently

**Progressive Rendering Strategy:**
| Phase | Resolution | Timing |
|-------|------------|--------|
| Immediate preview | 25% (1/4 res) | 0ms |
| Intermediate | 50% (1/2 res) | 100ms |
| Final quality | 100% | 200-500ms |

**Cancellation:** Any new parameter change cancels in-progress renders to prevent backlog.

### State Management

**URL State Encoding:**
All parameters encoded in URL hash for sharing:

```
#formula=julia
&c_re=-0.7
&c_im=0.27
&zoom=150
&center_re=-0.2
&center_im=0.1
&palette=twilight
&iterations=500
&view=split
```

**Behavior:**
- State syncs to URL on parameter change (debounced 300ms)
- On page load, URL parameters override defaults
- Invalid/missing parameters gracefully fall back to defaults
- Maximum URL length ~2000 chars (well within limits)

**Local Storage:**
- Saved custom gradients (up to 20)
- Recently used presets
- User preferences (default iterations, preferred view mode)

### Accessibility

- Full keyboard navigation for all controls
- ARIA labels on interactive elements
- Screen reader announcements for state changes
- Respects `prefers-reduced-motion`:
  - Disables color cycling auto-start
  - Reduces animation duration to 0
- Sufficient color contrast for UI elements (4.5:1 minimum)
- Focus indicators always visible

---

## Implementation Notes

### Technology Stack

| Need | Solution |
|------|----------|
| Framework | React (single .jsx file) |
| Styling | Tailwind CSS (core utilities) |
| Icons | Lucide React |
| Complex math | Native JavaScript (no library needed) |
| Color manipulation | Custom utility functions |
| Web Workers | Inline worker via Blob URL |

### Fractal Computation Reference

**Julia Set Algorithm (pseudocode):**
```
for each pixel (px, py) in canvas:
    // Map pixel to complex plane
    z = complex(
        centerX + (px - width/2) / zoom,
        centerY + (py - height/2) / zoom
    )
    
    iterations = 0
    while |z| <= escapeRadius AND iterations < maxIterations:
        z = f(z) + c    // f(z) depends on formula
        iterations++
    
    if iterations == maxIterations:
        color = black   // Point is in the set
    else:
        // Smooth coloring
        smoothed = iterations + 1 - log(log(|z|)) / log(2)
        color = palette[smoothed / maxIterations]
```

**Formula implementations:**
| Formula | f(z) computation |
|---------|------------------|
| Julia (z²+c) | z.re² - z.im² + c.re, 2*z.re*z.im + c.im |
| Cubic (z³+c) | z³ computed via expansion, + c |
| Burning Ship | Uses |Re(z)| and |Im(z)| before squaring |
| Tricorn | Uses complex conjugate of z before squaring |

### File Structure

Single React artifact (.jsx) containing:
- `App` - Main component, state management, layout
- `FractalCanvas` - Canvas rendering, pan/zoom handlers
- `MandelbrotCanvas` - For split view Mandelbrot display
- `Sidebar` - All control sections
- `PresetGallery` - Preset buttons grid
- `ColorPicker` - Gradient editor components
- `ExportModal` - Export dialog
- `AnimationControls` - Path animation UI
- Worker code as inline blob
- Utility functions (complex math, color interpolation)

---

## Future Enhancements (Out of Scope for V1)

- Mandelbrot-only exploration mode (full Mandelbrot viewer)
- 3D Julia sets using quaternions
- Orbit trap coloring methods
- GPU acceleration via WebGL/WebGPU
- Real-time collaborative exploration
- Zoom path recording and video export
- Audio-reactive animation
- Mobile app (React Native)

---

## Success Criteria

1. **Immediate Beauty:** Users can create a stunning image within 30 seconds of loading
2. **Sharing Works:** Pasting a shared URL exactly reproduces the view
3. **Smooth Exploration:** No jank or freezing during pan/zoom on mid-range devices  
4. **Export Quality:** Downloads produce gallery-worthy images
5. **Educational Value:** Split view clearly demonstrates Mandelbrot-Julia connection
6. **Creative Freedom:** Custom gradients enable unique artistic expression

---

*Specification Version 1.0 – Ready for Implementation*
