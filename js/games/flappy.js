class FlappyBird {
    constructor() {
        this.name = 'Flappy Bird';
        this.canvasWidth = 320;
        this.canvasHeight = 480;
        this.birdX = 80;
        this.birdY = 200;
        this.birdVY = 0;
        this.gravity = 0.4;
        this.flapStrength = -7;
        this.pipes = [];
        this.pipeWidth = 50;
        this.pipeGap = 140;
        this.pipeSpeed = 2;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('flappy-high')) || 0;
        this.gameOver = false;
        this.started = false;
        this.gameLoop = null;
        this.frameCount = 0;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.render();
        this.resetGame();
    }

    resetGame() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.birdY = 200;
        this.birdVY = 0;
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
        this.started = false;
        this.pipeSpeed = 2;
        this.frameCount = 0;
        this.setupInput();
        this.draw();
    }

    reset() {
        this.resetGame();
    }

    setupInput() {
        if (this._onKey) document.removeEventListener('keydown', this._onKey);
        if (this._onTap) this.canvas.removeEventListener('click', this._onTap);
        if (this._onTouch) this.canvas.removeEventListener('touchstart', this._onTouch);

        this._onKey = (e) => {
            if (e.code === 'Space' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.flap();
            }
        };
        this._onTap = () => this.flap();
        this._onTouch = (e) => { e.preventDefault(); this.flap(); };

        document.addEventListener('keydown', this._onKey);
        this.canvas.addEventListener('click', this._onTap);
        this.canvas.addEventListener('touchstart', this._onTouch, { passive: false });
    }

    flap() {
        if (this.gameOver) {
            this.resetGame();
            return;
        }
        if (!this.started) {
            this.started = true;
            this.loop();
        }
        this.birdVY = this.flapStrength;
    }

    update() {
        if (this.gameOver) return;
        this.frameCount++;

        // Bird physics
        this.birdVY += this.gravity;
        this.birdY += this.birdVY;

        // Spawn pipes
        if (this.frameCount % 90 === 0) {
            const gapY = 80 + Math.random() * (this.canvasHeight - this.pipeGap - 160);
            this.pipes.push({ x: this.canvasWidth, gapY: gapY, passed: false });
        }

        // Move pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].x -= this.pipeSpeed;

            // Score
            if (!this.pipes[i].passed && this.pipes[i].x + this.pipeWidth < this.birdX) {
                this.pipes[i].passed = true;
                this.score++;
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('flappy-high', this.highScore);
                }
            }

            // Remove off-screen
            if (this.pipes[i].x + this.pipeWidth < -10) {
                this.pipes.splice(i, 1);
            }
        }

        // Speed up
        if (this.pipeSpeed < 4) this.pipeSpeed += 0.001;

        // Collision
        const birdR = 15;
        if (this.birdY - birdR < 0 || this.birdY + birdR > this.canvasHeight) {
            this.die();
            return;
        }

        for (const pipe of this.pipes) {
            if (this.birdX + birdR > pipe.x && this.birdX - birdR < pipe.x + this.pipeWidth) {
                if (this.birdY - birdR < pipe.gapY || this.birdY + birdR > pipe.gapY + this.pipeGap) {
                    this.die();
                    return;
                }
            }
        }
    }

    die() {
        this.gameOver = true;
        app.showSnackbar(`Score: ${this.score} | Best: ${this.highScore}`);
    }

    draw() {
        const ctx = this.ctx;

        // Sky
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Ground
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(0, this.canvasHeight - 20, this.canvasWidth, 20);
        ctx.fillStyle = '#22C55E';
        ctx.fillRect(0, this.canvasHeight - 24, this.canvasWidth, 6);

        // Pipes
        for (const pipe of this.pipes) {
            // Top pipe
            ctx.fillStyle = '#16A34A';
            ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY);
            ctx.fillStyle = '#15803D';
            ctx.fillRect(pipe.x - 3, pipe.gapY - 20, this.pipeWidth + 6, 20);

            // Bottom pipe
            ctx.fillStyle = '#16A34A';
            ctx.fillRect(pipe.x, pipe.gapY + this.pipeGap, this.pipeWidth, this.canvasHeight - pipe.gapY - this.pipeGap);
            ctx.fillStyle = '#15803D';
            ctx.fillRect(pipe.x - 3, pipe.gapY + this.pipeGap, this.pipeWidth + 6, 20);
        }

        // Bird
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(this.birdX, this.birdY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F97316';
        ctx.beginPath();
        ctx.arc(this.birdX + 8, this.birdY - 2, 5, 0, Math.PI * 2);
        ctx.fill();
        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.birdX + 5, this.birdY - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.birdX + 6, this.birdY - 5, 2, 0, Math.PI * 2);
        ctx.fill();
        // Beak
        ctx.fillStyle = '#F97316';
        ctx.beginPath();
        ctx.moveTo(this.birdX + 14, this.birdY);
        ctx.lineTo(this.birdX + 22, this.birdY + 3);
        ctx.lineTo(this.birdX + 14, this.birdY + 6);
        ctx.closePath();
        ctx.fill();

        // Score
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(this.score, this.canvasWidth / 2, 50);
        ctx.fillText(this.score, this.canvasWidth / 2, 50);

        if (!this.started) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            ctx.fillStyle = '#fff';
            ctx.font = '22px Fredoka, sans-serif';
            ctx.fillText('Tap to Start', this.canvasWidth / 2, this.canvasHeight / 2);
        }

        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            ctx.fillStyle = '#fff';
            ctx.font = '28px Fredoka, sans-serif';
            ctx.fillText('Game Over', this.canvasWidth / 2, this.canvasHeight / 2 - 20);
            ctx.font = '18px Fredoka, sans-serif';
            ctx.fillText(`Score: ${this.score}  Best: ${this.highScore}`, this.canvasWidth / 2, this.canvasHeight / 2 + 15);
            ctx.fillText('Tap to Restart', this.canvasWidth / 2, this.canvasHeight / 2 + 45);
        }
    }

    loop() {
        this.update();
        this.draw();
        if (!this.gameOver) {
            this.gameLoop = requestAnimationFrame(() => this.loop());
        } else {
            this.draw();
        }
    }

    render() {
        this.statusArea.innerHTML = '';
        this.gameArea.innerHTML = `<canvas width="${this.canvasWidth}" height="${this.canvasHeight}" style="border-radius:16px;max-width:100%;box-shadow:0 12px 32px var(--shadow-soft);"></canvas>`;
        this.canvas = this.gameArea.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.controlsArea.innerHTML = `<button class="btn btn-primary" id="flappy-reset">New Game</button>`;
        document.getElementById('flappy-reset').addEventListener('click', () => this.resetGame());
    }

    cleanup() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        if (this._onKey) document.removeEventListener('keydown', this._onKey);
        this.gameArea.innerHTML = '';
        this.statusArea.innerHTML = '';
        this.controlsArea.innerHTML = '';
    }
}
