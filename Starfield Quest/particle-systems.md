# Particle Systems

Particle systems are a fundamental technique in computer graphics and simulation, used to create complex visual phenomena like fire, water, and magical effects. These systems manage collections of particles, each with properties like position, velocity, and lifetime, that collectively produce emergent effects through the application of basic physical rules.

Particle emitters control the creation of particles, while physics engines govern their motion and interaction, applying forces like gravity and wind. The rendering pipeline then brings these particles to life visually, often employing techniques like GPU acceleration for optimization.

In scientific visualization, particle systems help researchers model the spread of airborne viruses or simulate galaxy formation. Game developers use them to create realistic smoke from explosions or flowing lava in volcanic environments. The enduring success of particle systems highlights the power of simple rules to generate complex and visually compelling results.

---

## Particle Systems in Every Field

Think particle systems are just for video games? Think again. The same computational techniques that create fire and starfields are used by doctors, scientists, architects, and engineers to solve real-world problems.

| Field | Application |
|-------|-------------|
| 🏥 **Medicine & Public Health** | Disease Transmission Modeling |
| ⚗️ **Chemistry & Materials Science** | Molecular Dynamics Simulation |
| 🌌 **Astronomy & Astrophysics** | Galaxy Formation Simulation |
| 🌍 **Environmental Science** | Pollution & Climate Modeling |
| 🏛️ **Architecture & Urban Planning** | Crowd Flow Simulation |
| 🎬 **Film & Game Development** | Visual Effects |

---

## Simple Rules, Complex Beauty

Fire is made entirely of particles—each one born at the base, rising upward, changing color, shrinking, and fading away. There's no hand-drawn animation here. Changing simple parameters transforms the entire effect.

### Key Parameters

- **Emission Rate** — How many particles spawn per second
- **Particle Lifetime** — How long each particle exists
- **Rise Speed** — How fast particles move upward
- **Spread** — How wide particles disperse
- **Color Intensity** — Brightness and saturation of particles

> The difference between a system with particles and without reveals why particle systems are essential for realistic visual effects.

---

## What is a Particle?

Every effect you see—fire, smoke, stars, magic—is made of individual particles. Each particle is simply a bundle of numbers:

- **Position** — Where it is in space (x, y, z)
- **Velocity** — How fast it's moving and in what direction
- **Age/Lifetime** — How old it is and when it will die
- **Size** — How large it appears
- **Color/Alpha** — Its appearance and transparency

---

## Assignment: Creating a Starfield

### Main Task

Create a webpage that uses a particle system to create a starfield with the following requirements:

1. Stars should have a **trail effect** as they move
2. The webpage should have **sliders** that allow the user to control attributes of the animation
3. Suggested controllable attributes:
   - Star count
   - Speed
   - Trail length
   - Star size
   - Brightness

### Stretch Challenge

Modify the position of the sliders so that they do not cover up so much of the animation. Possibilities include:

- Moving controls outside of the display area
- Creating a collapsible/hideable control panel
- Placing controls at the bottom of the screen
- Adding a toggle button to show/hide controls
