class Asteroids {
    constructor() {
        this.name = 'Asteroids';
        this.canvasWidth = 400;
        this.canvasHeight = 400;
        this.gameLoop = null;
        this.gameOver = false;
        this.keysDown = {};
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('asteroids-high')) || 0;
        this.lives = 3;
        this.wave = 1;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.render();
        this.resetGame();
    }

    reset() { this.resetGame(); }

    resetGame() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.ship = { x: 200, y: 200, angle: -Math.PI / 2, vx: 0, vy: 0, invincible: true, invincibleTimer: 120 };
        this.asteroids = [];
        this.bullets = [];
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.gameOver = false;
        this.shootCooldown = 0;
        this.spawnWave();
        this.setupInput();
        this.loop();
    }

    spawnWave() {
        const count = 3 + this.wave;
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.random() * this.canvasWidth;
                y = Math.random() * this.canvasHeight;
            } while (Math.hypot(x - this.ship.x, y - this.ship.y) < 100);
            this.asteroids.push(this.createAsteroid(x, y, 'large'));
        }
    }

    createAsteroid(x, y, size) {
        const sizes = { large: 40, medium: 20, small: 10 };
        const r = sizes[size];
        const speed = size === 'large' ? 1 : size === 'medium' ? 1.5 : 2.5;
        const angle = Math.random() * Math.PI * 2;
        const numVerts = 8 + Math.floor(Math.random() * 5);
        const vertices = [];
        for (let i = 0; i < numVerts; i++) {
            const a = (i / numVerts) * Math.PI * 2;
            const dist = r * (0.7 + Math.random() * 0.3);
            vertices.push({ x: Math.cos(a) * dist, y: Math.sin(a) * dist });
        }
        return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size, radius: r, vertices };
    }

    setupInput() {
        if (this._onKey) {
            document.removeEventListener('keydown', this._onKey);
            document.removeEventListener('keyup', this._onKey);
        }
        this._onKey = (e) => { this.keysDown[e.key] = e.type === 'keydown'; };
        document.addEventListener('keydown', this._onKey);
        document.addEventListener('keyup', this._onKey);

        // Touch controls
        this.canvas = this.gameArea.querySelector('canvas');
        if (this._onTouchStart) this.canvas.removeEventListener('touchstart', this._onTouchStart);
        if (this._onTouchMove) this.canvas.removeEventListener('touchmove', this._onTouchMove);
        if (this._onTouchEnd) this.canvas.removeEventListener('touchend', this._onTouchEnd);
        this.touchActive = false;
        this._onTouchStart = (e) => {
            e.preventDefault();
            this.touchActive = true;
            this.updateTouchAngle(e);
            this.keysDown['ArrowUp'] = true;
            this.shoot();
        };
        this._onTouchMove = (e) => { e.preventDefault(); if (this.touchActive) this.updateTouchAngle(e); };
        this._onTouchEnd = (e) => { e.preventDefault(); this.touchActive = false; this.keysDown['ArrowUp'] = false; };
        this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this._onTouchEnd, { passive: false });
    }

    updateTouchAngle(e) {
        const rect = this.canvas.getBoundingClientRect();
        const tx = (e.touches[0].clientX - rect.left) * (this.canvasWidth / rect.width);
        const ty = (e.touches[0].clientY - rect.top) * (this.canvasHeight / rect.height);
        this.ship.angle = Math.atan2(ty - this.ship.y, tx - this.ship.x);
    }

    shoot() {
        if (this.shootCooldown > 0 || this.gameOver) return;
        this.bullets.push({
            x: this.ship.x + Math.cos(this.ship.angle) * 15,
            y: this.ship.y + Math.sin(this.ship.angle) * 15,
            vx: Math.cos(this.ship.angle) * 7,
            vy: Math.sin(this.ship.angle) * 7,
            life: 60
        });
        this.shootCooldown = 10;
    }

    wrap(obj) {
        if (obj.x < -20) obj.x += this.canvasWidth + 40;
        if (obj.x > this.canvasWidth + 20) obj.x -= this.canvasWidth + 40;
        if (obj.y < -20) obj.y += this.canvasHeight + 40;
        if (obj.y > this.canvasHeight + 20) obj.y -= this.canvasHeight + 40;
    }

    update() {
        if (this.gameOver) return;
        if (this.shootCooldown > 0) this.shootCooldown--;

        // Ship controls
        const turnSpeed = 0.07;
        if (this.keysDown['ArrowLeft'] || this.keysDown['a']) this.ship.angle -= turnSpeed;
        if (this.keysDown['ArrowRight'] || this.keysDown['d']) this.ship.angle += turnSpeed;
        if (this.keysDown['ArrowUp'] || this.keysDown['w']) {
            this.ship.vx += Math.cos(this.ship.angle) * 0.15;
            this.ship.vy += Math.sin(this.ship.angle) * 0.15;
        }
        if (this.keysDown[' ']) this.shoot();

        // Friction
        this.ship.vx *= 0.99;
        this.ship.vy *= 0.99;
        this.ship.x += this.ship.vx;
        this.ship.y += this.ship.vy;
        this.wrap(this.ship);

        if (this.ship.invincible) {
            this.ship.invincibleTimer--;
            if (this.ship.invincibleTimer <= 0) this.ship.invincible = false;
        }

        // Move asteroids
        for (const a of this.asteroids) {
            a.x += a.vx;
            a.y += a.vy;
            this.wrap(a);
        }

        // Move bullets
        for (const b of this.bullets) {
            b.x += b.vx;
            b.y += b.vy;
            b.life--;
            this.wrap(b);
        }
        this.bullets = this.bullets.filter(b => b.life > 0);

        // Bullet-asteroid collision
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                const b = this.bullets[i], a = this.asteroids[j];
                if (!b || !a) continue;
                if (Math.hypot(b.x - a.x, b.y - a.y) < a.radius) {
                    this.bullets.splice(i, 1);
                    this.asteroids.splice(j, 1);
                    const pts = a.size === 'large' ? 20 : a.size === 'medium' ? 50 : 100;
                    this.score += pts;
                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                        localStorage.setItem('asteroids-high', this.highScore);
                    }
                    if (a.size === 'large') {
                        this.asteroids.push(this.createAsteroid(a.x, a.y, 'medium'));
                        this.asteroids.push(this.createAsteroid(a.x, a.y, 'medium'));
                    } else if (a.size === 'medium') {
                        this.asteroids.push(this.createAsteroid(a.x, a.y, 'small'));
                        this.asteroids.push(this.createAsteroid(a.x, a.y, 'small'));
                    }
                    break;
                }
            }
        }

        // Ship-asteroid collision
        if (!this.ship.invincible) {
            for (const a of this.asteroids) {
                if (Math.hypot(this.ship.x - a.x, this.ship.y - a.y) < a.radius + 10) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver = true;
                        app.showSnackbar(`Game Over! Score: ${this.score}`);
                        return;
                    }
                    this.ship.x = this.canvasWidth / 2;
                    this.ship.y = this.canvasHeight / 2;
                    this.ship.vx = 0;
                    this.ship.vy = 0;
                    this.ship.invincible = true;
                    this.ship.invincibleTimer = 120;
                    break;
                }
            }
        }

        // Wave clear
        if (this.asteroids.length === 0) {
            this.wave++;
            this.spawnWave();
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // HUD
        ctx.fillStyle = '#fff';
        ctx.font = '14px Fredoka, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 10, 20);
        ctx.textAlign = 'right';
        ctx.fillText(`Best: ${this.highScore}`, this.canvasWidth - 10, 20);
        ctx.textAlign = 'left';
        ctx.fillText(`Wave ${this.wave}`, 10, 38);
        for (let i = 0; i < this.lives; i++) {
            ctx.fillText('▲', 10 + i * 18, 56);
        }

        // Ship
        if (!this.ship.invincible || Math.floor(this.ship.invincibleTimer / 4) % 2 === 0) {
            ctx.save();
            ctx.translate(this.ship.x, this.ship.y);
            ctx.rotate(this.ship.angle);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(-10, -9);
            ctx.lineTo(-6, 0);
            ctx.lineTo(-10, 9);
            ctx.closePath();
            ctx.stroke();
            // Thrust
            if (this.keysDown['ArrowUp'] || this.keysDown['w'] || this.touchActive) {
                ctx.strokeStyle = '#f97316';
                ctx.beginPath();
                ctx.moveTo(-8, -4);
                ctx.lineTo(-16 - Math.random() * 6, 0);
                ctx.lineTo(-8, 4);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Asteroids
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        for (const a of this.asteroids) {
            ctx.beginPath();
            ctx.moveTo(a.x + a.vertices[0].x, a.y + a.vertices[0].y);
            for (let i = 1; i < a.vertices.length; i++) {
                ctx.lineTo(a.x + a.vertices[i].x, a.y + a.vertices[i].y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Bullets
        ctx.fillStyle = '#fff';
        for (const b of this.bullets) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            ctx.fillStyle = '#fff';
            ctx.font = '28px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over', this.canvasWidth / 2, this.canvasHeight / 2 - 10);
            ctx.font = '16px Fredoka, sans-serif';
            ctx.fillText(`Score: ${this.score}`, this.canvasWidth / 2, this.canvasHeight / 2 + 20);
        }
    }

    loop() {
        this.update();
        this.draw();
        if (!this.gameOver) {
            this.gameLoop = requestAnimationFrame(() => this.loop());
        }
    }

    render() {
        this.statusArea.innerHTML = '';
        this.gameArea.innerHTML = `<canvas width="${this.canvasWidth}" height="${this.canvasHeight}" style="border-radius:16px;max-width:100%;box-shadow:0 12px 32px var(--shadow-soft);"></canvas>`;
        this.canvas = this.gameArea.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.controlsArea.innerHTML = `<button class="btn btn-primary" id="ast-reset">New Game</button>`;
        document.getElementById('ast-reset').addEventListener('click', () => this.resetGame());
    }

    cleanup() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        if (this._onKey) {
            document.removeEventListener('keydown', this._onKey);
            document.removeEventListener('keyup', this._onKey);
        }
        this.gameArea.innerHTML = '';
        this.statusArea.innerHTML = '';
        this.controlsArea.innerHTML = '';
    }
}
