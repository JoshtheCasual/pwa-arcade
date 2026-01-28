// Tic Tac Toe - with AI and 2-player modes
class TicTacToe {
    constructor() {
        this.name = 'Tic Tac Toe';
        this.board = [];
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.mode = 'ai'; // 'ai' or 'pvp'
        this.difficulty = 'medium';
        this.scores = { X: 0, O: 0 };
    }
    
    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }
    
    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.render();
    }
    
    render() {
        // Mode selector
        this.controlsArea.innerHTML = `
            <div class="mode-selector">
                <button class="mode-btn ${this.mode === 'ai' ? 'active' : ''}" data-mode="ai">🤖 vs AI</button>
                <button class="mode-btn ${this.mode === 'pvp' ? 'active' : ''}" data-mode="pvp">👥 2 Players</button>
            </div>
            ${this.mode === 'ai' ? `
                <div class="mode-selector" style="margin-top: 12px;">
                    <button class="mode-btn ${this.difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
                    <button class="mode-btn ${this.difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
                    <button class="mode-btn ${this.difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
                </div>
            ` : ''}
            <button class="btn btn-primary" style="margin-top: 16px;" id="tttReset">New Game</button>
        `;
        
        // Event listeners for controls
        this.controlsArea.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.mode = btn.dataset.mode;
                this.reset();
            });
        });
        
        this.controlsArea.querySelectorAll('[data-diff]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficulty = btn.dataset.diff;
                this.render();
            });
        });
        
        document.getElementById('tttReset')?.addEventListener('click', () => this.reset());
        
        // Status
        this.updateStatus();
        
        // Board
        this.gameArea.innerHTML = `
            <div class="player-indicator">
                <div class="player-badge x ${this.currentPlayer === 'X' ? 'active' : ''}">
                    <div class="player-avatar">👤</div>
                    <span>Player X</span>
                    <span style="margin-left:4px;opacity:0.6;">${this.scores.X}</span>
                </div>
                <div class="player-badge o ${this.currentPlayer === 'O' ? 'active' : ''}">
                    <div class="player-avatar">${this.mode === 'ai' ? '🤖' : '👤'}</div>
                    <span>${this.mode === 'ai' ? 'AI' : 'Player O'}</span>
                    <span style="margin-left:4px;opacity:0.6;">${this.scores.O}</span>
                </div>
            </div>
            <div class="ttt-board">
                ${this.board.map((cell, i) => `
                    <button class="ttt-cell ${cell ? cell.toLowerCase() : ''}" 
                            data-index="${i}" 
                            ${cell || this.gameOver ? 'disabled' : ''}>
                        ${cell || ''}
                    </button>
                `).join('')}
            </div>
        `;
        
        this.gameArea.querySelectorAll('.ttt-cell').forEach(cell => {
            cell.addEventListener('click', () => this.makeMove(parseInt(cell.dataset.index)));
        });
    }
    
    makeMove(index) {
        if (this.board[index] || this.gameOver) return;
        
        this.board[index] = this.currentPlayer;
        
        const winner = this.checkWinner();
        if (winner) {
            this.gameOver = true;
            if (winner !== 'tie') {
                this.scores[winner]++;
            }
            this.render();
            this.showResult(winner);
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.render();
        
        // AI move
        if (this.mode === 'ai' && this.currentPlayer === 'O' && !this.gameOver) {
            setTimeout(() => this.aiMove(), 400);
        }
    }
    
    aiMove() {
        let move;
        
        if (this.difficulty === 'easy') {
            move = this.getRandomMove();
        } else if (this.difficulty === 'medium') {
            move = Math.random() > 0.4 ? this.getBestMove() : this.getRandomMove();
        } else {
            move = this.getBestMove();
        }
        
        if (move !== null) {
            this.makeMove(move);
        }
    }
    
    getRandomMove() {
        const available = this.board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
        return available[Math.floor(Math.random() * available.length)];
    }
    
    getBestMove() {
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                const score = this.minimax(this.board, 0, false);
                this.board[i] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    minimax(board, depth, isMaximizing) {
        const winner = this.checkWinner();
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (winner === 'tie') return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    bestScore = Math.max(bestScore, this.minimax(board, depth + 1, false));
                    board[i] = null;
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    bestScore = Math.min(bestScore, this.minimax(board, depth + 1, true));
                    board[i] = null;
                }
            }
            return bestScore;
        }
    }
    
    checkWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const [a, b, c] of lines) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        
        return this.board.every(cell => cell !== null) ? 'tie' : null;
    }
    
    updateStatus() {
        if (this.gameOver) return;
        
        const isAiTurn = this.mode === 'ai' && this.currentPlayer === 'O';
        const playerName = this.currentPlayer === 'X' ? 'Your' : 
            (this.mode === 'ai' ? "AI's" : "Player O's");
        
        this.statusArea.textContent = isAiTurn ? '🤖 AI is thinking...' : `${playerName} turn`;
    }
    
    showResult(winner) {
        if (winner === 'tie') {
            this.statusArea.textContent = "🤝 It's a tie!";
            app.showSnackbar("It's a draw!");
        } else {
            const winnerName = winner === 'X' ? 'You' : (this.mode === 'ai' ? 'AI' : 'Player O');
            this.statusArea.innerHTML = `🎉 ${winnerName} won!`;
            this.statusArea.classList.add('winner');
            app.showSnackbar(`${winnerName} won! 🎉`);
            setTimeout(() => this.statusArea.classList.remove('winner'), 1500);
        }
    }
    
    cleanup() {}
}
