// Connect Four - with AI and 2-player modes
class ConnectFour {
    constructor() {
        this.name = 'Connect Four';
        this.rows = 6;
        this.cols = 7;
        this.board = [];
        this.currentPlayer = 'red';
        this.gameOver = false;
        this.winner = null;
        this.winningCells = [];
        this.mode = 'ai';
        this.difficulty = 'medium';
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }

    reset() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.currentPlayer = 'red';
        this.gameOver = false;
        this.winner = null;
        this.winningCells = [];
        this.render();
    }

    render() {
        this.controlsArea.innerHTML = `
            <div class="mode-selector">
                <button class="mode-btn ${this.mode === 'ai' ? 'active' : ''}" data-mode="ai">🤖 vs AI</button>
                <button class="mode-btn ${this.mode === 'pvp' ? 'active' : ''}" data-mode="pvp">👥 2 Players</button>
            </div>
            <button class="btn btn-primary" style="margin-top: 12px;" id="c4Reset">New Game</button>
        `;

        this.controlsArea.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.mode = btn.dataset.mode;
                this.reset();
            });
        });

        document.getElementById('c4Reset')?.addEventListener('click', () => this.reset());

        this.updateStatus();

        let html = `
            <div class="player-indicator">
                <div class="player-badge ${this.currentPlayer === 'red' ? 'active' : ''}" style="border-color: #FF5252;">
                    <div class="player-avatar" style="background: linear-gradient(145deg, #FF8A8A, #FF5252);">👤</div>
                    <span>Red</span>
                </div>
                <div class="player-badge ${this.currentPlayer === 'yellow' ? 'active' : ''}" style="border-color: #FFD600;">
                    <div class="player-avatar" style="background: linear-gradient(145deg, #FFEB3B, #FFD600);">${this.mode === 'ai' ? '🤖' : '👤'}</div>
                    <span>${this.mode === 'ai' ? 'AI' : 'Yellow'}</span>
                </div>
            </div>
            <div class="connect4-board">
        `;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                const isWinning = this.winningCells.some(c => c.row === row && c.col === col);
                let cellClass = 'c4-cell';
                if (cell) cellClass += ` ${cell}`;
                if (isWinning) cellClass += ' winning';
                
                html += `<div class="${cellClass}" data-col="${col}"></div>`;
            }
        }

        html += '</div>';
        this.gameArea.innerHTML = html;

        // Add styles
        if (!document.getElementById('c4-styles')) {
            const style = document.createElement('style');
            style.id = 'c4-styles';
            style.textContent = `
                .connect4-board {
                    display: grid;
                    grid-template-columns: repeat(7, 44px);
                    gap: 4px;
                    background: #1565C0;
                    padding: 10px;
                    border-radius: 10px;
                    width: fit-content;
                    margin: 0 auto;
                }
                .c4-cell {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: #0D47A1;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .c4-cell:hover { opacity: 0.8; }
                .c4-cell.red { background: radial-gradient(circle at 30% 30%, #FF8A8A, #FF5252, #D32F2F); }
                .c4-cell.yellow { background: radial-gradient(circle at 30% 30%, #FFEE58, #FFD600, #FBC02D); }
                .c4-cell.winning { animation: pulse 0.5s ease-in-out infinite alternate; box-shadow: 0 0 15px gold; }
                @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.1); } }
            `;
            document.head.appendChild(style);
        }

        this.gameArea.querySelectorAll('.c4-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const col = parseInt(cell.dataset.col);
                this.handleClick(col);
            });
        });
    }

    handleClick(col) {
        if (this.gameOver) return;
        if (this.mode === 'ai' && this.currentPlayer === 'yellow') return;

        if (this.dropPiece(col)) {
            if (this.checkWinner()) {
                this.gameOver = true;
                this.render();
                return;
            }

            if (this.isBoardFull()) {
                this.gameOver = true;
                this.statusArea.textContent = "🤝 It's a draw!";
                app.showSnackbar("It's a draw!");
                this.render();
                return;
            }

            this.currentPlayer = this.currentPlayer === 'red' ? 'yellow' : 'red';
            this.render();

            if (this.mode === 'ai' && this.currentPlayer === 'yellow') {
                this.statusArea.textContent = '🤖 AI is thinking...';
                setTimeout(() => this.aiMove(), 500);
            }
        }
    }

    dropPiece(col) {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (!this.board[row][col]) {
                this.board[row][col] = this.currentPlayer;
                return true;
            }
        }
        return false;
    }

    aiMove() {
        // Check for winning move
        for (let col = 0; col < this.cols; col++) {
            const row = this.getDropRow(col);
            if (row !== -1) {
                this.board[row][col] = 'yellow';
                if (this.checkWinnerAt(row, col)) {
                    this.checkWinner();
                    this.gameOver = true;
                    this.render();
                    return;
                }
                this.board[row][col] = null;
            }
        }

        // Block opponent's winning move
        for (let col = 0; col < this.cols; col++) {
            const row = this.getDropRow(col);
            if (row !== -1) {
                this.board[row][col] = 'red';
                if (this.checkWinnerAt(row, col)) {
                    this.board[row][col] = null;
                    this.dropPiece(col);
                    this.currentPlayer = 'red';
                    this.render();
                    if (this.mode === 'ai') {
                        this.updateStatus();
                    }
                    return;
                }
                this.board[row][col] = null;
            }
        }

        // Prefer center column
        const validCols = [];
        for (let col = 0; col < this.cols; col++) {
            if (this.getDropRow(col) !== -1) {
                validCols.push(col);
            }
        }

        if (validCols.length > 0) {
            // Sort by distance to center
            validCols.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
            const col = Math.random() < 0.7 ? validCols[0] : validCols[Math.floor(Math.random() * validCols.length)];
            this.dropPiece(col);
        }

        if (this.checkWinner()) {
            this.gameOver = true;
        } else if (this.isBoardFull()) {
            this.gameOver = true;
            this.statusArea.textContent = "🤝 It's a draw!";
            app.showSnackbar("It's a draw!");
        }

        this.currentPlayer = 'red';
        this.render();
    }

    getDropRow(col) {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (!this.board[row][col]) return row;
        }
        return -1;
    }

    checkWinnerAt(row, col) {
        const color = this.board[row][col];
        if (!color) return false;

        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (const [dr, dc] of directions) {
            let count = 1;
            const cells = [{ row, col }];

            for (let i = 1; i < 4; i++) {
                const nr = row + dr * i, nc = col + dc * i;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc] === color) {
                    count++;
                    cells.push({ row: nr, col: nc });
                } else break;
            }

            for (let i = 1; i < 4; i++) {
                const nr = row - dr * i, nc = col - dc * i;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc] === color) {
                    count++;
                    cells.push({ row: nr, col: nc });
                } else break;
            }

            if (count >= 4) {
                this.winningCells = cells;
                return true;
            }
        }
        return false;
    }

    checkWinner() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] && this.checkWinnerAt(row, col)) {
                    this.winner = this.board[row][col];
                    const winnerName = this.winner === 'red' ? '🔴 Red' : (this.mode === 'ai' ? '🤖 AI' : '🟡 Yellow');
                    this.statusArea.textContent = `${winnerName} wins!`;
                    app.showSnackbar(`${winnerName} wins!`);
                    return true;
                }
            }
        }
        return false;
    }

    isBoardFull() {
        return this.board[0].every(cell => cell !== null);
    }

    updateStatus() {
        if (this.gameOver) return;
        const isAI = this.mode === 'ai' && this.currentPlayer === 'yellow';
        this.statusArea.textContent = isAI ? '🤖 AI is thinking...' :
            `${this.currentPlayer === 'red' ? '🔴 Red' : '🟡 Yellow'}'s turn`;
    }

    cleanup() {}
}
