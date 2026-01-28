// Breakout - Brick breaker game
class Breakout {
    constructor() {
        this.name = 'Breakout';
        this.canvas = null;
        this.ctx = null;
        this.width = 320;
        this.height = 480;
        this.paddleWidth = 75;
        this.paddleHeight = 10;
        this.paddleX = 0;
        this.ballRadius = 8;
        this.ballX = 0;
        this.ballY = 0;
        this.ballDX = 4;
        this.ballDY = -4;
        this.brickRowCount = 5;
        this.brickColCount = 7;
        this.brickWidth = 40;
        this.brickHeight = 15;
        this.brickPadding = 4;
        this.brickOffsetTop = 40;
        this.brickOffsetLeft = 10;
        this.bricks = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameLoop = null;
        this.paused = true;
    }
    
    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
        this.setupControls();
    }
    
    reset() {
        this.paddleX = (this.width - this.paddleWidth) / 2;
        this.ballX = this.width / 2;
        this.ballY = this.height - 50;
        this.ballDX = 4 * (Math.random() > 0.5 ? 1 : -1);
        this.ballDY = -4;
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.paused = true;
        
        // Initialize bricks
        this.bricks = [];
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
        for (let r = 0; r < this.brickRowCount; r++) {
            this.bricks[r] = [];
            for (let c = 0; c < this.brickColCount; c++) {
                this.bricks[r][c] = {status: 1, color: colors[r]};
            }
        }
        
        this.render();
    }
    
    setupControls() {
        this.keyState = {left: false, right: false};
        
        this.keyDownHandler = (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keyState.left = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keyState.right = true;
            if (e.code === 'Space' && this.paused && !this.gameOver) {
                e.preventDefault();
                this.start();
            }
        };
        
        this.keyUpHandler = (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keyState.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keyState.right = false;
        };
        
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }
    
    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="boStart" ${!this.paused ? 'disabled' : ''}>
                ${this.gameOver ? 'New Game' : (this.paused ? 'Start' : 'Playing...')}
            </button>
            <div style="margin-top: 12px; display: flex; gap: 20px; justify-content: center;">
                <div style="text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">SCORE</div>
                    <div style="font-size: 20px; font-weight: bold;">${this.score}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">LIVES</div>
                    <div style="font-size: 20px; font-weight: bold;">${'❤️'.repeat(this.lives)}</div>
                </div>
            </div>
        `;
        
        document.getElementById('boStart')?.addEventListener('click', () => {
            if (this.gameOver) this.reset();
            if (this.paused) this.start();
        });
        
        this.statusArea.textContent = this.gameOver ? 'Game Over!' : 
            (this.paused ? 'Tap Start or press Space' : 'Break all bricks!');
        
        this.gameArea.innerHTML = `
            <div class="breakout-container">
                <canvas id="breakoutCanvas" width="${this.width}" height="${this.height}"></canvas>
                <div class="bo-touch-controls">
                    <button class="bo-touch-btn" id="boLeft">◀</button>
                    <button class="bo-touch-btn" id="boRight">▶</button>
                </div>
            </div>
            <style>
                .breakout-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                #breakoutCanvas {
                    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 8px;
                    max-width: 100%;
                }
                .bo-touch-controls {
                    display: flex;
                    gap: 20px;
                }
                .bo-touch-btn {
                    width: 70px;
                    height: 50px;
                    border: none;
                    border-radius: 12px;
                    background: var(--card-bg);
                    color: var(--text-primary);
                    font-size: 24px;
                    cursor: pointer;
                    box-shadow: var(--shadow);
                }
                .bo-touch-btn:active {
                    background: var(--bg-secondary);
                }
            </style>
        `;
        
        this.canvas = document.getElementById('breakoutCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Touch controls
        const leftBtn = document.getElementById('boLeft');
        const rightBtn = document.getElementById('boRight');
        
        leftBtn?.addEventListener('touchstart', () => this.keyState.left = true);
        leftBtn?.addEventListener('touchend', () => this.keyState.left = false);
        leftBtn?.addEventListener('mousedown', () => this.keyState.left = true);
        leftBtn?.addEventListener('mouseup', () => this.keyState.left = false);
        
        rightBtn?.addEventListener('touchstart', () => this.keyState.right = true);
        rightBtn?.addEventListener('touchend', () => this.keyState.right = false);
        rightBtn?.addEventListener('mousedown', () => this.keyState.right = true);
        rightBtn?.addEventListener('mouseup', () => this.keyState.right = false);
        
        this.draw();
    }
    
    start() {
        this.paused = false;
        this.render();
        
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        
        const loop = () => {
            if (this.paused || this.gameOver) return;
            this.update();
            this.draw();
            this.gameLoop = requestAnimationFrame(loop);
        };
        
        this.gameLoop = requestAnimationFrame(loop);
    }
    
    update() {
        // Move paddle
        if (this.keyState.left && this.paddleX > 0) {
            this.paddleX -= 7;
        }
        if (this.keyState.right && this.paddleX < this.width - this.paddleWidth) {
            this.paddleX += 7;
        }
        
        // Move ball
        this.ballX += this.ballDX;
        this.ballY += this.ballDY;
        
        // Wall collisions
        if (this.ballX + this.ballRadius > this.width || this.ballX - this.ballRadius < 0) {
            this.ballDX = -this.ballDX;
        }
        if (this.ballY - this.ballRadius < 0) {
            this.ballDY = -this.ballDY;
        }
        
        // Paddle collision
        if (this.ballY + this.ballRadius > this.height - this.paddleHeight - 10 &&
            this.ballX > this.paddleX && this.ballX < this.paddleX + this.paddleWidth) {
            this.ballDY = -Math.abs(this.ballDY);
            // Add angle based on where ball hits paddle
            const hitPos = (this.ballX - this.paddleX) / this.paddleWidth;
            this.ballDX = 8 * (hitPos - 0.5);
        }
        
        // Ball out of bounds
        if (this.ballY + this.ballRadius > this.height) {
            this.lives--;
            if (this.lives === 0) {
                this.gameOver = true;
                this.paused = true;
                app.showSnackbar(`Game Over! Score: ${this.score}`);
                this.render();
            } else {
                // Reset ball
                this.ballX = this.width / 2;
                this.ballY = this.height - 50;
                this.ballDX = 4 * (Math.random() > 0.5 ? 1 : -1);
                this.ballDY = -4;
                this.paused = true;
                this.render();
            }
            return;
        }
        
        // Brick collisions
        for (let r = 0; r < this.brickRowCount; r++) {
            for (let c = 0; c < this.brickColCount; c++) {
                const brick = this.bricks[r][c];
                if (brick.status === 1) {
                    const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
                    const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
                    
                    if (this.ballX > brickX && this.ballX < brickX + this.brickWidth &&
                        this.ballY > brickY && this.ballY < brickY + this.brickHeight) {
                        this.ballDY = -this.ballDY;
                        brick.status = 0;
                        this.score += 10;
                        
                        // Check win
                        const remaining = this.bricks.flat().filter(b => b.status === 1).length;
                        if (remaining === 0) {
                            this.gameOver = true;
                            this.paused = true;
                            app.showSnackbar(`🎉 You won! Score: ${this.score}`);
                            this.render();
                        }
                    }
                }
            }
        }
    }
    
    draw() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw bricks
        for (let r = 0; r < this.brickRowCount; r++) {
            for (let c = 0; c < this.brickColCount; c++) {
                if (this.bricks[r][c].status === 1) {
                    const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
                    const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
                    
                    this.ctx.fillStyle = this.bricks[r][c].color;
                    this.ctx.fillRect(brickX, brickY, this.brickWidth, this.brickHeight);
                }
            }
        }
        
        // Draw paddle
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.paddleX, this.height - this.paddleHeight - 10, this.paddleWidth, this.paddleHeight);
        
        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.closePath();
    }
    
    cleanup() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        if (this.keyDownHandler) document.removeEventListener('keydown', this.keyDownHandler);
        if (this.keyUpHandler) document.removeEventListener('keyup', this.keyUpHandler);
    }
}
