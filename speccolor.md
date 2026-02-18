# RGB Color Studio — spec.md

## Overview
RGB Color Studio is a fun, single-page interactive web app that lets users explore color through two creative features: an animated coiled snake whose scales reflect RGB color mixing, and an additive color wheel that visualizes how colors of light combine toward white. The app also includes color accessibility tools to help users understand contrast and color vision differences.

---

## Features
- Animated coiled snake visualization that reacts to RGB slider input
- Snake breathing animation when idle
- Scale-by-scale color update along the coil when sliders change
- R, G, B sliders (0–255) with live hex code and color swatch display
- Additive color wheel showing how RGB light mixes toward white
- WCAG Contrast Checker for any two colors (AA / AAA pass/fail)
- Color Blindness Simulator (protanopia, deuteranopia, tritanopia)
- Accessible Palette Mode ensuring sufficient contrast between colors

---

## Layout
Single page, dark background, everything visible without scrolling (or minimal scroll). Two main sections sit side by side or stacked vertically:

- **Left / Top section:** Animated Snake Explorer + RGB sliders + color output display
- **Right / Bottom section:** Additive Color Wheel
- **Bottom strip / panel:** Accessibility Tools (Contrast Checker, Color Blindness Simulator, Accessible Palette Mode)

---

## Explorer Details
**Visual Metaphor:** A coiled snake rendered on a dark canvas. The snake's body is made up of individual scale segments arranged in a tight spiral coil. Each scale is drawn as a slightly rounded polygon.

**Controls:** Three sliders labeled R, G, and B (range 0–255). Below the sliders, a color swatch and hex code display the current mixed color in real time.

**Animations:**
- *Idle:* The snake breathes — its coil gently expands and contracts in a slow, looping sine-wave animation simulating inhale/exhale.
- *On interaction:* When any slider is moved, the scales update their fill color to the current RGB value. The color cascades from the snake's head to its tail in a wave-like ripple, giving the impression the color is traveling through its body.

---

## Palette / Color Wheel Details
An additive RGB color mixing wheel displayed as a canvas or SVG element. The wheel shows the spectrum of colors arranged in a circle, with the center blending toward white to demonstrate additive light mixing. The visualization is designed to be visually surprising and engaging — the exact layout is intentionally creative (spinning segments, glowing gradients, or overlapping light cones). No palette export or copy-to-clipboard functionality is needed; the wheel is purely visual and exploratory.

---

## Interactions
- Dragging any RGB slider updates the snake scales in real time with a ripple animation from head to tail.
- The snake breathes continuously when sliders are not being touched.
- The color wheel is visual/ambient — it may respond subtly to the current RGB color (e.g. a highlight or marker showing where the current color falls on the wheel).
- Contrast Checker: user inputs or picks two colors, the contrast ratio is calculated and displayed with a clear AA / AAA pass or fail badge.
- Color Blindness Simulator: user selects a deficiency type from a dropdown and the current color or palette is shown filtered through a simulation matrix.
- Accessible Palette Mode: a toggle that, when enabled, adjusts or flags palette colors that fall below sufficient contrast thresholds against each other or a user-specified background color.

---

## Visual Style
- **Theme:** Dark mode — deep charcoal or near-black background (#0d0d0d or similar)
- **Accent:** Vivid, saturated colors that pop against the dark background
- **Snake:** Styled with subtle shading on each scale to give a 3D/reptilian feel; glows slightly in its current RGB color
- **Typography:** Clean, modern sans-serif (e.g. Inter or system-ui); labels are minimal and unobtrusive
- **Overall feel:** Playful, fun, and visually striking — like a dark neon art piece

---

## Technical Notes
- Built as a single HTML file with vanilla JS and CSS (no frameworks required), or as a React JSX artifact
- Snake and color wheel rendered on an HTML5 `<canvas>` element using `requestAnimationFrame` for smooth animation
- RGB-to-HSL conversion used for color wheel calculations
- WCAG contrast ratio calculated using the standard relative luminance formula
- Color blindness simulation implemented via published transformation matrices (Brettel/Viénot method)
- No external dependencies required beyond optional use of a math utility for color conversions
