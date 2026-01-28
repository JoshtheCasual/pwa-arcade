// Minesweeper - Classic puzzle game
class Minesweeper {
    constructor() {
        this.name = 'Minesweeper';
        this.size = 9;
        this.mines = 10;
        this.grid = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.won = false;
        this.firstClick = true;
        this.startTime = null;
        this.timer = null;
        this.elapsed = 0;
    }
    
    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }
    
    reset() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.revealed = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
        this.flagged = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
        this.gameOver = false;
        this.won = false;
        this.firstClick = true;
        this.elapsed = 0;
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.render();
    }
    
    placeMines(excludeR, excludeC) {
        let placed = 0;
        while (placed < this.mines) {
            const r = Math.floor(Math.random() * this.size);
            const c = Math.floor(Math.random() * this.size);
            
            // Don't place on first click or adjacent cells
            const isExcluded = Math.abs(r - excludeR) <= 1 && Math.abs(c - excludeC) <= 1;
            
            if (this.grid[r][c] !== -1 && !isExcluded) {
                this.grid[r][c] = -1;
                placed++;
            }
        }
        
        // Calculate numbers
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === -1) continue;
                this.grid[r][c] = this.countAdjacentMines(r, c);
            }
        }
    }
    
    countAdjacentMines(r, c) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                    if (this.grid[nr][nc] === -1) count++;
                }
            }
        }
        return count;
    }
    
    render() {
        const flagCount = this.flagged.flat().filter(x => x).length;
        
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="msReset">New Game</button>
            <div style="margin-top: 12px; display: flex; gap: 20px; justify-content: center;">
                <div style="text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">💣 MINES</div>
                    <div style="font-size: 20px; font-weight: bold;">${this.mines - flagCount}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 12px; color: var(--text-secondary);">⏱️ TIME</div>
                    <div style="font-size: 20px; font-weight: bold;">${this.elapsed}</div>
                </div>
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: var(--text-secondary); text-align: center;">
                Long press to flag
            </div>
        `;
        
        document.getElementById('msReset')?.addEventListener('click', () => this.reset());
        
        if (this.gameOver) {
            this.statusArea.textContent = this.won ? '🎉 You won!' : '💥 Game Over!';
        } else {
            this.statusArea.textContent = 'Find all the mines!';
        }
        
        let html = `<div class="ms-container"><div class="ms-grid">`;
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const revealed = this.revealed[r][c];
                const flagged = this.flagged[r][c];
                const value = this.grid[r][c];
                
                let cellClass = 'ms-cell';
                let content = '';
                
                if (revealed) {
                    cellClass += ' revealed';
                    if (value === -1) {
                        content = '💣';
                        cellClass += ' mine';
                    } else if (value > 0) {
                        content = value;
                        cellClass += ` num-${value}`;
                    }
                } else if (flagged) {
                    content = '🚩';
                } else if (this.gameOver && value === -1) {
                    content = '💣';
                }
                
                html += `<div class="${cellClass}" data-r="${r}" data-c="${c}">${content}</div>`;
            }
        }
        
        html += `</div></div>
            <style>
                .ms-container {
                    display: flex;
                    justify-content: center;
                    padding: 10px;
                }
                .ms-grid {
                    display: grid;
                    grid-template-columns: repeat(${this.size}, 32px);
                    gap: 2px;
                    background: #999;
                    padding: 4px;
                    border-radius: 4px;
                    width: fit-content;
                    margin: 0 auto;
                }
                .ms-cell {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(145deg, #ccc, #bbb);
                    border: 2px outset #ddd;
                    font-weight: bold;
                    font-size: 14px;
                    cursor: pointer;
                    user-select: none;
                }
                .ms-cell.revealed {
                    background: #ccc;
                    border: 1px solid #999;
                }
                .ms-cell.mine {
                    background: #ff6b6b;
                }
                .ms-cell.num-1 { color: #0000ff; }
                .ms-cell.num-2 { color: #008000; }
                .ms-cell.num-3 { color: #ff0000; }
                .ms-cell.num-4 { color: #000080; }
                .ms-cell.num-5 { color: #800000; }
                .ms-cell.num-6 { color: #008080; }
                .ms-cell.num-7 { color: #000000; }
                .ms-cell.num-8 { color: #808080; }
            </style>
        `;
        
        this.gameArea.innerHTML = html;
        
        // Event handlers
        this.gameArea.querySelectorAll('.ms-cell').forEach(cell => {
            const r = parseInt(cell.dataset.r);
            const c = parseInt(cell.dataset.c);
            
            let pressTimer = null;
            
            cell.addEventListener('click', () => this.reveal(r, c));
            
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.toggleFlag(r, c);
            });
            
            cell.addEventListener('touchstart', (e) => {
                pressTimer = setTimeout(() => {
                    this.toggleFlag(r, c);
                    pressTimer = null;
                }, 500);
            });
            
            cell.addEventListener('touchend', () => {
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
            });
            
            cell.addEventListener('touchmove', () => {
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
            });
        });
    }
    
    reveal(r, c) {
        if (this.gameOver || this.revealed[r][c] || this.flagged[r][c]) return;
        
        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(r, c);
            this.startTimer();
        }
        
        this.revealed[r][c] = true;
        
        if (this.grid[r][c] === -1) {
            this.gameOver = true;
            this.stopTimer();
            app.showSnackbar('💥 Boom! Game Over!');
            this.render();
            return;
        }
        
        // Flood fill for empty cells
        if (this.grid[r][c] === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                        this.reveal(nr, nc);
                    }
                }
            }
        }
        
        this.checkWin();
        this.render();
    }
    
    toggleFlag(r, c) {
        if (this.gameOver || this.revealed[r][c]) return;
        this.flagged[r][c] = !this.flagged[r][c];
        this.render();
    }
    
    checkWin() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] !== -1 && !this.revealed[r][c]) {
                    return;
                }
            }
        }
        
        this.won = true;
        this.gameOver = true;
        this.stopTimer();
        app.showSnackbar(`🎉 You won in ${this.elapsed}s!`);
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.render();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    cleanup() {
        this.stopTimer();
    }
}
