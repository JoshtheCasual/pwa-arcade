// Breakout - Brick breaker game
class Breakout {
    constructor() {
        this.name = 'Breakout';
        this.canvas = null;
        this.ctx = null;
        this.width = 400;
        this.height = 500;
        this.paddle = { x: 0, y: 0, width: 80, height: 12 };
        this.ball = { x: 0, y: 0, dx: 0, dy: 0, radius: 8 };
        this.bricks = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.won = false;
        this.paused = false;
        this.gameLoop = null;
        this.level = 1;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.setupControls();
        this.reset();
    }

    setupControls() {
        this.keyHandler = (e) => {
            if (this.gameOver) return;
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                this.paddle.x = Math.max(0, this.paddle.x - 30);
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                this.paddle.x = Math.min(this.width - this.paddle.width, this.paddle.x + 30);
            } else if (e.key === ' ') {
                e.preventDefault();
                this.paused = !this.paused;
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameOver = false;
        this.won = false;
        this.paused = false;
        this.setupLevel();
        this.render();
        this.startGame();
    }

    setupLevel() {
        this.paddle.x = this.width / 2 - this.paddle.width / 2;
        this.paddle.y = this.height - 30;
        
        this.resetBall();
        
        // Create bricks
        this.bricks = [];
        const rows = 4 + Math.min(this.level, 4);
        const cols = 8;
        const brickWidth = 45;
        const brickHeight = 18;
        const padding = 4;
        const offsetX = (this.width - (cols * (brickWidth + padding))) / 2;
        
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.bricks.push({
                    x: offsetX + col * (brickWidth + padding),
                    y: 50 + row * (brickHeight + padding),
                    width: brickWidth,
                    height: brickHeight,
                    color: colors[row % colors.length],
                    hits: row < 2 ? 2 : 1
                });
            }
        }
    }

    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height - 50;
        const angle = (Math.random() * 60 + 60) * Math.PI / 180;
        const speed = 4 + this.level * 0.5;
        this.ball.dx = Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1);
        this.ball.dy = -Math.sin(angle) * speed;
    }

    startGame() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        const loop = () => {
            if (!this.gameOver) {
                this.update();
                this.draw();
                this.gameLoop = requestAnimationFrame(loop);
            }
        };
        this.gameLoop = requestAnimationFrame(loop);
    }

    update() {
        if (this.paused) return;

        // Move ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Wall collision
        if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.width) {
            this.ball.dx *= -1;
        }
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy *= -1;
        }

        // Bottom - lose life
        if (this.ball.y + this.ball.radius > this.height) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver = true;
                app.showSnackbar(`Game Over! Score: ${this.score}`);
            } else {
                this.resetBall();
            }
            return;
        }

        // Paddle collision
        if (this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width) {
            
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            const angle = (hitPos - 0.5) * Math.PI * 0.7;
            const speed = Math.sqrt(this.ball.dx ** 2 + this.ball.dy ** 2);
            
            this.ball.dx = Math.sin(angle) * speed;
            this.ball.dy = -Math.abs(Math.cos(angle) * speed);
            this.ball.y = this.paddle.y - this.ball.radius;
        }

        // Brick collision
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            if (this.ball.x + this.ball.radius > brick.x &&
                this.ball.x - this.ball.radius < brick.x + brick.width &&
                this.ball.y + this.ball.radius > brick.y &&
                this.ball.y - this.ball.radius < brick.y + brick.height) {
                
                brick.hits--;
                if (brick.hits <= 0) {
                    this.bricks.splice(i, 1);
                    this.score += 10 * this.level;
                } else {
                    brick.color = '#9ca3af';
                }
                
                // Determine bounce direction
                const overlapLeft = this.ball.x + this.ball.radius - brick.x;
                const overlapRight = brick.x + brick.width - (this.ball.x - this.ball.radius);
                const overlapTop = this.ball.y + this.ball.radius - brick.y;
                const overlapBottom = brick.y + brick.height - (this.ball.y - this.ball.radius);
                
                const minOverlapX = Math.min(overlapLeft, overlapRight);
                const minOverlapY = Math.min(overlapTop, overlapBottom);
                
                if (minOverlapX < minOverlapY) {
                    this.ball.dx *= -1;
                } else {
                    this.ball.dy *= -1;
                }
                break;
            }
        }

        // Level complete
        if (this.bricks.length === 0) {
            this.level++;
            this.setupLevel();
            app.showSnackbar(`Level ${this.level}!`);
        }
    }

    draw() {
        const canvas = document.getElementById('breakoutCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, this.width, this.height);

        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.width, this.height);

        // Bricks
        for (const brick of this.bricks) {
            ctx.fillStyle = brick.color;
            ctx.beginPath();
            ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3);
            ctx.fill();
        }

        // Paddle
        const paddleGradient = ctx.createLinearGradient(
            this.paddle.x, this.paddle.y,
            this.paddle.x, this.paddle.y + this.paddle.height
        );
        paddleGradient.addColorStop(0, '#60a5fa');
        paddleGradient.addColorStop(1, '#3b82f6');
        ctx.fillStyle = paddleGradient;
        ctx.beginPath();
        ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, 4);
        ctx.fill();

        // Ball
        const ballGradient = ctx.createRadialGradient(
            this.ball.x - 2, this.ball.y - 2, 0,
            this.ball.x, this.ball.y, this.ball.radius
        );
        ballGradient.addColorStop(0, '#ffffff');
        ballGradient.addColorStop(1, '#e5e5e5');
        ctx.fillStyle = ballGradient;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pause overlay
        if (this.paused) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 32px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', this.width / 2, this.height / 2);
        }

        // Game over overlay
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 32px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
        }
    }

    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="breakoutReset">New Game</button>
            <p style="margin-top: 8px; font-size: 12px;">← → or A/D to move, Space to pause</p>
        `;

        document.getElementById('breakoutReset')?.addEventListener('click', () => this.reset());

        this.statusArea.textContent = `Score: ${this.score} | Lives: ${'❤️'.repeat(this.lives)} | Level: ${this.level}`;

        this.gameArea.innerHTML = `
            <div class="breakout-game">
                <canvas id="breakoutCanvas" width="${this.width}" height="${this.height}"></canvas>
                <div class="breakout-controls">
                    <button class="breakout-btn" id="breakoutLeft">◀</button>
                    <button class="breakout-btn" id="breakoutRight">▶</button>
                </div>
            </div>
        `;

        if (!document.getElementById('breakout-styles')) {
            const style = document.createElement('style');
            style.id = 'breakout-styles';
            style.textContent = `
                .breakout-game { text-align: center; }
                #breakoutCanvas { 
                    max-width: 100%; height: auto; border-radius: 4px;
                    touch-action: none;
                }
                .breakout-controls { 
                    display: flex; gap: 20px; justify-content: center; margin-top: 12px;
                }
                .breakout-btn {
                    width: 60px; height: 50px; border: none; border-radius: 8px;
                    background: #4a4a4a; color: white; font-size: 24px;
                    cursor: pointer; touch-action: manipulation;
                }
                .breakout-btn:active { background: #666; }
            `;
            document.head.appendChild(style);
        }

        // Touch controls
        document.getElementById('breakoutLeft')?.addEventListener('click', () => {
            this.paddle.x = Math.max(0, this.paddle.x - 30);
        });
        document.getElementById('breakoutRight')?.addEventListener('click', () => {
            this.paddle.x = Math.min(this.width - this.paddle.width, this.paddle.x + 30);
        });

        // Touch/mouse drag on canvas
        const canvas = document.getElementById('breakoutCanvas');
        if (canvas) {
            const handleMove = (clientX) => {
                const rect = canvas.getBoundingClientRect();
                const scaleX = this.width / rect.width;
                const x = (clientX - rect.left) * scaleX;
                this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, x - this.paddle.width / 2));
            };

            canvas.addEventListener('mousemove', (e) => handleMove(e.clientX));
            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                handleMove(e.touches[0].clientX);
            });
        }

        this.draw();
    }

    cleanup() {
        document.removeEventListener('keydown', this.keyHandler);
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
    }
}
