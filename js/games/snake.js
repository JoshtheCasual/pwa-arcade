// Snake - Classic arcade game
class Snake {
    constructor() {
        this.name = 'Snake';
        this.gridSize = 20;
        this.cellSize = 15;
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.gameOver = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snake-highscore') || '0');
        this.gameLoop = null;
        this.speed = 150;
    }
    
    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
        this.setupControls();
    }
    
    reset() {
        const mid = Math.floor(this.gridSize / 2);
        this.snake = [
            {x: mid, y: mid},
            {x: mid - 1, y: mid},
            {x: mid - 2, y: mid}
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.gameOver = false;
        this.score = 0;
        this.spawnFood();
        this.render();
        this.startGame();
    }
    
    setupControls() {
        // Keyboard
        this.keyHandler = (e) => {
            const keyMap = {
                'ArrowUp': 'up', 'KeyW': 'up',
                'ArrowDown': 'down', 'KeyS': 'down',
                'ArrowLeft': 'left', 'KeyA': 'left',
                'ArrowRight': 'right', 'KeyD': 'right'
            };
            
            const newDir = keyMap[e.code];
            if (newDir) {
                e.preventDefault();
                this.setDirection(newDir);
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }
    
    setDirection(newDir) {
        const opposites = {up: 'down', down: 'up', left: 'right', right: 'left'};
        if (newDir !== opposites[this.direction]) {
            this.nextDirection = newDir;
        }
    }
    
    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="snakeReset">New Game</button>
            <div style="margin-top: 12px; text-align: center;">
                <div style="font-size: 14px; color: var(--text-secondary);">High Score: ${this.highScore}</div>
            </div>
        `;
        
        document.getElementById('snakeReset')?.addEventListener('click', () => this.reset());
        
        this.statusArea.textContent = this.gameOver ? `Game Over! Score: ${this.score}` : `Score: ${this.score}`;
        
        const width = this.gridSize * this.cellSize;
        let html = `
            <div class="snake-container">
                <div class="snake-grid" style="width: ${width}px; height: ${width}px;">
        `;
        
        // Draw snake
        this.snake.forEach((segment, i) => {
            const isHead = i === 0;
            html += `<div class="snake-segment ${isHead ? 'head' : ''}" style="
                left: ${segment.x * this.cellSize}px;
                top: ${segment.y * this.cellSize}px;
                width: ${this.cellSize - 2}px;
                height: ${this.cellSize - 2}px;
            "></div>`;
        });
        
        // Draw food
        if (this.food) {
            html += `<div class="snake-food" style="
                left: ${this.food.x * this.cellSize}px;
                top: ${this.food.y * this.cellSize}px;
                width: ${this.cellSize - 2}px;
                height: ${this.cellSize - 2}px;
            ">🍎</div>`;
        }
        
        html += `
                </div>
                <div class="snake-controls">
                    <button class="snake-btn" data-dir="up">↑</button>
                    <div class="snake-btn-row">
                        <button class="snake-btn" data-dir="left">←</button>
                        <button class="snake-btn" data-dir="down">↓</button>
                        <button class="snake-btn" data-dir="right">→</button>
                    </div>
                </div>
            </div>
            <style>
                .snake-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                .snake-grid {
                    position: relative;
                    background: linear-gradient(145deg, #1a1a2e, #16213e);
                    border-radius: 8px;
                    border: 3px solid #0f3460;
                }
                .snake-segment {
                    position: absolute;
                    background: linear-gradient(145deg, #4ade80, #22c55e);
                    border-radius: 3px;
                }
                .snake-segment.head {
                    background: linear-gradient(145deg, #86efac, #4ade80);
                    border-radius: 4px;
                }
                .snake-food {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }
                .snake-controls {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }
                .snake-btn-row {
                    display: flex;
                    gap: 8px;
                }
                .snake-btn {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    border: none;
                    background: var(--card-bg);
                    color: var(--text-primary);
                    font-size: 20px;
                    cursor: pointer;
                    box-shadow: var(--shadow);
                    transition: all 0.1s ease;
                }
                .snake-btn:active {
                    transform: scale(0.95);
                    background: var(--bg-secondary);
                }
            </style>
        `;
        
        this.gameArea.innerHTML = html;
        
        // Touch controls
        this.gameArea.querySelectorAll('.snake-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setDirection(btn.dataset.dir);
            });
        });
    }
    
    spawnFood() {
        let pos;
        do {
            pos = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.snake.some(s => s.x === pos.x && s.y === pos.y));
        this.food = pos;
    }
    
    startGame() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        
        this.gameLoop = setInterval(() => {
            this.update();
        }, this.speed);
    }
    
    update() {
        if (this.gameOver) return;
        
        this.direction = this.nextDirection;
        
        const head = {...this.snake[0]};
        
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
                this.startGame();
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
            localStorage.setItem('snake-highscore', this.highScore.toString());
            app.showSnackbar(`New High Score: ${this.score}! 🎉`);
        } else {
            app.showSnackbar(`Game Over! Score: ${this.score}`);
        }
        
        this.render();
    }
    
    cleanup() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
    }
}
