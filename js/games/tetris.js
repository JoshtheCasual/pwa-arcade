// Tetris - Classic falling blocks
class Tetris {
    constructor() {
        this.name = 'Tetris';
        this.cols = 10;
        this.rows = 20;
        this.cellSize = 24;
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.gameLoop = null;
        this.dropInterval = 1000;
        this.lastDrop = 0;
        
        this.pieces = {
            I: { shape: [[1,1,1,1]], color: '#00f5ff' },
            O: { shape: [[1,1],[1,1]], color: '#ffd700' },
            T: { shape: [[0,1,0],[1,1,1]], color: '#9b59b6' },
            S: { shape: [[0,1,1],[1,1,0]], color: '#2ecc71' },
            Z: { shape: [[1,1,0],[0,1,1]], color: '#e74c3c' },
            J: { shape: [[1,0,0],[1,1,1]], color: '#3498db' },
            L: { shape: [[0,0,1],[1,1,1]], color: '#e67e22' }
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
            if (this.gameOver) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                case 's':
                    e.preventDefault();
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                case 'w':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case ' ':
                    e.preventDefault();
                    this.hardDrop();
                    break;
                case 'p':
                    this.paused = !this.paused;
                    break;
            }
            this.draw();
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    reset() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.dropInterval = 1000;
        this.nextPiece = this.randomPiece();
        this.spawnPiece();
        this.render();
        this.startGame();
    }

    randomPiece() {
        const types = Object.keys(this.pieces);
        const type = types[Math.floor(Math.random() * types.length)];
        return {
            type,
            shape: this.pieces[type].shape.map(row => [...row]),
            color: this.pieces[type].color,
            x: 0,
            y: 0
        };
    }

    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.randomPiece();
        this.currentPiece.x = Math.floor((this.cols - this.currentPiece.shape[0].length) / 2);
        this.currentPiece.y = 0;

        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.gameOver = true;
            app.showSnackbar(`Game Over! Score: ${this.score}`);
        }
    }

    startGame() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.lastDrop = performance.now();
        
        const loop = (time) => {
            if (!this.gameOver) {
                if (!this.paused && time - this.lastDrop > this.dropInterval) {
                    this.drop();
                    this.lastDrop = time;
                }
                this.draw();
                this.gameLoop = requestAnimationFrame(loop);
            }
        };
        this.gameLoop = requestAnimationFrame(loop);
    }

    drop() {
        if (!this.movePiece(0, 1)) {
            this.lockPiece();
            this.clearLines();
            this.spawnPiece();
        }
    }

    hardDrop() {
        while (this.movePiece(0, 1)) {
            this.score += 2;
        }
        this.lockPiece();
        this.clearLines();
        this.spawnPiece();
    }

    movePiece(dx, dy) {
        if (this.checkCollision(this.currentPiece, dx, dy)) {
            return false;
        }
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        return true;
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        const original = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        // Wall kicks
        const kicks = [0, -1, 1, -2, 2];
        for (const kick of kicks) {
            if (!this.checkCollision(this.currentPiece, kick, 0)) {
                this.currentPiece.x += kick;
                return;
            }
        }
        this.currentPiece.shape = original;
    }

    checkCollision(piece, dx, dy) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;
                    
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return true;
                    }
                    if (newY >= 0 && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let cleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== null)) {
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

    draw() {
        const canvas = document.getElementById('tetrisCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = this.cols * this.cellSize;
        const height = this.rows * this.cellSize;
        
        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = '#2a2a4e';
        for (let x = 0; x <= this.cols; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.cellSize, 0);
            ctx.lineTo(x * this.cellSize, height);
            ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.cellSize);
            ctx.lineTo(width, y * this.cellSize);
            ctx.stroke();
        }

        // Board
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    this.drawCell(ctx, x, y, this.board[y][x]);
                }
            }
        }

        // Ghost piece
        if (this.currentPiece) {
            let ghostY = this.currentPiece.y;
            while (!this.checkCollision({ ...this.currentPiece, y: ghostY + 1 }, 0, 0)) {
                ghostY++;
            }
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        ctx.fillStyle = 'rgba(255,255,255,0.1)';
                        ctx.fillRect(
                            (this.currentPiece.x + x) * this.cellSize + 1,
                            (ghostY + y) * this.cellSize + 1,
                            this.cellSize - 2,
                            this.cellSize - 2
                        );
                    }
                }
            }

            // Current piece
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawCell(ctx, this.currentPiece.x + x, this.currentPiece.y + y, this.currentPiece.color);
                    }
                }
            }
        }

        // Next piece preview
        const nextCanvas = document.getElementById('tetrisNext');
        if (nextCanvas && this.nextPiece) {
            const nctx = nextCanvas.getContext('2d');
            nctx.fillStyle = '#1a1a2e';
            nctx.fillRect(0, 0, 100, 80);
            
            const offsetX = (100 - this.nextPiece.shape[0].length * 20) / 2;
            const offsetY = (80 - this.nextPiece.shape.length * 20) / 2;
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        nctx.fillStyle = this.nextPiece.color;
                        nctx.fillRect(offsetX + x * 20 + 1, offsetY + y * 20 + 1, 18, 18);
                    }
                }
            }
        }

        // Overlays
        if (this.paused) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', width / 2, height / 2);
        }

        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', width / 2, height / 2);
        }

        this.statusArea.textContent = `Score: ${this.score} | Lines: ${this.lines} | Level: ${this.level}`;
    }

    drawCell(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * this.cellSize + 1, y * this.cellSize + 1, this.cellSize - 2, this.cellSize - 2);
        
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(x * this.cellSize + 1, y * this.cellSize + 1, this.cellSize - 2, 4);
    }

    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="tetrisReset">New Game</button>
            <p style="margin-top: 8px; font-size: 12px;">← → Move | ↑ Rotate | ↓ Soft drop | Space Hard drop</p>
        `;

        document.getElementById('tetrisReset')?.addEventListener('click', () => this.reset());

        this.gameArea.innerHTML = `
            <div class="tetris-container">
                <canvas id="tetrisCanvas" width="${this.cols * this.cellSize}" height="${this.rows * this.cellSize}"></canvas>
                <div class="tetris-sidebar">
                    <div class="tetris-next">
                        <div style="font-size: 12px; margin-bottom: 4px;">Next</div>
                        <canvas id="tetrisNext" width="100" height="80"></canvas>
                    </div>
                    <div class="tetris-touch-controls">
                        <button class="tetris-btn" data-action="rotate">↻</button>
                        <div class="tetris-btn-row">
                            <button class="tetris-btn" data-action="left">◀</button>
                            <button class="tetris-btn" data-action="down">▼</button>
                            <button class="tetris-btn" data-action="right">▶</button>
                        </div>
                        <button class="tetris-btn wide" data-action="drop">DROP</button>
                    </div>
                </div>
            </div>
        `;

        if (!document.getElementById('tetris-styles')) {
            const style = document.createElement('style');
            style.id = 'tetris-styles';
            style.textContent = `
                .tetris-container { display: flex; gap: 12px; justify-content: center; align-items: flex-start; }
                #tetrisCanvas { border: 2px solid #3a3a5e; border-radius: 4px; }
                .tetris-sidebar { display: flex; flex-direction: column; gap: 12px; }
                .tetris-next { text-align: center; }
                #tetrisNext { border: 2px solid #3a3a5e; border-radius: 4px; }
                .tetris-touch-controls { display: flex; flex-direction: column; align-items: center; gap: 4px; }
                .tetris-btn-row { display: flex; gap: 4px; }
                .tetris-btn {
                    width: 40px; height: 40px; border: none; border-radius: 6px;
                    background: #4a4a4a; color: white; font-size: 16px;
                    cursor: pointer; touch-action: manipulation;
                }
                .tetris-btn.wide { width: 100%; font-size: 12px; }
                .tetris-btn:active { background: #666; }
            `;
            document.head.appendChild(style);
        }

        // Touch controls
        this.gameArea.querySelectorAll('.tetris-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.gameOver) return;
                switch (btn.dataset.action) {
                    case 'left': this.movePiece(-1, 0); break;
                    case 'right': this.movePiece(1, 0); break;
                    case 'down': this.movePiece(0, 1); break;
                    case 'rotate': this.rotatePiece(); break;
                    case 'drop': this.hardDrop(); break;
                }
                this.draw();
            });
        });

        this.draw();
    }

    cleanup() {
        document.removeEventListener('keydown', this.keyHandler);
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
    }
}
