// Reversi/Othello - with AI and 2-player modes
class Reversi {
    constructor() {
        this.name = 'Reversi';
        this.size = 8;
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.mode = 'ai';
        this.validMoves = [];
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }

    reset() {
        this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        const mid = this.size / 2;
        this.board[mid - 1][mid - 1] = 'white';
        this.board[mid - 1][mid] = 'black';
        this.board[mid][mid - 1] = 'black';
        this.board[mid][mid] = 'white';
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.validMoves = this.getValidMoves();
        this.render();
    }

    render() {
        this.controlsArea.innerHTML = `
            <div class="mode-selector">
                <button class="mode-btn ${this.mode === 'ai' ? 'active' : ''}" data-mode="ai">🤖 vs AI</button>
                <button class="mode-btn ${this.mode === 'pvp' ? 'active' : ''}" data-mode="pvp">👥 2 Players</button>
            </div>
            <button class="btn btn-primary" style="margin-top: 12px;" id="reversiReset">New Game</button>
        `;

        this.controlsArea.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.mode = btn.dataset.mode;
                this.reset();
            });
        });

        document.getElementById('reversiReset')?.addEventListener('click', () => this.reset());

        const scores = this.getScores();
        
        let html = `
            <div class="player-indicator">
                <div class="player-badge ${this.currentPlayer === 'black' ? 'active' : ''}" style="border-color: #333;">
                    <div class="player-avatar" style="background: linear-gradient(145deg, #555, #222);">👤</div>
                    <span>Black: ${scores.black}</span>
                </div>
                <div class="player-badge ${this.currentPlayer === 'white' ? 'active' : ''}" style="border-color: #eee;">
                    <div class="player-avatar" style="background: linear-gradient(145deg, #fff, #ddd);">${this.mode === 'ai' ? '🤖' : '👤'}</div>
                    <span>White: ${scores.white}</span>
                </div>
            </div>
            <div class="reversi-board">
        `;

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.board[row][col];
                const isValid = this.validMoves.some(m => m.row === row && m.col === col);
                let cellClass = 'reversi-cell';
                if (isValid) cellClass += ' valid-move';

                html += `<div class="${cellClass}" data-row="${row}" data-col="${col}">`;
                if (cell) {
                    html += `<div class="reversi-piece ${cell}"></div>`;
                }
                html += '</div>';
            }
        }

        html += '</div>';
        this.gameArea.innerHTML = html;

        if (!document.getElementById('reversi-styles')) {
            const style = document.createElement('style');
            style.id = 'reversi-styles';
            style.textContent = `
                .reversi-board {
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                    gap: 2px;
                    background: #1B5E20;
                    padding: 8px;
                    border-radius: 8px;
                    max-width: 350px;
                    margin: 0 auto;
                }
                .reversi-cell {
                    aspect-ratio: 1;
                    background: #2E7D32;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border-radius: 2px;
                }
                .reversi-cell.valid-move { background: #4CAF50; }
                .reversi-cell.valid-move::after {
                    content: '';
                    width: 30%;
                    height: 30%;
                    border-radius: 50%;
                    background: rgba(0,0,0,0.3);
                }
                .reversi-piece {
                    width: 80%;
                    height: 80%;
                    border-radius: 50%;
                    transition: transform 0.3s;
                }
                .reversi-piece.black { background: radial-gradient(circle at 30% 30%, #555, #111); }
                .reversi-piece.white { background: radial-gradient(circle at 30% 30%, #fff, #bbb); }
            `;
            document.head.appendChild(style);
        }

        this.gameArea.querySelectorAll('.reversi-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.handleClick(row, col);
            });
        });

        this.updateStatus();
    }

    handleClick(row, col) {
        if (this.gameOver) return;
        if (this.mode === 'ai' && this.currentPlayer === 'white') return;

        const move = this.validMoves.find(m => m.row === row && m.col === col);
        if (move) {
            this.makeMove(row, col);
        }
    }

    makeMove(row, col) {
        const flips = this.getFlips(row, col, this.currentPlayer);
        if (flips.length === 0) return;

        this.board[row][col] = this.currentPlayer;
        flips.forEach(({ row: r, col: c }) => {
            this.board[r][c] = this.currentPlayer;
        });

        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.validMoves = this.getValidMoves();

        if (this.validMoves.length === 0) {
            this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
            this.validMoves = this.getValidMoves();

            if (this.validMoves.length === 0) {
                this.endGame();
                return;
            }
            app.showSnackbar(`${this.currentPlayer === 'black' ? 'White' : 'Black'} has no moves. ${this.currentPlayer === 'black' ? 'Black' : 'White'}'s turn again.`);
        }

        this.render();

        if (this.mode === 'ai' && this.currentPlayer === 'white' && !this.gameOver) {
            this.statusArea.textContent = '🤖 AI is thinking...';
            setTimeout(() => this.aiMove(), 500);
        }
    }

    getValidMoves() {
        const moves = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (!this.board[row][col] && this.getFlips(row, col, this.currentPlayer).length > 0) {
                    moves.push({ row, col });
                }
            }
        }
        return moves;
    }

    getFlips(row, col, player) {
        if (this.board[row][col]) return [];

        const opponent = player === 'black' ? 'white' : 'black';
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        const allFlips = [];

        for (const [dr, dc] of directions) {
            const flips = [];
            let r = row + dr, c = col + dc;

            while (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === opponent) {
                flips.push({ row: r, col: c });
                r += dr;
                c += dc;
            }

            if (flips.length > 0 && r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === player) {
                allFlips.push(...flips);
            }
        }

        return allFlips;
    }

    aiMove() {
        if (this.validMoves.length === 0) return;

        // Prioritize corners
        const corners = this.validMoves.filter(m => 
            (m.row === 0 || m.row === 7) && (m.col === 0 || m.col === 7)
        );

        // Avoid cells adjacent to corners
        const edges = this.validMoves.filter(m =>
            (m.row === 0 || m.row === 7 || m.col === 0 || m.col === 7)
        );

        let move;
        if (corners.length > 0) {
            move = corners[Math.floor(Math.random() * corners.length)];
        } else if (edges.length > 0 && Math.random() < 0.5) {
            move = edges[Math.floor(Math.random() * edges.length)];
        } else {
            // Pick move with most flips
            let maxFlips = 0;
            this.validMoves.forEach(m => {
                const flips = this.getFlips(m.row, m.col, 'white').length;
                if (flips > maxFlips) {
                    maxFlips = flips;
                    move = m;
                }
            });
        }

        if (move) this.makeMove(move.row, move.col);
    }

    getScores() {
        let black = 0, white = 0;
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 'black') black++;
                else if (this.board[row][col] === 'white') white++;
            }
        }
        return { black, white };
    }

    endGame() {
        this.gameOver = true;
        const scores = this.getScores();
        let msg;
        if (scores.black > scores.white) {
            msg = `⚫ Black wins! ${scores.black} - ${scores.white}`;
        } else if (scores.white > scores.black) {
            msg = this.mode === 'ai' ? `🤖 AI wins! ${scores.white} - ${scores.black}` : `⚪ White wins! ${scores.white} - ${scores.black}`;
        } else {
            msg = `🤝 It's a tie! ${scores.black} - ${scores.white}`;
        }
        this.statusArea.textContent = msg;
        app.showSnackbar(msg);
        this.render();
    }

    updateStatus() {
        if (this.gameOver) return;
        const isAI = this.mode === 'ai' && this.currentPlayer === 'white';
        this.statusArea.textContent = isAI ? '🤖 AI is thinking...' :
            `${this.currentPlayer === 'black' ? '⚫ Black' : '⚪ White'}'s turn`;
    }

    cleanup() {}
}
