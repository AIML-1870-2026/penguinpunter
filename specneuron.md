# Decision Neuron: "Is Using AI Worth It?"

## Specification Document

---

## Overview

An interactive single-neuron visualization that helps users explore the decision: **"Is using AI worth it for this task, even if it hurts the environment?"**

Users can adjust inputs, visualize decision boundaries, train the neuron with labeled examples, and analyze input sensitivity—all through an intuitive, animated interface.

---

## Decision Domain

| Output | Meaning |
|--------|---------|
| **Yes** (probability ≥ 0.5) | Using AI is worth it for this task |
| **No** (probability < 0.5) | Using AI is not worth it for this task |

---

## Inputs

| Input | Description | Range | Expected Weight Sign |
|-------|-------------|-------|---------------------|
| **Task Complexity** | How much AI actually helps with this task | 0.0 – 1.0 | Positive (+) |
| **Time Saved** | Efficiency gain from using AI | 0.0 – 1.0 | Positive (+) |
| **Environmental Cost** | Energy usage / environmental impact of the AI task | 0.0 – 1.0 | Negative (−) |
| **Alternative Difficulty** | How hard it is to do the task without AI | 0.0 – 1.0 | Positive (+) |
| **Task Importance** | How much it matters to get this task right | 0.0 – 1.0 | Positive (+) |

---

## Neuron Math

### Weighted Sum
```
z = Σ(xᵢ · wᵢ) + b
```

Where:
- `xᵢ` = input values
- `wᵢ` = learned weights
- `b` = bias term

### Activation Function (Sigmoid)
```
output = σ(z) = 1 / (1 + e⁻ᶻ)
```

### Bias Interpretation

| Bias Value | Meaning |
|------------|---------|
| Positive (+) | Baseline tendency toward "Yes, use AI" |
| Negative (−) | Baseline tendency toward "No, don't use AI" |
| Range | -3.0 to +3.0 (adjustable) |

---

## Feature 1: Interactive Neuron Panel

### Left Panel – Input Controls
- Five sliders (one per input)
- Each slider shows:
  - Input name and description
  - Current value (0.0 – 1.0)
  - Associated weight badge (e.g., `w: 0.8`)
- Sliders update the visualization in real-time

### Center Panel – Neuron Visualization
- Animated node graph showing:
  - Input nodes on the left
  - Connection lines to central neuron (color/thickness reflects weight)
  - Central neuron node displaying output probability
- Probability displayed as percentage with contextual label:
  - ≥ 70%: "Definitely worth it"
  - 50–69%: "Probably worth it"
  - 30–49%: "Probably not worth it"
  - < 30%: "Not worth it"

### Right Panel – Math Breakdown
- Formula display (weighted sum + sigmoid)
- Step-by-step calculation:
  - Each input × weight = contribution
  - Sum of contributions + bias = z
  - σ(z) = final probability

### Bottom – Bias Slider
- Labeled: "AI Optimism (Bias)"
- Range: -3.0 to +3.0
- Affects the decision threshold globally

---

## Feature 2: Decision Boundary Visualizer

### 2D Heatmap
- **X-axis:** Selectable input (dropdown)
- **Y-axis:** Selectable input (dropdown)
- **Color gradient:** Cool blue → White → Magenta
  - Blue = low probability (No)
  - White = decision boundary (~50%)
  - Magenta = high probability (Yes)

### Decision Boundary Line
- **Gold contour line** at the 50% threshold
- This is the geometric "line" the neuron draws to separate Yes/No

### Crosshair Indicator
- Dot showing current slider position on the 2D plot
- Updates in real-time as sliders move

### Bias Interaction
- Moving the bias slider shifts the entire decision boundary
- Visual animation shows boundary moving

### Axis Selection
- Dropdown menus to choose which two inputs map to X and Y
- Non-selected inputs remain fixed at their slider values

---

## Feature 3: Training Mode (Step-by-Step Learning)

### Adding Training Data
- Click anywhere on the 2D decision boundary plot to add a point
- Toggle or two-button system to label points:
  - **"Worth It" (Yes)** – displayed in magenta
  - **"Not Worth It" (No)** – displayed in blue

### Training Controls

| Button | Action |
|--------|--------|
| **Step** | Advance one training iteration with animation |
| **Train** | Run multiple steps automatically (e.g., 10-100 iterations) |
| **Reset** | Clear all points and reset weights to initial values |

### Training Algorithm
- Gradient descent on binary cross-entropy loss
- Learning rate: adjustable (default 0.1)
- Single iteration updates all weights and bias

### Training Display
- Current weights for each input
- Current bias value
- Step/epoch counter
- Accuracy on training points (%)
- Loss value (optional)

### Visual Feedback
- Decision boundary line animates as weights update
- Points flash when correctly/incorrectly classified
- Smooth transition animations between steps

---

## Feature 4: Sensitivity Analysis

### Line Chart (Input Sweep)
- One curve per input
- X-axis: Input value (0 → 1)
- Y-axis: Output probability
- Each curve shows what happens when sweeping that input while holding others fixed

### Curve Characteristics
- **Steep slope** = influential input
- **Positive slope** = positive weight (e.g., Task Complexity)
- **Negative slope** = negative weight (e.g., Environmental Cost)

### Current Position Markers
- Vertical line or dot on each curve showing current slider value

### Sensitivity Bar Chart (Optional)
- Ranks inputs by absolute influence
- Bar length = |weight| or gradient magnitude
- Color indicates positive (green) or negative (red) influence

---

## UI/UX Requirements

### Visual Design
- Dark theme background (#0a0a0f or similar)
- Neon accent colors:
  - Cyan for positive weights/inputs
  - Magenta for output/yes region
  - Orange for bias
  - Gold for decision boundary
- Glowing effects on interactive elements

### Animations
- Smooth transitions for:
  - Slider value changes
  - Decision boundary movement
  - Training step updates
  - Weight value changes
- Duration: 200-400ms for micro-interactions

### Responsiveness
- Desktop: Three-panel layout (inputs | visualization | math)
- Tablet: Stacked panels with collapsible sections
- Mobile: Single-column layout with tabbed navigation

### Accessibility
- All sliders keyboard-accessible
- Color-blind friendly palette option
- Clear text labels (not just color-coded)

---

## Component Structure

```
App
├── Header
│   ├── Title: "Is Using AI Worth It?"
│   └── Mission/Help Button
├── MainPanel
│   ├── InputPanel
│   │   ├── InputSlider (×5)
│   │   └── WeightBadge (×5)
│   ├── NeuronVisualization
│   │   ├── InputNodes
│   │   ├── ConnectionLines
│   │   ├── NeuronNode
│   │   └── OutputDisplay
│   └── MathPanel
│       ├── FormulaDisplay
│       └── CalculationBreakdown
├── BiasSlider
├── DecisionBoundaryPanel
│   ├── AxisDropdowns (×2)
│   ├── HeatmapCanvas
│   ├── BoundaryLine
│   └── CrosshairDot
├── TrainingPanel
│   ├── TrainingCanvas (click to add points)
│   ├── LabelToggle (Yes/No)
│   ├── ControlButtons (Step, Train, Reset)
│   └── StatsDisplay (weights, bias, accuracy, steps)
└── SensitivityPanel
    ├── SweepLineChart
    └── InfluenceBarChart (optional)
```

---

## Default Values

### Initial Weights
| Input | Default Weight |
|-------|----------------|
| Task Complexity | +0.8 |
| Time Saved | +0.6 |
| Environmental Cost | -0.9 |
| Alternative Difficulty | +0.5 |
| Task Importance | +0.7 |

### Initial Bias
- Default: +0.5 (slight lean toward "worth it")

### Initial Input Values
- All inputs start at 0.5 (middle of range)

---

## Tech Stack (Suggested)

- **Framework:** React
- **Visualization:** D3.js or HTML Canvas
- **Styling:** Tailwind CSS or styled-components
- **Animations:** Framer Motion or CSS transitions
- **Math:** Native JS (no heavy ML libraries needed for single neuron)

---

## Future Enhancements (Out of Scope)

- Multiple neurons / hidden layers
- Save/load trained models
- Preset scenarios (coding task, research, creative writing, etc.)
- Shareable results
- Comparison mode (your intuition vs. neuron's decision)
