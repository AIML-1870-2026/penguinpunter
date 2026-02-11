# Boids Mini-Lab Specification

## Overview

Transform the provided Boids demo into an interactive mini-lab for exploring flocking behavior.

---

## Core Requirements

### 1. UI Controls

Sliders/inputs for these five parameters:

- Separation weight
- Alignment weight
- Cohesion weight
- Neighbor radius
- Max speed (or max steering force)

### 2. Presets

Three buttons that snap to distinct behaviors:

| Preset | Settings |
|--------|----------|
| **Schooling** | High alignment, medium cohesion, low separation |
| **Chaotic Swarm** | Low alignment, low cohesion, small neighbor radius |
| **Tight Cluster** | High cohesion, moderate separation |

### 3. Instrumentation

On-screen readouts:

- FPS
- Boid count
- Average speed
- Average neighbor count

Controls:

- Reset button
- Pause/Resume toggle

### 4. UX Polish

- Clear labels + tooltips (plain English) for each control
- Visible boundary rule indicator
- Toggle to switch between wrap and bounce boundaries

---

## Custom Features

### Obstacles

- Circular obstacles that boids must avoid
- Obstacle avoidance behavior integrated with flocking rules

### Mouse Interaction

- Mouse cursor attracts boids
- Attraction strength should feel natural with existing flocking behavior

### Visual Style

**Motion Trails:**
- Black, smoky trails behind each boid

**Boid Appearance:**
- Various shades of green
- Various sizes (not uniform)

---

## Summary

| Feature | Description |
|---------|-------------|
| Controls | 5 sliders (separation, alignment, cohesion, radius, speed) |
| Presets | 3 buttons (Schooling, Chaotic, Cluster) |
| Readouts | FPS, count, avg speed, avg neighbors |
| Controls | Reset, Pause/Resume |
| Boundaries | Wrap/Bounce toggle |
| Obstacles | Circular, boids avoid them |
| Mouse | Attracts boids |
| Trails | Black, smoky |
| Boids | Green shades, varied sizes |
