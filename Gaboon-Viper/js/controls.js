// Input controls for Gaboon Viper game

class Controls {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseMode = false;
        this.mousePosition = { x: 0, y: 0 };
        this.touchStart = null;
        this.swipeThreshold = 30;

        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            pause: false,
            escape: false,
            mouseToggle: false
        };

        this.lastDirection = { x: 1, y: 0 };
        this.directionQueue = [];

        this.callbacks = {
            onDirectionChange: null,
            onPause: null,
            onEscape: null,
            onMouseToggle: null
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Mouse
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        // Touch
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleKeyDown(e) {
        let direction = null;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                this.keys.up = true;
                direction = { x: 0, y: -1 };
                break;

            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.keys.down = true;
                direction = { x: 0, y: 1 };
                break;

            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.keys.left = true;
                direction = { x: -1, y: 0 };
                break;

            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.keys.right = true;
                direction = { x: 1, y: 0 };
                break;

            case 'p':
            case 'P':
            case ' ':
                e.preventDefault();
                if (this.callbacks.onPause) {
                    this.callbacks.onPause();
                }
                break;

            case 'Escape':
                e.preventDefault();
                if (this.callbacks.onEscape) {
                    this.callbacks.onEscape();
                }
                break;

            case 'm':
            case 'M':
                e.preventDefault();
                this.toggleMouseMode();
                break;
        }

        if (direction && !this.mouseMode) {
            this.queueDirection(direction);
        }
    }

    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.keys.down = false;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.keys.right = false;
                break;
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    handleClick(e) {
        // Could be used to toggle mouse mode on click
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStart = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.touchStart) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStart.x;
        const deltaY = touch.clientY - this.touchStart.y;

        // Determine swipe direction
        if (Math.abs(deltaX) > this.swipeThreshold || Math.abs(deltaY) > this.swipeThreshold) {
            let direction;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
            } else {
                direction = deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
            }

            this.queueDirection(direction);
            this.touchStart = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now()
            };
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();

        // Quick tap detection for pause
        if (this.touchStart && Date.now() - this.touchStart.time < 200) {
            const touch = e.changedTouches[0];
            const deltaX = Math.abs(touch.clientX - this.touchStart.x);
            const deltaY = Math.abs(touch.clientY - this.touchStart.y);

            if (deltaX < 10 && deltaY < 10) {
                // Tap detected - could pause or do other action
            }
        }

        this.touchStart = null;
    }

    queueDirection(direction) {
        // Don't allow reversing
        if (this.lastDirection.x + direction.x === 0 &&
            this.lastDirection.y + direction.y === 0) {
            return;
        }

        // Queue the direction
        if (this.directionQueue.length < 2) {
            const lastQueued = this.directionQueue.length > 0 ?
                this.directionQueue[this.directionQueue.length - 1] :
                this.lastDirection;

            // Don't queue same direction or reverse
            if (lastQueued.x !== direction.x || lastQueued.y !== direction.y) {
                if (lastQueued.x + direction.x !== 0 || lastQueued.y + direction.y !== 0) {
                    this.directionQueue.push(direction);
                }
            }
        }
    }

    getNextDirection() {
        if (this.directionQueue.length > 0) {
            this.lastDirection = this.directionQueue.shift();
        }
        return this.lastDirection;
    }

    getMouseDirection(snakeHead, cellSize) {
        if (!this.mouseMode) return null;

        const headX = snakeHead.x * cellSize + cellSize / 2;
        const headY = snakeHead.y * cellSize + cellSize / 2;

        const dx = this.mousePosition.x - headX;
        const dy = this.mousePosition.y - headY;

        // Determine primary direction based on mouse position
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
            return dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }
    }

    toggleMouseMode() {
        this.mouseMode = !this.mouseMode;

        if (this.callbacks.onMouseToggle) {
            this.callbacks.onMouseToggle(this.mouseMode);
        }
    }

    setCallback(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }

    reset() {
        this.directionQueue = [];
        this.lastDirection = { x: 1, y: 0 };
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            pause: false,
            escape: false,
            mouseToggle: false
        };
    }

    isMouseMode() {
        return this.mouseMode;
    }

    getMousePosition() {
        return this.mousePosition;
    }
}
