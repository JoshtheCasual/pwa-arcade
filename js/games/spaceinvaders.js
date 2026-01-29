class SpaceInvaders {
    constructor() {
        this.name = 'Space Invaders';
        this.canvasWidth = 400;
        this.canvasHeight = 500;
        this.gameLoop = null;
        this.gameOver = false;
        this.keysDown = {};
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('spaceinvaders-high')) || 0;
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
        this.player = { x: 200, y: 460, w: 30, h: 16 };
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.gameOver = false;
        this.playerBullets = [];
        this.alienBullets = [];
        this.alienDir = 1;
        this.alienSpeed = 1;
        this.frameCount = 0;
        this.shootCooldown = 0;
        this.initAliens();
        this.initShields();
        this.setupInput();
        this.loop();
    }

    initAliens() {
        this.aliens = [];
        const rowPoints = [30, 20, 20, 10, 10];
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 8; c++) {
                this.aliens.push({
                    x: 50 + c * 40,
                    y: 60 + r * 32,
                    type: r,
                    points: rowPoints[r],
                    alive: true
                });
            }
        }
    }

    initShields() {
        this.shields = [];
        for (let s = 0; s < 4; s++) {
            const sx = 55 + s * 90;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 5; c++) {
                    this.shields.push({ x: sx + c * 8, y: 390 + r * 8, w: 8, h: 8, health: 3 });
                }
            }
        }
    }

    setupInput() {
        if (this._onKey) {
            document.removeEventListener('keydown', this._onKey);
            document.removeEventListener('keyup', this._onKey);
        }
        this._onKey = (e) => { this.keysDown[e.key] = e.type === 'keydown'; };
        document.addEventListener('keydown', this._onKey);
        document.addEventListener('keyup', this._onKey);

        this.canvas = this.gameArea.querySelector('canvas');
        if (this._onTouch) this.canvas.removeEventListener('touchmove', this._onTouch);
        if (this._onTouchTap) this.canvas.removeEventListener('touchstart', this._onTouchTap);
        this._onTouch = (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.touches[0].clientX - rect.left) * (this.canvasWidth / rect.width);
            this.player.x = Math.max(this.player.w / 2, Math.min(this.canvasWidth - this.player.w / 2, x));
        };
        this._onTouchTap = (e) => {
            e.preventDefault();
            this._onTouch(e);
            this.shoot();
        };
        this.canvas.addEventListener('touchmove', this._onTouch, { passive: false });
        this.canvas.addEventListener('touchstart', this._onTouchTap, { passive: false });
    }

    shoot() {
        if (this.shootCooldown > 0 || this.gameOver) return;
        this.playerBullets.push({ x: this.player.x, y: this.player.y - 10, vy: -7 });
        this.shootCooldown = 15;
    }

    update() {
        if (this.gameOver) return;
        this.frameCount++;
        if (this.shootCooldown > 0) this.shootCooldown--;

        // Player movement
        const speed = 4;
        if (this.keysDown['ArrowLeft'] || this.keysDown['a']) this.player.x -= speed;
        if (this.keysDown['ArrowRight'] || this.keysDown['d']) this.player.x += speed;
        if (this.keysDown[' '] || this.keysDown['ArrowUp']) this.shoot();
        this.player.x = Math.max(this.player.w / 2, Math.min(this.canvasWidth - this.player.w / 2, this.player.x));

        // Move aliens
        const aliveAliens = this.aliens.filter(a => a.alive);
        const aliveCount = aliveAliens.length;
        const effectiveSpeed = this.alienSpeed * (1 + (40 - Math.min(aliveCount, 40)) * 0.05);

        let moveDown = false;
        for (const a of aliveAliens) {
            if ((a.x > this.canvasWidth - 30 && this.alienDir > 0) ||
                (a.x < 30 && this.alienDir < 0)) {
                moveDown = true;
                break;
            }
        }
        if (moveDown) {
            this.alienDir *= -1;
            for (const a of aliveAliens) a.y += 10;
        }
        for (const a of aliveAliens) a.x += effectiveSpeed * this.alienDir;

        // Alien shooting
        if (this.frameCount % 60 === 0 && aliveCount > 0) {
            // Pick random bottom alien from a column
            const cols = {};
            for (const a of aliveAliens) {
                const col = Math.round(a.x / 40);
                if (!cols[col] || a.y > cols[col].y) cols[col] = a;
            }
            const bottoms = Object.values(cols);
            const shooter = bottoms[Math.floor(Math.random() * bottoms.length)];
            this.alienBullets.push({ x: shooter.x, y: shooter.y + 12, vy: 4 });
        }

        // Move bullets
        for (const b of this.playerBullets) b.y += b.vy;
        for (const b of this.alienBullets) b.y += b.vy;
        this.playerBullets = this.playerBullets.filter(b => b.y > -10);
        this.alienBullets = this.alienBullets.filter(b => b.y < this.canvasHeight + 10);

        // Player bullets vs aliens
        for (const b of this.playerBullets) {
            for (const a of this.aliens) {
                if (!a.alive) continue;
                if (Math.abs(b.x - a.x) < 14 && Math.abs(b.y - a.y) < 12) {
                    a.alive = false;
                    b.y = -999;
                    this.score += a.points;
                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                        localStorage.setItem('spaceinvaders-high', this.highScore);
                    }
                }
            }
        }

        // Bullets vs shields
        const hitShield = (b, fromPlayer) => {
            for (let i = this.shields.length - 1; i >= 0; i--) {
                const s = this.shields[i];
                if (s.health <= 0) continue;
                if (b.x >= s.x && b.x <= s.x + s.w && b.y >= s.y && b.y <= s.y + s.h) {
                    s.health--;
                    b.y = fromPlayer ? -999 : 999;
                    return;
                }
            }
        };
        for (const b of this.playerBullets) hitShield(b, true);
        for (const b of this.alienBullets) hitShield(b, false);

        // Alien bullets vs player
        for (const b of this.alienBullets) {
            if (Math.abs(b.x - this.player.x) < this.player.w / 2 + 4 &&
                Math.abs(b.y - this.player.y) < this.player.h / 2 + 4) {
                b.y = 999;
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver = true;
                    app.showSnackbar(`Game Over! Score: ${this.score}`);
                    return;
                }
            }
        }

        // Aliens reach bottom
        for (const a of aliveAliens) {
            if (a.y > this.player.y - 20) {
                this.gameOver = true;
                app.showSnackbar(`Game Over! Score: ${this.score}`);
                return;
            }
        }

        // Wave clear
        if (aliveCount === 0) {
            this.wave++;
            this.alienSpeed += 0.3;
            this.initAliens();
        }

        this.playerBullets = this.playerBullets.filter(b => b.y > -10);
        this.alienBullets = this.alienBullets.filter(b => b.y < this.canvasHeight + 10);
    }

    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Stars
        ctx.fillStyle = '#334';
        for (let i = 0; i < 30; i++) {
            const sx = (i * 137 + 50) % this.canvasWidth;
            const sy = (i * 97 + 30) % this.canvasHeight;
            ctx.fillRect(sx, sy, 1, 1);
        }

        // HUD
        ctx.fillStyle = '#fff';
        ctx.font = '14px Fredoka, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 10, 20);
        ctx.textAlign = 'center';
        ctx.fillText(`Wave ${this.wave}`, this.canvasWidth / 2, 20);
        ctx.textAlign = 'right';
        ctx.fillText(`Best: ${this.highScore}`, this.canvasWidth - 10, 20);
        // Lives
        ctx.textAlign = 'left';
        for (let i = 0; i < this.lives; i++) {
            ctx.fillStyle = '#14b8a6';
            ctx.fillRect(10 + i * 22, 30, 16, 8);
        }

        // Shields
        for (const s of this.shields) {
            if (s.health <= 0) continue;
            const alpha = s.health / 3;
            ctx.fillStyle = `rgba(34,197,94,${alpha})`;
            ctx.fillRect(s.x, s.y, s.w, s.h);
        }

        // Aliens
        const alienColors = ['#f43f5e', '#fb923c', '#fb923c', '#facc15', '#facc15'];
        for (const a of this.aliens) {
            if (!a.alive) continue;
            ctx.fillStyle = alienColors[a.type];
            // Simple geometric shapes per row type
            const x = a.x, y = a.y;
            if (a.type === 0) {
                // Diamond
                ctx.beginPath();
                ctx.moveTo(x, y - 10); ctx.lineTo(x + 10, y);
                ctx.lineTo(x, y + 10); ctx.lineTo(x - 10, y);
                ctx.closePath(); ctx.fill();
            } else if (a.type <= 2) {
                // Triangle
                ctx.beginPath();
                ctx.moveTo(x, y - 10); ctx.lineTo(x + 10, y + 8);
                ctx.lineTo(x - 10, y + 8); ctx.closePath(); ctx.fill();
            } else {
                // Square
                ctx.fillRect(x - 8, y - 8, 16, 16);
            }
        }

        // Player
        ctx.fillStyle = '#14b8a6';
        ctx.beginPath();
        ctx.moveTo(this.player.x, this.player.y - this.player.h);
        ctx.lineTo(this.player.x + this.player.w / 2, this.player.y);
        ctx.lineTo(this.player.x - this.player.w / 2, this.player.y);
        ctx.closePath();
        ctx.fill();

        // Bullets
        ctx.fillStyle = '#5eead4';
        for (const b of this.playerBullets) ctx.fillRect(b.x - 1, b.y, 2, 8);
        ctx.fillStyle = '#fbbf24';
        for (const b of this.alienBullets) ctx.fillRect(b.x - 1, b.y, 2, 8);

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
        this.controlsArea.innerHTML = `<button class="btn btn-primary" id="si-reset">New Game</button>`;
        document.getElementById('si-reset').addEventListener('click', () => this.resetGame());
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
