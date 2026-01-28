# Stellar Web - Firework Particle System

A particle-based firework and explosion visualization with interactive controls and color themes.

---

## Project Overview

This project demonstrates particle system concepts through a firework display simulation. Explosions appear across a dark green cloudy sky, with each explosion composed of dozens of individual spark particles that follow physics-based motion with gravity, velocity decay, and fading lifetimes.

---

## Features

### Core Particle System
- **Explosions** — Bursts of particles that spawn at random positions
- **Sparks** — Individual particles with position, velocity, color, size, and lifetime
- **Physics** — Gravity pulls sparks downward, velocity decays over time
- **Trails** — Each spark leaves a fading trail behind it

### Visual Effects
- **Multi-burst** — Some explosions trigger secondary smaller explosions
- **Shooting Stars** — Occasional streaks across the sky
- **Sparkle Trail** — Glowing trails on rocket launches
- **Neon Glow** — Radial gradients create glowing particle effects

### Background
- **Dark Green Gradient Sky** — Multi-stop gradient from dark to darker green
- **Drifting Clouds** — Subtle animated cloud shapes for atmosphere

### Interactivity
- **Click to Explode** — Click anywhere to create explosions at that location
- **Real-time Controls** — Adjust parameters without reloading

---

## Controls

| Control | Description |
|---------|-------------|
| **Launch Rate** | How frequently new explosions spawn |
| **Explosion Size** | How far sparks travel from the explosion center |
| **Spark Count** | Number of particles per explosion |
| **Trail Length** | Length of the trail behind rising rockets |
| **Shooting Stars** | Toggle shooting star effects on/off |
| **Multi-burst** | Toggle secondary explosion bursts |
| **Sparkle Trail** | Toggle glowing trails on rockets |

---

## Color Themes

| Theme | Colors |
|-------|--------|
| **Rainbow** | Pink, Red, Orange, Yellow, Green, Cyan, Blue, Purple, Magenta |
| **Ocean** | Teals, Cyans, Blues, Aqua tones |
| **Fire** | Reds, Oranges, Yellows, Warm tones |
| **Pastel** | Soft Pink, Peach, Yellow, Mint, Lavender |

---

## Technical Implementation

### Particle Properties
Each spark particle tracks:
- `x, y` — Position in 2D space
- `vx, vy` — Velocity components
- `color` — RGB color values
- `life` — Remaining lifetime (1.0 to 0.0)
- `decay` — Rate of life decrease
- `size` — Particle radius
- `trail[]` — Array of previous positions

### Physics Update Loop
```
1. Add current position to trail
2. Update position: x += vx, y += vy
3. Apply gravity: vy += 0.08
4. Apply drag: vx *= 0.98, vy *= 0.98
5. Decrease life: life -= decay
6. Remove if life <= 0
```

### Rendering
- Background fade creates motion blur effect
- Radial gradients create glowing particles
- Trail rendering shows particle history
- Canvas 2D API for all drawing

---

## Live Demo

**URL:** https://meuteneuer.github.io/stellar-web-real/

---

## Files

- `index.html` — Complete application (HTML, CSS, JavaScript)
- `spec.md` — This specification document
