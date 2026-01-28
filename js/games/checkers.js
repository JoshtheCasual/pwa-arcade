// Checkers - with AI and 2-player modes
class Checkers {
    constructor() {
        this.name = 'Checkers';
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.mode = 'ai'; // 'ai' or 'pvp'
        this.difficulty = 'medium';
    }
    
    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }
    
    reset() {
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    if (row < 3) {
                        this.board[row][col] = { color: 'black', king: false };
                    } else if (row > 4) {
                        this.board[row][col] = { color: 'red', king: false };
                    } else {
                        this.board[row][col] = null;
                    }
                } else {
                    this.board[row][col] = null;
                }
            }
        }
        
        this.render();
    }
    
    render() {
        // Controls
        this.controlsArea.innerHTML = `
            <div class="mode-selector">
                <button class="mode-btn ${this.mode === 'ai' ? 'active' : ''}" data-mode="ai">🤖 vs AI</button>
                <button class="mode-btn ${this.mode === 'pvp' ? 'active' : ''}" data-mode="pvp">👥 2 Players</button>
            </div>
            <button class="btn btn-primary" style="margin-top: 12px;" id="checkersReset">New Game</button>
        `;
        
        this.controlsArea.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.mode = btn.dataset.mode;
                this.reset();
            });
        });
        
        document.getElementById('checkersReset')?.addEventListener('click', () => this.reset());
        
        // Status
        this.updateStatus();
        
        // Board
        let html = `
            <div class="player-indicator">
                <div class="player-badge ${this.currentPlayer === 'red' ? 'active' : ''}" style="border-color: #FF5252;">
                    <div class="player-avatar" style="background: linear-gradient(145deg, #FF8A8A, #FF5252);">👤</div>
                    <span>Red</span>
                </div>
                <div class="player-badge ${this.currentPlayer === 'black' ? 'active' : ''}" style="border-color: #555;">
                    <div class="player-avatar" style="background: linear-gradient(145deg, #666, #333);">${this.mode === 'ai' ? '🤖' : '👤'}</div>
                    <span>${this.mode === 'ai' ? 'AI' : 'Black'}</span>
                </div>
            </div>
            <div class="checkers-board">
        `;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const isLight = (row + col) % 2 === 0;
                const piece = this.board[row][col];
                const isSelected = this.selectedPiece?.row === row && this.selectedPiece?.col === col;
                const isValidMove = this.validMoves.some(m => m.row === row && m.col === col);
                
                let classes = `checkers-cell ${isLight ? 'light' : 'dark'}`;
                if (isSelected) classes += ' selected';
                if (isValidMove) classes += ' valid-move';
                
                html += `<div class="${classes}" data-row="${row}" data-col="${col}">`;
                
                if (piece) {
                    html += `<div class="checker-piece ${piece.color} ${piece.king ? 'king' : ''}"></div>`;
                }
                
                html += '</div>';
            }
        }
        
        html += '</div>';
        this.gameArea.innerHTML = html;
        
        this.gameArea.querySelectorAll('.checkers-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.handleClick(row, col);
            });
        });
    }
    
    handleClick(row, col) {
        if (this.gameOver) return;
        if (this.mode === 'ai' && this.currentPlayer === 'black') return;
        
        const piece = this.board[row][col];
        const moveIndex = this.validMoves.findIndex(m => m.row === row && m.col === col);
        
        if (moveIndex !== -1) {
            this.executeMove(this.validMoves[moveIndex]);
            return;
        }
        
        if (piece && piece.color === this.currentPlayer) {
            this.selectedPiece = { row, col };
            this.validMoves = this.getValidMoves(row, col);
            this.render();
        }
    }
    
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        const jumps = [];
        const directions = piece.king ? [-1, 1] : (piece.color === 'red' ? [-1] : [1]);
        
        for (const dRow of directions) {
            for (const dCol of [-1, 1]) {
                const newRow = row + dRow;
                const newCol = col + dCol;
                
                if (this.isValid(newRow, newCol) && !this.board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol, jump: false });
                }
                
                const jumpRow = row + dRow * 2;
                const jumpCol = col + dCol * 2;
                
                if (this.isValid(jumpRow, jumpCol) && !this.board[jumpRow][jumpCol]) {
                    const midPiece = this.board[newRow]?.[newCol];
                    if (midPiece && midPiece.color !== piece.color) {
                        jumps.push({ row: jumpRow, col: jumpCol, jump: true, captured: { row: newRow, col: newCol } });
                    }
                }
            }
        }
        
        if (jumps.length > 0) return jumps;
        if (this.hasAnyJump(piece.color)) return [];
        return moves;
    }
    
    hasAnyJump(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece?.color === color) {
                    const directions = piece.king ? [-1, 1] : (color === 'red' ? [-1] : [1]);
                    for (const dRow of directions) {
                        for (const dCol of [-1, 1]) {
                            const midRow = row + dRow;
                            const midCol = col + dCol;
                            const jumpRow = row + dRow * 2;
                            const jumpCol = col + dCol * 2;
                            
                            if (this.isValid(jumpRow, jumpCol) && !this.board[jumpRow][jumpCol]) {
                                const midPiece = this.board[midRow]?.[midCol];
                                if (midPiece && midPiece.color !== color) return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
    
    isValid(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    executeMove(move) {
        const { row: fromRow, col: fromCol } = this.selectedPiece;
        const piece = this.board[fromRow][fromCol];
        
        this.board[move.row][move.col] = piece;
        this.board[fromRow][fromCol] = null;
        
        if (move.captured) {
            this.board[move.captured.row][move.captured.col] = null;
        }
        
        if ((piece.color === 'red' && move.row === 0) || (piece.color === 'black' && move.row === 7)) {
            piece.king = true;
        }
        
        if (move.jump) {
            this.selectedPiece = { row: move.row, col: move.col };
            const additionalJumps = this.getValidMoves(move.row, move.col).filter(m => m.jump);
            
            if (additionalJumps.length > 0) {
                this.validMoves = additionalJumps;
                this.render();
                return;
            }
        }
        
        this.selectedPiece = null;
        this.validMoves = [];
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        
        if (this.checkWinner()) {
            this.gameOver = true;
            this.render();
            return;
        }
        
        this.render();
        
        if (this.mode === 'ai' && this.currentPlayer === 'black' && !this.gameOver) {
            this.statusArea.textContent = '🤖 AI is thinking...';
            setTimeout(() => this.aiMove(), 600);
        }
    }
    
    aiMove() {
        const moves = this.getAllMoves('black');
        if (moves.length === 0) {
            this.gameOver = true;
            this.statusArea.textContent = '🎉 You win!';
            app.showSnackbar('You won! 🎉');
            return;
        }
        
        // Prioritize jumps
        const jumps = moves.filter(m => m.move.jump);
        const choice = jumps.length > 0 
            ? jumps[Math.floor(Math.random() * jumps.length)]
            : moves[Math.floor(Math.random() * moves.length)];
        
        this.selectedPiece = { row: choice.fromRow, col: choice.fromCol };
        this.validMoves = [choice.move];
        this.executeMove(choice.move);
    }
    
    getAllMoves(color) {
        const allMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col]?.color === color) {
                    const moves = this.getValidMoves(row, col);
                    moves.forEach(move => {
                        allMoves.push({ fromRow: row, fromCol: col, move });
                    });
                }
            }
        }
        return allMoves;
    }
    
    checkWinner() {
        let red = 0, black = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col]?.color === 'red') red++;
                else if (this.board[row][col]?.color === 'black') black++;
            }
        }
        
        if (red === 0) {
            this.statusArea.textContent = this.mode === 'ai' ? '🤖 AI wins!' : '⚫ Black wins!';
            app.showSnackbar(this.mode === 'ai' ? 'AI won!' : 'Black wins!');
            return true;
        }
        if (black === 0) {
            this.statusArea.textContent = '🔴 Red wins!';
            app.showSnackbar('You won! 🎉');
            return true;
        }
        return false;
    }
    
    updateStatus() {
        if (this.gameOver) return;
        const isAI = this.mode === 'ai' && this.currentPlayer === 'black';
        this.statusArea.textContent = isAI ? '🤖 AI is thinking...' : 
            `${this.currentPlayer === 'red' ? '🔴 Red' : '⚫ Black'}'s turn`;
    }
    
    cleanup() {}
}
