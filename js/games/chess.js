// Chess - using js-chess-engine library
class Chess {
    constructor() {
        this.name = 'Chess';
        this.game = null;
        this.selectedSquare = null;
        this.validMoves = [];
        this.gameOver = false;
        this.mode = 'ai';
        this.difficulty = 2; // 1-4
        this.engineLoaded = false;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.loadEngine();
    }

    loadEngine() {
        const engine = window['js-chess-engine'];
        if (engine && engine.Game) {
            this.engineLoaded = true;
            this.reset();
            return;
        }

        this.statusArea.textContent = 'Loading chess engine...';
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/js-chess-engine@1.0.3/dist/js-chess-engine.js';
        script.onload = () => {
            this.engineLoaded = true;
            this.reset();
        };
        script.onerror = () => {
            this.statusArea.textContent = 'Failed to load chess engine. Please refresh.';
            app.showSnackbar('Failed to load chess engine');
        };
        document.head.appendChild(script);
    }

    reset() {
        if (!this.engineLoaded) return;
        
        this.game = new (window['js-chess-engine'].Game)();
        this.selectedSquare = null;
        this.validMoves = [];
        this.gameOver = false;
        this.render();
    }

    render() {
        this.controlsArea.innerHTML = `
            <div class="mode-selector">
                <button class="mode-btn ${this.mode === 'ai' ? 'active' : ''}" data-mode="ai">🤖 vs AI</button>
                <button class="mode-btn ${this.mode === 'pvp' ? 'active' : ''}" data-mode="pvp">👥 2 Players</button>
            </div>
            <div style="margin-top: 12px;">
                <label>AI Level: </label>
                <select id="chessDifficulty">
                    <option value="1" ${this.difficulty === 1 ? 'selected' : ''}>Easy</option>
                    <option value="2" ${this.difficulty === 2 ? 'selected' : ''}>Medium</option>
                    <option value="3" ${this.difficulty === 3 ? 'selected' : ''}>Hard</option>
                    <option value="4" ${this.difficulty === 4 ? 'selected' : ''}>Expert</option>
                </select>
            </div>
            <button class="btn btn-primary" style="margin-top: 12px;" id="chessReset">New Game</button>
        `;

        this.controlsArea.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.mode = btn.dataset.mode;
                this.reset();
            });
        });

        document.getElementById('chessDifficulty')?.addEventListener('change', (e) => {
            this.difficulty = parseInt(e.target.value);
        });

        document.getElementById('chessReset')?.addEventListener('click', () => this.reset());

        if (!this.game) return;

        const state = this.game.exportJson();
        const turn = state.turn;
        
        this.updateStatus();

        let html = `
            <div class="player-indicator">
                <div class="player-badge ${turn === 'white' ? 'active' : ''}" style="border-color: #eee;">
                    <div class="player-avatar" style="background: linear-gradient(145deg, #fff, #ddd);">👤</div>
                    <span>White</span>
                </div>
                <div class="player-badge ${turn === 'black' ? 'active' : ''}" style="border-color: #333;">
                    <div class="player-avatar" style="background: linear-gradient(145deg, #555, #222);">${this.mode === 'ai' ? '🤖' : '👤'}</div>
                    <span>${this.mode === 'ai' ? 'AI' : 'Black'}</span>
                </div>
            </div>
            <div class="chess-board">
        `;

        const pieces = {
            K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
            k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
        };

        for (let row = 8; row >= 1; row--) {
            for (let col = 0; col < 8; col++) {
                const file = String.fromCharCode(65 + col);
                const square = `${file}${row}`;
                const piece = state.pieces[square];
                const isLight = (row + col) % 2 === 0;
                const isSelected = this.selectedSquare === square;
                const isValidMove = this.validMoves.includes(square);

                let cellClass = `chess-cell ${isLight ? 'light' : 'dark'}`;
                if (isSelected) cellClass += ' selected';
                if (isValidMove) cellClass += ' valid-move';

                const pieceChar = piece ? pieces[piece] || '' : '';
                const pieceColor = piece && piece === piece.toUpperCase() ? 'white-piece' : 'black-piece';

                html += `<div class="${cellClass}" data-square="${square}">
                    ${piece ? `<span class="chess-piece ${pieceColor}">${pieceChar}</span>` : ''}
                </div>`;
            }
        }

        html += '</div>';
        this.gameArea.innerHTML = html;

        if (!document.getElementById('chess-styles')) {
            const style = document.createElement('style');
            style.id = 'chess-styles';
            style.textContent = `
                .chess-board {
                    display: grid;
                    grid-template-columns: repeat(8, 40px);
                    gap: 0;
                    width: fit-content;
                    margin: 0 auto;
                    border: 3px solid #5D4037;
                    border-radius: 4px;
                }
                .chess-cell {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 28px;
                    position: relative;
                }
                .chess-cell.light { background: #F5DEB3; }
                .chess-cell.dark { background: #8B7355; }
                .chess-cell.selected { background: #7CB342 !important; }
                .chess-cell.valid-move { background: #AED581 !important; }
                .chess-cell.valid-move::after {
                    content: '';
                    position: absolute;
                    width: 25%;
                    height: 25%;
                    background: rgba(0,0,0,0.2);
                    border-radius: 50%;
                }
                .chess-piece { text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
                .white-piece { color: #FFF; text-shadow: 0 0 3px #000, 1px 1px 2px #000; }
                .black-piece { color: #222; }
            `;
            document.head.appendChild(style);
        }

        this.gameArea.querySelectorAll('.chess-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                this.handleClick(cell.dataset.square);
            });
        });
    }

    handleClick(square) {
        if (this.gameOver) return;
        
        const state = this.game.exportJson();
        if (this.mode === 'ai' && state.turn === 'black') return;

        // If clicking a valid move, make the move
        if (this.validMoves.includes(square)) {
            this.makeMove(this.selectedSquare, square);
            return;
        }

        // If clicking own piece, select it
        const piece = state.pieces[square];
        if (piece) {
            const isWhitePiece = piece === piece.toUpperCase();
            const isCorrectTurn = (state.turn === 'white' && isWhitePiece) || (state.turn === 'black' && !isWhitePiece);
            
            if (isCorrectTurn) {
                this.selectedSquare = square;
                const moves = state.moves[square] || [];
                this.validMoves = moves;
                this.render();
            }
        }
    }

    makeMove(from, to) {
        try {
            this.game.move(from, to);
            this.selectedSquare = null;
            this.validMoves = [];

            const state = this.game.exportJson();
            
            if (state.checkMate) {
                this.gameOver = true;
                const winner = state.turn === 'white' ? 'Black' : 'White';
                this.statusArea.textContent = `♔ Checkmate! ${winner} wins!`;
                app.showSnackbar(`Checkmate! ${winner} wins!`);
                this.render();
                return;
            }

            if (state.check) {
                app.showSnackbar('Check!');
            }

            // Check for stalemate
            const moves = state.moves;
            if (Object.keys(moves).length === 0) {
                this.gameOver = true;
                this.statusArea.textContent = "🤝 Stalemate! It's a draw.";
                app.showSnackbar("Stalemate! It's a draw.");
                this.render();
                return;
            }

            this.render();

            if (this.mode === 'ai' && state.turn === 'black' && !this.gameOver) {
                this.statusArea.textContent = '🤖 AI is thinking...';
                setTimeout(() => this.aiMove(), 500);
            }
        } catch (e) {
            console.error('Invalid move:', e);
        }
    }

    aiMove() {
        try {
            const move = this.game.aiMove(this.difficulty);
            const from = Object.keys(move)[0];
            const to = move[from];
            
            this.selectedSquare = null;
            this.validMoves = [];

            const state = this.game.exportJson();
            
            if (state.checkMate) {
                this.gameOver = true;
                this.statusArea.textContent = '♔ Checkmate! AI wins!';
                app.showSnackbar('Checkmate! AI wins!');
            } else if (state.check) {
                app.showSnackbar('Check!');
            }

            const moves = state.moves;
            if (Object.keys(moves).length === 0 && !state.checkMate) {
                this.gameOver = true;
                this.statusArea.textContent = "🤝 Stalemate! It's a draw.";
                app.showSnackbar("Stalemate! It's a draw.");
            }

            this.render();
        } catch (e) {
            console.error('AI move error:', e);
            this.render();
        }
    }

    updateStatus() {
        if (this.gameOver || !this.game) return;
        const state = this.game.exportJson();
        const isAI = this.mode === 'ai' && state.turn === 'black';
        this.statusArea.textContent = isAI ? '🤖 AI is thinking...' :
            `${state.turn === 'white' ? '⚪ White' : '⚫ Black'}'s turn`;
    }

    cleanup() {}
}
