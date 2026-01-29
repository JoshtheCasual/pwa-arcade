class Pong {
    constructor() {
        this.name = 'Pong';
        this.canvasWidth = 400;
        this.canvasHeight = 300;
        this.paddleW = 10;
        this.paddleH = 60;
        this.ballSize = 8;
        this.gameLoop = null;
        this.gameOver = false;
        this.paused = false;
        this.keysDown = {};
        this.difficulty = 'medium';
        this.playerScore = 0;
        this.aiScore = 0;
        this.ballSpeed = 4;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }

    reset() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameOver = false;
        this.paused = false;
        this.ballSpeed = 4;
        this.playerY = this.canvasHeight / 2 - this.paddleH / 2;
        this.aiY = this.canvasHeight / 2 - this.paddleH / 2;
        this.resetBall();
        this.render();
        this.setupInput();
        this.loop();
    }

    resetBall() {
        this.ballX = this.canvasWidth / 2;
        this.ballY = this.canvasHeight / 2;
        this.ballSpeed = 4;
        const angle = (Math.random() * Math.PI / 3) - Math.PI / 6;
        const dir = Math.random() < 0.5 ? 1 : -1;
        this.ballVX = dir * this.ballSpeed * Math.cos(angle);
        this.ballVY = this.ballSpeed * Math.sin(angle);
    }

    setupInput() {
        this._onKey = (e) => { this.keysDown[e.key] = e.type === 'keydown'; };
        document.addEventListener('keydown', this._onKey);
        document.addEventListener('keyup', this._onKey);

        this.canvas = this.gameArea.querySelector('canvas');
        this._onTouch = (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const y = e.touches[0].clientY - rect.top;
            const scale = this.canvasHeight / rect.height;
            this.playerY = y * scale - this.paddleH / 2;
            this.playerY = Math.max(0, Math.min(this.canvasHeight - this.paddleH, this.playerY));
        };
        this.canvas.addEventListener('touchmove', this._onTouch, { passive: false });
        this.canvas.addEventListener('touchstart', this._onTouch, { passive: false });
    }

    getAiSpeed() {
        const speeds = { easy: 2, medium: 3.5, hard: 5 };
        return speeds[this.difficulty] || 3.5;
    }

    update() {
        if (this.gameOver || this.paused) return;

        // Player movement
        const pSpeed = 5;
        if (this.keysDown['ArrowUp'] || this.keysDown['w']) this.playerY -= pSpeed;
        if (this.keysDown['ArrowDown'] || this.keysDown['s']) this.playerY += pSpeed;
        this.playerY = Math.max(0, Math.min(this.canvasHeight - this.paddleH, this.playerY));

        // AI movement
        const aiSpeed = this.getAiSpeed();
        const aiCenter = this.aiY + this.paddleH / 2;
        const diff = this.ballY - aiCenter;
        if (Math.abs(diff) > 5) {
            this.aiY += Math.sign(diff) * Math.min(aiSpeed, Math.abs(diff)) + (Math.random() - 0.5) * 0.5;
        }
        this.aiY = Math.max(0, Math.min(this.canvasHeight - this.paddleH, this.aiY));

        // Ball movement
        this.ballX += this.ballVX;
        this.ballY += this.ballVY;

        // Top/bottom bounce
        if (this.ballY - this.ballSize <= 0 || this.ballY + this.ballSize >= this.canvasHeight) {
            this.ballVY = -this.ballVY;
            this.ballY = Math.max(this.ballSize, Math.min(this.canvasHeight - this.ballSize, this.ballY));
        }

        // Player paddle collision (left)
        if (this.ballX - this.ballSize <= this.paddleW + 15 &&
            this.ballY >= this.playerY && this.ballY <= this.playerY + this.paddleH &&
            this.ballVX < 0) {
            const hitPos = (this.ballY - this.playerY) / this.paddleH - 0.5;
            this.ballVX = -this.ballVX;
            this.ballVY += hitPos * 3;
            this.increaseBallSpeed();
        }

        // AI paddle collision (right)
        if (this.ballX + this.ballSize >= this.canvasWidth - this.paddleW - 15 &&
            this.ballY >= this.aiY && this.ballY <= this.aiY + this.paddleH &&
            this.ballVX > 0) {
            const hitPos = (this.ballY - this.aiY) / this.paddleH - 0.5;
            this.ballVX = -this.ballVX;
            this.ballVY += hitPos * 3;
            this.increaseBallSpeed();
        }

        // Scoring
        if (this.ballX < 0) {
            this.aiScore++;
            if (this.aiScore >= 11) { this.gameOver = true; app.showSnackbar('AI wins!'); }
            else this.resetBall();
        }
        if (this.ballX > this.canvasWidth) {
            this.playerScore++;
            if (this.playerScore >= 11) { this.gameOver = true; app.showSnackbar('You win!'); }
            else this.resetBall();
        }
    }

    increaseBallSpeed() {
        const speed = Math.sqrt(this.ballVX * this.ballVX + this.ballVY * this.ballVY);
        if (speed < 10) {
            const factor = (speed + 0.5) / speed;
            this.ballVX *= factor;
            this.ballVY *= factor;
        }
    }

    draw() {
        const ctx = this.ctx;
        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Center line
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#334';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.canvasWidth / 2, 0);
        ctx.lineTo(this.canvasWidth / 2, this.canvasHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // Scores
        ctx.fillStyle = '#445';
        ctx.font = '48px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.playerScore, this.canvasWidth / 4, 60);
        ctx.fillText(this.aiScore, 3 * this.canvasWidth / 4, 60);

        // Paddles
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(15, this.playerY, this.paddleW, this.paddleH);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(this.canvasWidth - 15 - this.paddleW, this.aiY, this.paddleW, this.paddleH);

        // Ball
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, this.ballSize, 0, Math.PI * 2);
        ctx.fill();

        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            ctx.fillStyle = '#fff';
            ctx.font = '28px Fredoka, sans-serif';
            ctx.fillText(this.playerScore >= 11 ? 'You Win!' : 'AI Wins!', this.canvasWidth / 2, this.canvasHeight / 2);
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

        this.controlsArea.innerHTML = `
            <div class="mode-selector">
                <button class="mode-btn ${this.difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
                <button class="mode-btn ${this.difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
                <button class="mode-btn ${this.difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
            </div>
            <button class="btn btn-primary" id="pong-reset">New Game</button>
        `;
        this.controlsArea.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficulty = btn.dataset.diff;
                this.reset();
            });
        });
        document.getElementById('pong-reset').addEventListener('click', () => this.reset());
    }

    cleanup() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        document.removeEventListener('keydown', this._onKey);
        document.removeEventListener('keyup', this._onKey);
        this.gameArea.innerHTML = '';
        this.statusArea.innerHTML = '';
        this.controlsArea.innerHTML = '';
    }
}
