// Go - with AI and 2-player modes
class GoGame {
    constructor() {
        this.name = 'Go';
        this.boardSize = 9;
        this.board = [];
        this.currentPlayer = 'black';
        this.captures = { black: 0, white: 0 };
        this.previousBoard = null;
        this.passes = 0;
        this.gameOver = false;
        this.mode = 'pvp'; // Go AI is complex, default to pvp but offer simple AI
        this.lastMove = null;
    }
    
    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }
    
    reset() {
        this.board = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = Array(this.boardSize).fill(null);
        }
        this.currentPlayer = 'black';
        this.captures = { black: 0, white: 0 };
        this.previousBoard = null;
        this.passes = 0;
        this.gameOver = false;
        this.lastMove = null;
        this.render();
    }
    
    render() {
        // Controls
        this.controlsArea.innerHTML = `
            <div class="mode-selector">
                <button class="mode-btn ${this.mode === 'ai' ? 'active' : ''}" data-mode="ai">🤖 vs AI</button>
                <button class="mode-btn ${this.mode === 'pvp' ? 'active' : ''}" data-mode="pvp">👥 2 Players</button>
            </div>
            <div class="mode-selector" style="margin-top: 12px;">
                <button class="mode-btn ${this.boardSize === 9 ? 'active' : ''}" data-size="9">9×9</button>
                <button class="mode-btn ${this.boardSize === 13 ? 'active' : ''}" data-size="13">13×13</button>
                <button class="mode-btn ${this.boardSize === 19 ? 'active' : ''}" data-size="19">19×19</button>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button class="btn btn-secondary" id="goPass">Pass</button>
                <button class="btn btn-primary" id="goReset">New Game</button>
            </div>
        `;
        
        this.controlsArea.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.mode = btn.dataset.mode;
                this.reset();
            });
        });
        
        this.controlsArea.querySelectorAll('[data-size]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.boardSize = parseInt(btn.dataset.size);
                this.reset();
            });
        });
        
        document.getElementById('goPass')?.addEventListener('click', () => this.pass());
        document.getElementById('goReset')?.addEventListener('click', () => this.reset());
        
        // Status
        this.updateStatus();
        
        // Board
        const cellSize = this.boardSize === 19 ? 20 : (this.boardSize === 13 ? 24 : 28);
        
        let html = `
            <div class="go-score">
                <div class="go-score-item">
                    <div style="width:16px;height:16px;border-radius:50%;background:#222;"></div>
                    <span>Black: ${this.captures.black}</span>
                </div>
                <div class="go-score-item">
                    <div style="width:16px;height:16px;border-radius:50%;background:#eee;border:1px solid #ccc;"></div>
                    <span>White: ${this.captures.white}</span>
                </div>
            </div>
            <div class="go-board" style="grid-template-columns: repeat(${this.boardSize}, ${cellSize}px);">
        `;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const stone = this.board[row][col];
                const isStarPoint = this.isStarPoint(row, col);
                const isLastMove = this.lastMove?.row === row && this.lastMove?.col === col;
                
                html += `<div class="go-cell" data-row="${row}" data-col="${col}" style="width:${cellSize}px;height:${cellSize}px;">`;
                
                if (stone) {
                    html += `<div class="go-stone ${stone}" style="width:${cellSize - 4}px;height:${cellSize - 4}px;${isLastMove ? 'box-shadow: 0 0 0 2px var(--pink-deep);' : ''}"></div>`;
                } else if (isStarPoint) {
                    html += `<div class="go-star-point"></div>`;
                }
                
                html += '</div>';
            }
        }
        
        html += '</div>';
        this.gameArea.innerHTML = html;
        
        this.gameArea.querySelectorAll('.go-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.placeStone(row, col);
            });
        });
    }
    
    isStarPoint(row, col) {
        const points = {
            9: [[2,2], [2,6], [4,4], [6,2], [6,6]],
            13: [[3,3], [3,9], [6,6], [9,3], [9,9]],
            19: [[3,3], [3,9], [3,15], [9,3], [9,9], [9,15], [15,3], [15,9], [15,15]]
        };
        return points[this.boardSize]?.some(([r, c]) => r === row && c === col) || false;
    }
    
    placeStone(row, col) {
        if (this.gameOver || this.board[row][col]) return;
        if (this.mode === 'ai' && this.currentPlayer === 'white') return;
        
        const boardCopy = this.board.map(r => [...r]);
        this.board[row][col] = this.currentPlayer;
        
        // Check captures
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        let captured = 0;
        
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nr = row + dr;
            const nc = col + dc;
            
            if (this.isValid(nr, nc) && this.board[nr][nc] === opponent) {
                const group = this.getGroup(nr, nc);
                if (this.getLiberties(group).length === 0) {
                    captured += group.length;
                    group.forEach(([r, c]) => this.board[r][c] = null);
                }
            }
        }
        
        // Check suicide
        const ownGroup = this.getGroup(row, col);
        if (this.getLiberties(ownGroup).length === 0) {
            this.board = boardCopy;
            app.showSnackbar('Invalid move: suicide');
            return;
        }
        
        // Check ko
        if (this.previousBoard && this.boardEquals(this.board, this.previousBoard)) {
            this.board = boardCopy;
            app.showSnackbar('Invalid move: ko rule');
            return;
        }
        
        this.captures[this.currentPlayer] += captured;
        this.previousBoard = boardCopy;
        this.lastMove = { row, col };
        this.passes = 0;
        this.currentPlayer = opponent;
        
        this.render();
        
        if (this.mode === 'ai' && this.currentPlayer === 'white' && !this.gameOver) {
            this.statusArea.textContent = '🤖 AI is thinking...';
            setTimeout(() => this.aiMove(), 500);
        }
    }
    
    aiMove() {
        // Simple AI: random valid move, prefer captures
        const validMoves = [];
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (!this.board[row][col] && this.isValidMove(row, col, 'white')) {
                    const captures = this.countPotentialCaptures(row, col, 'white');
                    validMoves.push({ row, col, captures });
                }
            }
        }
        
        if (validMoves.length === 0) {
            this.pass();
            return;
        }
        
        // Sort by captures, pick from top moves with some randomness
        validMoves.sort((a, b) => b.captures - a.captures);
        const topMoves = validMoves.slice(0, Math.min(5, validMoves.length));
        const choice = topMoves[Math.floor(Math.random() * topMoves.length)];
        
        this.placeStone(choice.row, choice.col);
    }
    
    isValidMove(row, col, color) {
        if (this.board[row][col]) return false;
        
        const boardCopy = this.board.map(r => [...r]);
        this.board[row][col] = color;
        
        // Check for captures first
        const opponent = color === 'black' ? 'white' : 'black';
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nr = row + dr;
            const nc = col + dc;
            if (this.isValid(nr, nc) && this.board[nr][nc] === opponent) {
                const group = this.getGroup(nr, nc);
                if (this.getLiberties(group).length === 0) {
                    this.board = boardCopy;
                    return true; // Valid capture move
                }
            }
        }
        
        // Check suicide
        const ownGroup = this.getGroup(row, col);
        const valid = this.getLiberties(ownGroup).length > 0;
        
        this.board = boardCopy;
        return valid;
    }
    
    countPotentialCaptures(row, col, color) {
        const boardCopy = this.board.map(r => [...r]);
        this.board[row][col] = color;
        
        let captures = 0;
        const opponent = color === 'black' ? 'white' : 'black';
        
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nr = row + dr;
            const nc = col + dc;
            if (this.isValid(nr, nc) && this.board[nr][nc] === opponent) {
                const group = this.getGroup(nr, nc);
                if (this.getLiberties(group).length === 0) {
                    captures += group.length;
                }
            }
        }
        
        this.board = boardCopy;
        return captures;
    }
    
    getGroup(row, col) {
        const color = this.board[row][col];
        if (!color) return [];
        
        const group = [];
        const visited = new Set();
        const stack = [[row, col]];
        
        while (stack.length > 0) {
            const [r, c] = stack.pop();
            const key = `${r},${c}`;
            
            if (visited.has(key) || !this.isValid(r, c) || this.board[r][c] !== color) continue;
            
            visited.add(key);
            group.push([r, c]);
            stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
        }
        
        return group;
    }
    
    getLiberties(group) {
        const liberties = new Set();
        for (const [row, col] of group) {
            for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const nr = row + dr;
                const nc = col + dc;
                if (this.isValid(nr, nc) && !this.board[nr][nc]) {
                    liberties.add(`${nr},${nc}`);
                }
            }
        }
        return Array.from(liberties);
    }
    
    isValid(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }
    
    boardEquals(a, b) {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (a[i][j] !== b[i][j]) return false;
            }
        }
        return true;
    }
    
    pass() {
        if (this.gameOver) return;
        
        this.passes++;
        this.previousBoard = null;
        
        app.showSnackbar(`${this.currentPlayer === 'black' ? 'Black' : 'White'} passed`);
        
        if (this.passes >= 2) {
            this.endGame();
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.render();
        
        if (this.mode === 'ai' && this.currentPlayer === 'white') {
            setTimeout(() => this.aiMove(), 500);
        }
    }
    
    endGame() {
        this.gameOver = true;
        
        const score = { black: this.captures.black, white: this.captures.white + 6.5 };
        
        // Count territory (simplified)
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 'black') score.black++;
                else if (this.board[row][col] === 'white') score.white++;
            }
        }
        
        const winner = score.black > score.white ? 'Black' : 'White';
        const diff = Math.abs(score.black - score.white).toFixed(1);
        
        this.statusArea.innerHTML = `🎉 ${winner} wins by ${diff}!`;
        app.showSnackbar(`${winner} wins by ${diff} points!`);
    }
    
    updateStatus() {
        if (this.gameOver) return;
        const isAI = this.mode === 'ai' && this.currentPlayer === 'white';
        this.statusArea.textContent = isAI ? '🤖 AI is thinking...' : 
            `${this.currentPlayer === 'black' ? '⚫ Black' : '⚪ White'}'s turn`;
    }
    
    cleanup() {}
}
