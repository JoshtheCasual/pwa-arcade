// Tetris - Classic falling blocks game
class Tetris {
    constructor() {
        this.name = 'Tetris';
        this.cols = 10;
        this.rows = 20;
        this.cellSize = 24;
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.pieceX = 0;
        this.pieceY = 0;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = true;
        this.gameLoop = null;
        this.dropInterval = 1000;
        this.lastDrop = 0;
        
        this.pieces = {
            I: {shape: [[1,1,1,1]], color: '#06b6d4'},
            O: {shape: [[1,1],[1,1]], color: '#eab308'},
            T: {shape: [[0,1,0],[1,1,1]], color: '#a855f7'},
            S: {shape: [[0,1,1],[1,1,0]], color: '#22c55e'},
            Z: {shape: [[1,1,0],[0,1,1]], color: '#ef4444'},
            J: {shape: [[1,0,0],[1,1,1]], color: '#3b82f6'},
            L: {shape: [[0,0,1],[1,1,1]], color: '#f97316'}
        };
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
            if (this.gameOver || this.paused) {
                if (e.code === 'Space') {
                    e.preventDefault();
                    if (this.gameOver) this.reset();
                    this.start();
                }
                return;
            }
            
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    e.preventDefault();
                    this.move(-1);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    e.preventDefault();
                    this.move(1);
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    e.preventDefault();
                    this.softDrop();
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    e.preventDefault();
                    this.rotate();
                    break;
                case 'Space':
                    e.preventDefault();
                    this.hardDrop();
                    break;
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
    }
    
    reset() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = true;
        this.dropInterval = 1000;
        this.nextPiece = this.randomPiece();
        this.spawnPiece();
        this.render();
    }
    
    randomPiece() {
        const types = Object.keys(this.pieces);
        const type = types[Math.floor(Math.random() * types.length)];
        return {type, ...this.pieces[type]};
    }
    
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.randomPiece();
        this.pieceX = Math.floor((this.cols - this.currentPiece.shape[0].length) / 2);
        this.pieceY = 0;
        
        if (this.collides()) {
            this.gameOver = true;
            this.paused = true;
            app.showSnackbar(`Game Over! Score: ${this.score}`);
        }
    }
    
    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="tetrisStart" ${!this.paused && !this.gameOver ? 'disabled' : ''}>
                ${this.gameOver ? 'New Game' : (this.paused ? 'Start' : 'Playing...')}
            </button>
            <div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; text-align: center;">
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary);">SCORE</div>
                    <div style="font-size: 16px; font-weight: bold;">${this.score}</div>
                </div>
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary);">LINES</div>
                    <div style="font-size: 16px; font-weight: bold;">${this.lines}</div>
                </div>
                <div>
                    <div style="font-size: 11px; color: var(--text-secondary);">LEVEL</div>
                    <div style="font-size: 16px; font-weight: bold;">${this.level}</div>
                </div>
            </div>
        `;
        
        document.getElementById('tetrisStart')?.addEventListener('click', () => {
            if (this.gameOver) this.reset();
            if (this.paused) this.start();
        });
        
        this.statusArea.textContent = this.gameOver ? 'Game Over!' : 
            (this.paused ? 'Press Start or Space' : 'Playing');
        
        this.gameArea.innerHTML = `
            <div class="tetris-container">
                <div class="tetris-main">
                    <canvas id="tetrisCanvas" width="${this.cols * this.cellSize}" height="${this.rows * this.cellSize}"></canvas>
                </div>
                <div class="tetris-side">
                    <div class="next-label">NEXT</div>
                    <canvas id="nextCanvas" width="80" height="80"></canvas>
                </div>
            </div>
            <div class="tetris-controls">
                <button class="t-btn" id="tRotate">↻</button>
                <div class="t-btn-row">
                    <button class="t-btn" id="tLeft">◀</button>
                    <button class="t-btn" id="tDown">▼</button>
                    <button class="t-btn" id="tRight">▶</button>
                </div>
                <button class="t-btn drop" id="tDrop">⬇</button>
            </div>
            <style>
                .tetris-container {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                }
                .tetris-main {
                    background: #111;
                    padding: 4px;
                    border-radius: 4px;
                }
                #tetrisCanvas {
                    display: block;
                }
                .tetris-side {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }
                .next-label {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                #nextCanvas {
                    background: #222;
                    border-radius: 4px;
                }
                .tetris-controls {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    margin-top: 16px;
                }
                .t-btn-row {
                    display: flex;
                    gap: 8px;
                }
                .t-btn {
                    width: 50px;
                    height: 50px;
                    border: none;
                    border-radius: 12px;
                    background: var(--card-bg);
                    color: var(--text-primary);
                    font-size: 20px;
                    cursor: pointer;
                    box-shadow: var(--shadow);
                }
                .t-btn:active {
                    background: var(--bg-secondary);
                    transform: scale(0.95);
                }
                .t-btn.drop {
                    width: 100px;
                    background: #3b82f6;
                    color: white;
                }
            </style>
        `;
        
        // Touch controls
        document.getElementById('tLeft')?.addEventListener('click', () => this.move(-1));
        document.getElementById('tRight')?.addEventListener('click', () => this.move(1));
        document.getElementById('tDown')?.addEventListener('click', () => this.softDrop());
        document.getElementById('tRotate')?.addEventListener('click', () => this.rotate());
        document.getElementById('tDrop')?.addEventListener('click', () => this.hardDrop());
        
        this.draw();
        this.drawNext();
    }
    
    start() {
        this.paused = false;
        this.lastDrop = performance.now();
        this.render();
        
        const loop = (time) => {
            if (this.paused || this.gameOver) return;
            
            if (time - this.lastDrop > this.dropInterval) {
                this.softDrop();
                this.lastDrop = time;
            }
            
            this.draw();
            this.gameLoop = requestAnimationFrame(loop);
        };
        
        this.gameLoop = requestAnimationFrame(loop);
    }
    
    draw() {
        const canvas = document.getElementById('tetrisCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw board
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    this.drawCell(ctx, x, y, this.board[y][x]);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawCell(ctx, this.pieceX + x, this.pieceY + y, this.currentPiece.color);
                    }
                }
            }
        }
        
        // Draw grid
        ctx.strokeStyle = '#222';
        for (let x = 0; x <= this.cols; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.cellSize, 0);
            ctx.lineTo(x * this.cellSize, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.cellSize);
            ctx.lineTo(canvas.width, y * this.cellSize);
            ctx.stroke();
        }
    }
    
    drawNext() {
        const canvas = document.getElementById('nextCanvas');
        if (!canvas || !this.nextPiece) return;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const shape = this.nextPiece.shape;
        const offsetX = (80 - shape[0].length * 18) / 2;
        const offsetY = (80 - shape.length * 18) / 2;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    ctx.fillStyle = this.nextPiece.color;
                    ctx.fillRect(offsetX + x * 18, offsetY + y * 18, 16, 16);
                }
            }
        }
    }
    
    drawCell(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * this.cellSize + 1, y * this.cellSize + 1, this.cellSize - 2, this.cellSize - 2);
    }
    
    collides(shape = this.currentPiece.shape, px = this.pieceX, py = this.pieceY) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = px + x;
                    const newY = py + y;
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) return true;
                    if (newY >= 0 && this.board[newY][newX]) return true;
                }
            }
        }
        return false;
    }
    
    move(dir) {
        if (this.paused || this.gameOver) return;
        if (!this.collides(this.currentPiece.shape, this.pieceX + dir, this.pieceY)) {
            this.pieceX += dir;
            this.draw();
        }
    }
    
    rotate() {
        if (this.paused || this.gameOver) return;
        const shape = this.currentPiece.shape;
        const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
        
        if (!this.collides(rotated)) {
            this.currentPiece.shape = rotated;
            this.draw();
        }
    }
    
    softDrop() {
        if (this.paused || this.gameOver) return;
        if (!this.collides(this.currentPiece.shape, this.pieceX, this.pieceY + 1)) {
            this.pieceY++;
            this.draw();
        } else {
            this.lockPiece();
        }
    }
    
    hardDrop() {
        if (this.paused || this.gameOver) return;
        while (!this.collides(this.currentPiece.shape, this.pieceX, this.pieceY + 1)) {
            this.pieceY++;
            this.score += 2;
        }
        this.lockPiece();
    }
    
    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    if (this.pieceY + y < 0) {
                        this.gameOver = true;
                        this.paused = true;
                        app.showSnackbar(`Game Over! Score: ${this.score}`);
                        this.render();
                        return;
                    }
                    this.board[this.pieceY + y][this.pieceX + x] = this.currentPiece.color;
                }
            }
        }
        
        this.clearLines();
        this.spawnPiece();
        this.render();
    }
    
    clearLines() {
        let cleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(null));
                cleared++;
                y++;
            }
        }
        
        if (cleared > 0) {
            const points = [0, 100, 300, 500, 800];
            this.score += points[cleared] * this.level;
            this.lines += cleared;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
    }
    
    cleanup() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
    }
}
