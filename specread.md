# Readable Explorer — spec.md

## Project Overview

**Readable** is an interactive web tool that lets users explore how background color, text color, and font size combinations affect readability on digital screens. It calculates WCAG contrast ratios in real time and helps users understand accessibility principles through hands-on experimentation.

The sample text used in the display area is the "Mary's Room" philosophical thought experiment — a rich, multi-paragraph passage that gives users meaningful content to evaluate readability against, rather than generic lorem ipsum.

---

## Visual Design & Theme

The page uses a **dark, atmospheric aesthetic** — a deep space/lab background image with subtle color gradients bleeding in from the edges. Control panels use frosted-glass-style cards (semi-transparent dark backgrounds with light borders). The overall vibe is "accessibility meets sci-fi research terminal."

- **Font:** System sans-serif for UI labels; a readable serif (Georgia or similar) for the sample text display area
- **Color palette for UI chrome:** Dark navy background (`#0f0f1a`), soft white text, orange accent (`#f97316`) for sliders and highlights
- **Animations:** Smooth transitions on all color changes (200ms ease), slider thumbs pulse subtly on hover

---

## Layout

The page is divided into three vertical sections:

1. **Header** — Title "Readable Explorer" with a left-side colored accent bar (gradient: red → yellow → green → blue), and a one-line description of what the tool does.

2. **Text Display Area** — A large centered card (white background by default) containing the Mary's Room passage. Background color, text color, and font size are all controlled dynamically. The card has a thick border that changes color to reflect the current WCAG compliance status (green = pass, red = fail).

3. **Control Panel Row** — Three frosted-glass cards sitting below the display area, side by side:
   - **Left card:** Background Color (R, G, B sliders + number inputs)
   - **Center card:** Text Size slider + Vision Type radio buttons
   - **Right card:** Text Color (R, G, B sliders + number inputs)

   Below the control panel row, two readout cards display **Luminosity (Background)** and **Luminosity (Text)**, and a prominent **Contrast Ratio** badge shows the calculated ratio (e.g. `4.52:1`).

---

## Required Features

### Background Color Controls
- Three range sliders labeled R, G, B — each ranging from 0 to 255
- Each slider is synchronized two-way with a number input field beside it
- Changing either the slider or the number field immediately updates the other and re-renders the display area background

### Text Color Controls
- Same as above but for text color
- Changes immediately re-render the text color in the display area

### Text Size Control
- A single range slider ranging from 10px to 72px
- Displays current value as `Xpx` label beside the slider
- Updates font size of the sample text in real time

### Text Display Area
- Shows the Mary's Room passage (3 paragraphs) rendered with the selected background color, text color, and font size
- The display card border dynamically reflects WCAG compliance (see WCAG Compliance Indicator below)

### Luminosity Displays
- Two readout cards: "Luminosity (Background)" and "Luminosity (Text)"
- Each shows the calculated relative luminance value to 3 decimal places
- Cards flash briefly (subtle glow animation) whenever the value changes

### Contrast Ratio Display
- Shows ratio in `X.XX:1` format
- Calculated per WCAG formula: `(L1 + 0.05) / (L2 + 0.05)` where L1 is the lighter luminance
- Updates in real time on any color change

---

## Contrast Ratio Calculation

Follow WCAG 2.1 relative luminance formula:

1. Normalize each RGB channel: `val / 255`
2. Apply gamma correction: if `c <= 0.04045` → `c / 12.92`, else → `((c + 0.055) / 1.055) ^ 2.4`
3. Luminance: `L = 0.2126R + 0.7152G + 0.0722B`
4. Contrast ratio: `(Llighter + 0.05) / (Darker + 0.05)`
5. Display as `X.XX:1`

---

## Synchronization Behavior

- When a slider moves → its number input updates immediately
- When a number input changes → its slider updates immediately
- All color/size changes reflect in the text display area in real time (no submit button needed)
- Contrast ratio and luminosity values recalculate automatically on every change

---

## Stretch Features (All Implemented)

### Option A: Vision Type Simulation
Radio buttons in the center control card let users simulate how the text display appears to people with different color vision types:

- Normal
- Protanopia (red-blind)
- Deuteranopia (green-blind)
- Tritanopia (blue-blind)
- Monochromacy (complete color blindness)

Color transformation matrices are applied as a CSS filter or canvas transform on the display area. Color adjustment sliders are **disabled** when any non-Normal vision type is selected (since transforms are not invertible). A small info tooltip explains why.

### Option B: WCAG Compliance Indicator
A badge panel beneath the contrast ratio displays pass/fail for both WCAG levels:

- **Normal text** — passes at ≥ 4.5:1 (AA), passes at ≥ 7:1 (AAA)
- **Large text** (≥ 18px regular or ≥ 14px bold) — passes at ≥ 3:1 (AA), passes at ≥ 4.5:1 (AAA)

Each badge is green with a checkmark for pass, red with an X for fail. The text display card border also turns green/red based on whether the current font size + ratio meets the appropriate threshold.

### Option C: Preset Color Schemes
A dropdown or row of buttons lets users load preset color combinations instantly:

- **High Contrast** — Black on White (`#000000` / `#ffffff`)
- **Low Contrast** — Gray on Gray (`#888888` / `#aaaaaa`) — intentionally failing
- **Dark Mode** — White on Dark Navy (`#ffffff` / `#1a1a2e`)
- **Ocean** — Deep teal on light cyan (`#0d4f6c` / `#e0f7fa`)
- **Problematic** — Red on Green (`#cc0000` / `#00aa00`) — fails and looks bad
- **Sunset** — Dark brown on warm peach (`#3b1f0e` / `#ffcba4`)

Selecting a preset instantly updates all six RGB sliders and their inputs.

---

## Creative Additions

### 🎨 Color History Trail
A small "recently used" row below the controls shows the last 5 background/text color pairs as tiny swatches. Clicking any swatch restores that combination. Stored in memory for the session.

### 📋 Copy as CSS Button
A small button labeled "Copy CSS" outputs the current colors and font size as a ready-to-paste CSS snippet:

```css
background-color: rgb(255, 200, 150);
color: rgb(20, 20, 20);
font-size: 18px;
```

This gets copied to clipboard with a brief "Copied!" toast confirmation.

### 🌗 Suggested Complement Button
A "Suggest Better Contrast" button analyzes the current background color and suggests a text color that meets at least AA compliance (4.5:1). It animates the text color sliders smoothly to the new values, rather than jumping instantly — making the change feel educational and intentional.

### 📊 Contrast Ratio Gauge
Instead of just a number, the contrast ratio is also visualized as a horizontal gauge bar. The bar fills from left to right and changes color: red (< 3:1) → orange (3:1–4.5:1) → yellow (4.5:1–7:1) → green (≥ 7:1). Threshold markers at 3:1, 4.5:1, and 7:1 are labeled on the gauge.

### 🔗 Shareable URL State
All current settings (background RGB, text RGB, font size, vision type) are encoded in the URL hash (e.g. `#bg=255,200,50&txt=30,30,30&size=18&vision=normal`). Sharing the URL restores the exact state. No backend required.

---

## Sample Text

The Mary's Room passage (3 paragraphs) is used as the default sample text. Users may not edit it — its purpose is to provide consistent, semantically meaningful content for readability evaluation.

---

## File Structure

```
readable/
├── index.html
├── style.css
└── script.js
```

Single-page app, no frameworks, no build tools. Vanilla HTML/CSS/JS only.

---

## Deployment

Push to a GitHub repository and enable GitHub Pages. Live URL format:
`https://[your-username].github.io/readable/`

Submit the live URL to Canvas.
