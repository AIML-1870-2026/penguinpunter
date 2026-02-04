// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 700;

// Parameters
const params = {
    separation: 1.5,
    alignment: 1.0,
    cohesion: 1.0,
    neighborRadius: 50,
    maxSpeed: 4,
    maxForce: 0.1,
    boundaryWrap: true
};

// State
let boids = [];
let obstacles = [];
let isPaused = false;
let mousePos = { x: -1000, y: -1000 };
let mouseAttraction = 0.5;

// FPS tracking
let fps = 60;
let lastTime = performance.now();
let frameCount = 0;
let fpsUpdateTime = 0;

// Green color palette
const greenShades = [
    '#10b981', '#34d399', '#6ee7b7', '#86efac', '#4ade80',
    '#22c55e', '#059669', '#047857', '#65a30d', '#84cc16'
];

// Vector utility class
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    div(n) {
        if (n !== 0) {
            this.x /= n;
            this.y /= n;
        }
        return this;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const m = this.mag();
        if (m !== 0) {
            this.div(m);
        }
        return this;
    }

    limit(max) {
        const m = this.mag();
        if (m > max) {
            this.normalize();
            this.mult(max);
        }
        return this;
    }

    setMag(mag) {
        this.normalize();
        this.mult(mag);
        return this;
    }

    dist(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    static random2D() {
        const angle = Math.random() * Math.PI * 2;
        return new Vector(Math.cos(angle), Math.sin(angle));
    }
}

// Boid class
class Boid {
    constructor(x, y) {
        this.position = new Vector(x, y);
        this.velocity = Vector.random2D();
        this.velocity.mult(Math.random() * 2 + 2);
        this.acceleration = new Vector(0, 0);
        this.size = Math.random() * 4 + 3; // Varied sizes: 3-7
        this.color = greenShades[Math.floor(Math.random() * greenShades.length)];
        this.trail = [];
        this.maxTrailLength = 20;
        this.neighborCount = 0;
    }

    edges() {
        if (params.boundaryWrap) {
            // Wrap around
            if (this.position.x > canvas.width) this.position.x = 0;
            if (this.position.x < 0) this.position.x = canvas.width;
            if (this.position.y > canvas.height) this.position.y = 0;
            if (this.position.y < 0) this.position.y = canvas.height;
        } else {
            // Bounce off edges
            const margin = 50;
            const turnFactor = 0.5;

            if (this.position.x < margin) {
                this.acceleration.x += turnFactor;
            }
            if (this.position.x > canvas.width - margin) {
                this.acceleration.x -= turnFactor;
            }
            if (this.position.y < margin) {
                this.acceleration.y += turnFactor;
            }
            if (this.position.y > canvas.height - margin) {
                this.acceleration.y -= turnFactor;
            }
        }
    }

    align(boids) {
        const perceptionRadius = params.neighborRadius;
        let steering = new Vector(0, 0);
        let total = 0;

        for (let other of boids) {
            const d = this.position.dist(other.position);
            if (other !== this && d < perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total);
            steering.setMag(params.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(params.maxForce);
            steering.mult(params.alignment);
        }

        this.neighborCount = total;
        return steering;
    }

    cohesion(boids) {
        const perceptionRadius = params.neighborRadius;
        let steering = new Vector(0, 0);
        let total = 0;

        for (let other of boids) {
            const d = this.position.dist(other.position);
            if (other !== this && d < perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(params.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(params.maxForce);
            steering.mult(params.cohesion);
        }

        return steering;
    }

    separation(boids) {
        const perceptionRadius = params.neighborRadius / 2;
        let steering = new Vector(0, 0);
        let total = 0;

        for (let other of boids) {
            const d = this.position.dist(other.position);
            if (other !== this && d < perceptionRadius) {
                let diff = Vector.sub(this.position, other.position);
                diff.div(d * d); // Weight by distance
                steering.add(diff);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total);
            steering.setMag(params.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(params.maxForce);
            steering.mult(params.separation);
        }

        return steering;
    }

    avoidObstacles() {
        let steering = new Vector(0, 0);
        const avoidRadius = 60;

        for (let obstacle of obstacles) {
            const d = this.position.dist(obstacle);
            if (d < obstacle.radius + avoidRadius) {
                let diff = Vector.sub(this.position, obstacle);
                diff.normalize();
                diff.div(d); // Stronger force when closer
                steering.add(diff);
            }
        }

        if (steering.mag() > 0) {
            steering.setMag(params.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(params.maxForce);
            steering.mult(3); // Strong avoidance
        }

        return steering;
    }

    attractToMouse() {
        const d = this.position.dist(mousePos);
        if (d < 200 && d > 5) {
            let steering = Vector.sub(mousePos, this.position);
            steering.setMag(params.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(params.maxForce);
            steering.mult(mouseAttraction);
            return steering;
        }
        return new Vector(0, 0);
    }

    flock(boids) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);
        let avoidance = this.avoidObstacles();
        let mouseForce = this.attractToMouse();

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
        this.acceleration.add(avoidance);
        this.acceleration.add(mouseForce);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(params.maxSpeed);
        this.acceleration.mult(0);

        // Update trail
        this.trail.push(this.position.copy());
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    show() {
        // Draw smoky trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i / this.trail.length) * 0.3;
            const size = (i / this.trail.length) * this.size * 0.8;
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw boid as triangle
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.size * 2, 0);
        ctx.lineTo(-this.size, this.size);
        ctx.lineTo(-this.size, -this.size);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// Obstacle class
class Obstacle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    dist(pos) {
        const dx = this.x - pos.x;
        const dy = this.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    show() {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

// Initialize boids
function initBoids(count = 100) {
    boids = [];
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        boids.push(new Boid(x, y));
    }
}

// Initialize obstacles
function initObstacles() {
    obstacles = [
        new Obstacle(300, 250, 40),
        new Obstacle(600, 450, 50),
        new Obstacle(450, 350, 35)
    ];
}

// Update UI values
function updateUIValues() {
    document.getElementById('separation-value').textContent = params.separation.toFixed(1);
    document.getElementById('alignment-value').textContent = params.alignment.toFixed(1);
    document.getElementById('cohesion-value').textContent = params.cohesion.toFixed(1);
    document.getElementById('radius-value').textContent = params.neighborRadius;
    document.getElementById('maxSpeed-value').textContent = params.maxSpeed.toFixed(1);
}

// Apply preset
function applyPreset(preset) {
    switch (preset) {
        case 'schooling':
            params.separation = 0.8;
            params.alignment = 2.5;
            params.cohesion = 1.5;
            params.neighborRadius = 70;
            params.maxSpeed = 4;
            break;
        case 'chaotic':
            params.separation = 0.5;
            params.alignment = 0.3;
            params.cohesion = 0.5;
            params.neighborRadius = 30;
            params.maxSpeed = 6;
            break;
        case 'cluster':
            params.separation = 1.2;
            params.alignment = 1.0;
            params.cohesion = 2.8;
            params.neighborRadius = 80;
            params.maxSpeed = 3;
            break;
    }
    updateUIValues();
    updateSliders();
}

// Update sliders to match params
function updateSliders() {
    document.getElementById('separation').value = params.separation;
    document.getElementById('alignment').value = params.alignment;
    document.getElementById('cohesion').value = params.cohesion;
    document.getElementById('radius').value = params.neighborRadius;
    document.getElementById('maxSpeed').value = params.maxSpeed;
}

// Calculate statistics
function updateStats() {
    let totalSpeed = 0;
    let totalNeighbors = 0;

    for (let boid of boids) {
        totalSpeed += boid.velocity.mag();
        totalNeighbors += boid.neighborCount;
    }

    const avgSpeed = boids.length > 0 ? totalSpeed / boids.length : 0;
    const avgNeighbors = boids.length > 0 ? totalNeighbors / boids.length : 0;

    document.getElementById('fps').textContent = Math.round(fps);
    document.getElementById('count').textContent = boids.length;
    document.getElementById('avgSpeed').textContent = avgSpeed.toFixed(2);
    document.getElementById('avgNeighbors').textContent = Math.round(avgNeighbors);
}

// Animation loop
function animate() {
    if (!isPaused) {
        // Clear with fade effect for trails
        ctx.fillStyle = 'rgba(10, 10, 10, 0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw obstacles
        for (let obstacle of obstacles) {
            obstacle.show();
        }

        // Update and draw boids
        for (let boid of boids) {
            boid.edges();
            boid.flock(boids);
            boid.update();
            boid.show();
        }

        // Update stats
        const currentTime = performance.now();
        frameCount++;

        if (currentTime - fpsUpdateTime > 500) {
            fps = (frameCount * 1000) / (currentTime - fpsUpdateTime);
            frameCount = 0;
            fpsUpdateTime = currentTime;
            updateStats();
        }
    }

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('separation').addEventListener('input', (e) => {
    params.separation = parseFloat(e.target.value);
    updateUIValues();
});

document.getElementById('alignment').addEventListener('input', (e) => {
    params.alignment = parseFloat(e.target.value);
    updateUIValues();
});

document.getElementById('cohesion').addEventListener('input', (e) => {
    params.cohesion = parseFloat(e.target.value);
    updateUIValues();
});

document.getElementById('radius').addEventListener('input', (e) => {
    params.neighborRadius = parseFloat(e.target.value);
    updateUIValues();
});

document.getElementById('maxSpeed').addEventListener('input', (e) => {
    params.maxSpeed = parseFloat(e.target.value);
    updateUIValues();
});

document.getElementById('preset-schooling').addEventListener('click', () => {
    applyPreset('schooling');
});

document.getElementById('preset-chaotic').addEventListener('click', () => {
    applyPreset('chaotic');
});

document.getElementById('preset-cluster').addEventListener('click', () => {
    applyPreset('cluster');
});

document.getElementById('pause').addEventListener('click', (e) => {
    isPaused = !isPaused;
    e.target.textContent = isPaused ? 'Resume' : 'Pause';
});

document.getElementById('reset').addEventListener('click', () => {
    initBoids(100);
    initObstacles();
});

document.getElementById('boundaryWrap').addEventListener('change', (e) => {
    params.boundaryWrap = e.target.checked;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

canvas.addEventListener('mouseleave', () => {
    mousePos.x = -1000;
    mousePos.y = -1000;
});

// Initialize and start
initBoids(100);
initObstacles();
updateUIValues();
animate();
