// Snake - Classic arcade game
class Snake {
    constructor() {
        this.name = 'Snake';
        this.gridSize = 20;
        this.cellSize = 20;
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snake-high') || '0');
        this.gameOver = false;
        this.paused = false;
        this.speed = 150;
        this.gameLoop = null;
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
            
            const keyMap = {
                'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right',
                'w': 'up', 's': 'down', 'a': 'left', 'd': 'right'
            };

            if (keyMap[e.key]) {
                e.preventDefault();
                const newDir = keyMap[e.key];
                const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
                if (opposites[newDir] !== this.direction) {
                    this.nextDirection = newDir;
                }
            } else if (e.key === ' ') {
                e.preventDefault();
                this.togglePause();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    reset() {
        const mid = Math.floor(this.gridSize / 2);
        this.snake = [
            { x: mid, y: mid },
            { x: mid - 1, y: mid },
            { x: mid - 2, y: mid }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameOver = false;
        this.paused = false;
        this.spawnFood();
        this.render();
        this.startGame();
    }

    startGame() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    togglePause() {
        this.paused = !this.paused;
        this.render();
    }

    spawnFood() {
        const empty = [];
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                if (!this.snake.some(s => s.x === x && s.y === y)) {
                    empty.push({ x, y });
                }
            }
        }
        if (empty.length > 0) {
            this.food = empty[Math.floor(Math.random() * empty.length)];
        }
    }

    update() {
        if (this.gameOver || this.paused) return;

        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check wall collision
        if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
            this.endGame();
            return;
        }

        // Check self collision
        if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this.endGame();
            return;
        }

        this.snake.unshift(head);

        // Check food
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.spawnFood();
            // Speed up slightly
            if (this.speed > 50) {
                this.speed -= 2;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
        } else {
            this.snake.pop();
        }

        this.render();
    }

    endGame() {
        this.gameOver = true;
        clearInterval(this.gameLoop);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snake-high', this.highScore.toString());
            app.showSnackbar(`New High Score: ${this.score}! 🎉`);
        } else {
            app.showSnackbar(`Game Over! Score: ${this.score}`);
        }
        this.render();
    }

    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="snakeReset">New Game</button>
            <button class="btn btn-secondary" id="snakePause">${this.paused ? '▶️ Resume' : '⏸️ Pause'}</button>
            <p style="margin-top: 8px; font-size: 12px;">Arrow keys or WASD to move, Space to pause</p>
        `;

        document.getElementById('snakeReset')?.addEventListener('click', () => this.reset());
        document.getElementById('snakePause')?.addEventListener('click', () => this.togglePause());

        this.statusArea.textContent = `Score: ${this.score} | High: ${this.highScore}`;

        const width = this.gridSize * this.cellSize;
        const height = this.gridSize * this.cellSize;

        let html = `<div class="snake-game">
            <canvas id="snakeCanvas" width="${width}" height="${height}"></canvas>
        `;

        // Touch controls
        html += `
            <div class="snake-controls">
                <button class="snake-btn" data-dir="up">▲</button>
                <div class="snake-btn-row">
                    <button class="snake-btn" data-dir="left">◀</button>
                    <button class="snake-btn" data-dir="right">▶</button>
                </div>
                <button class="snake-btn" data-dir="down">▼</button>
            </div>
        `;

        if (this.paused) {
            html += '<div class="snake-overlay">PAUSED</div>';
        } else if (this.gameOver) {
            html += '<div class="snake-overlay">GAME OVER</div>';
        }

        html += '</div>';
        this.gameArea.innerHTML = html;

        if (!document.getElementById('snake-styles')) {
            const style = document.createElement('style');
            style.id = 'snake-styles';
            style.textContent = `
                .snake-game { position: relative; text-align: center; }
                #snakeCanvas { 
                    background: #1a1a2e; border: 2px solid #16213e; border-radius: 4px;
                    max-width: 100%; height: auto;
                }
                .snake-overlay {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.8); color: white; padding: 20px 40px;
                    border-radius: 8px; font-size: 24px; font-weight: bold;
                }
                .snake-controls { margin-top: 16px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
                .snake-btn-row { display: flex; gap: 40px; }
                .snake-btn {
                    width: 50px; height: 50px; border: none; border-radius: 8px;
                    background: #4a4a4a; color: white; font-size: 20px;
                    cursor: pointer; touch-action: manipulation;
                }
                .snake-btn:active { background: #666; }
            `;
            document.head.appendChild(style);
        }

        // Touch controls
        this.gameArea.querySelectorAll('.snake-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const dir = btn.dataset.dir;
                const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
                if (opposites[dir] !== this.direction) {
                    this.nextDirection = dir;
                }
            });
        });

        // Draw on canvas
        const canvas = document.getElementById('snakeCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, width, height);

            // Grid
            ctx.strokeStyle = '#16213e';
            for (let i = 0; i <= this.gridSize; i++) {
                ctx.beginPath();
                ctx.moveTo(i * this.cellSize, 0);
                ctx.lineTo(i * this.cellSize, height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * this.cellSize);
                ctx.lineTo(width, i * this.cellSize);
                ctx.stroke();
            }

            // Snake
            this.snake.forEach((segment, i) => {
                const gradient = ctx.createRadialGradient(
                    segment.x * this.cellSize + this.cellSize / 2,
                    segment.y * this.cellSize + this.cellSize / 2,
                    0,
                    segment.x * this.cellSize + this.cellSize / 2,
                    segment.y * this.cellSize + this.cellSize / 2,
                    this.cellSize / 2
                );
                gradient.addColorStop(0, i === 0 ? '#4ade80' : '#22c55e');
                gradient.addColorStop(1, i === 0 ? '#22c55e' : '#16a34a');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(
                    segment.x * this.cellSize + 1,
                    segment.y * this.cellSize + 1,
                    this.cellSize - 2,
                    this.cellSize - 2,
                    4
                );
                ctx.fill();
            });

            // Food
            if (this.food) {
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(
                    this.food.x * this.cellSize + this.cellSize / 2,
                    this.food.y * this.cellSize + this.cellSize / 2,
                    this.cellSize / 2 - 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    }

    cleanup() {
        document.removeEventListener('keydown', this.keyHandler);
        if (this.gameLoop) clearInterval(this.gameLoop);
    }
}
