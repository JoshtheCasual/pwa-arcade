// Battleship - vs AI
class Battleship {
    constructor() {
        this.name = 'Battleship';
        this.size = 10;
        this.playerBoard = [];
        this.aiBoard = [];
        this.playerShips = [];
        this.aiShips = [];
        this.phase = 'placing'; // placing, playing, gameover
        this.currentShipIndex = 0;
        this.isHorizontal = true;
        this.ships = [
            { name: 'Carrier', size: 5 },
            { name: 'Battleship', size: 4 },
            { name: 'Cruiser', size: 3 },
            { name: 'Submarine', size: 3 },
            { name: 'Destroyer', size: 2 }
        ];
        this.aiHits = [];
        this.aiLastHit = null;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }

    reset() {
        this.playerBoard = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.aiBoard = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.playerShips = [];
        this.aiShips = [];
        this.phase = 'placing';
        this.currentShipIndex = 0;
        this.isHorizontal = true;
        this.aiHits = [];
        this.aiLastHit = null;
        this.placeAIShips();
        this.render();
    }

    placeAIShips() {
        this.ships.forEach(ship => {
            let placed = false;
            while (!placed) {
                const horizontal = Math.random() < 0.5;
                const row = Math.floor(Math.random() * this.size);
                const col = Math.floor(Math.random() * this.size);

                if (this.canPlaceShip(this.aiBoard, row, col, ship.size, horizontal)) {
                    const cells = [];
                    for (let i = 0; i < ship.size; i++) {
                        const r = horizontal ? row : row + i;
                        const c = horizontal ? col + i : col;
                        this.aiBoard[r][c] = 'ship';
                        cells.push({ row: r, col: c });
                    }
                    this.aiShips.push({ ...ship, cells, hits: 0 });
                    placed = true;
                }
            }
        });
    }

    canPlaceShip(board, row, col, size, horizontal) {
        for (let i = 0; i < size; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            if (r >= this.size || c >= this.size || board[r][c]) return false;
        }
        return true;
    }

    render() {
        this.controlsArea.innerHTML = `
            ${this.phase === 'placing' ? `
                <p>Placing: <strong>${this.ships[this.currentShipIndex].name}</strong> (${this.ships[this.currentShipIndex].size} cells)</p>
                <button class="btn btn-secondary" id="rotateShip">🔄 Rotate (${this.isHorizontal ? 'Horizontal' : 'Vertical'})</button>
            ` : ''}
            <button class="btn btn-primary" style="margin-top: 12px;" id="battleshipReset">New Game</button>
        `;

        document.getElementById('rotateShip')?.addEventListener('click', () => {
            this.isHorizontal = !this.isHorizontal;
            this.render();
        });
        document.getElementById('battleshipReset')?.addEventListener('click', () => this.reset());

        this.updateStatus();

        let html = '<div class="battleship-container">';

        if (this.phase === 'placing') {
            html += '<div class="board-section"><h3>Your Fleet</h3>';
            html += this.renderBoard(this.playerBoard, 'player', true);
            html += '</div>';
        } else {
            html += '<div class="board-section"><h3>Enemy Waters</h3>';
            html += this.renderBoard(this.aiBoard, 'ai', false);
            html += '</div>';
            html += '<div class="board-section"><h3>Your Fleet</h3>';
            html += this.renderBoard(this.playerBoard, 'player', true);
            html += '</div>';
        }

        html += '</div>';
        this.gameArea.innerHTML = html;

        if (!document.getElementById('battleship-styles')) {
            const style = document.createElement('style');
            style.id = 'battleship-styles';
            style.textContent = `
                .battleship-container { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
                .board-section { text-align: center; }
                .board-section h3 { margin-bottom: 8px; font-size: 14px; }
                .battleship-board {
                    display: grid;
                    grid-template-columns: repeat(10, 1fr);
                    gap: 2px;
                    background: #0D47A1;
                    padding: 4px;
                    border-radius: 4px;
                    max-width: 180px;
                }
                .bs-cell {
                    aspect-ratio: 1;
                    background: #1565C0;
                    cursor: pointer;
                    border-radius: 2px;
                    font-size: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bs-cell.ship { background: #455A64; }
                .bs-cell.hit { background: #D32F2F; }
                .bs-cell.miss { background: #90CAF9; }
                .bs-cell.sunk { background: #B71C1C; }
                .bs-cell.preview { background: rgba(69, 90, 100, 0.5); }
                .bs-cell.invalid { background: rgba(211, 47, 47, 0.5); }
            `;
            document.head.appendChild(style);
        }

        if (this.phase === 'placing') {
            this.gameArea.querySelectorAll('.player-board .bs-cell').forEach(cell => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);

                cell.addEventListener('mouseenter', () => this.showPreview(row, col));
                cell.addEventListener('mouseleave', () => this.hidePreview());
                cell.addEventListener('click', () => this.placePlayerShip(row, col));
            });
        } else if (this.phase === 'playing') {
            this.gameArea.querySelectorAll('.ai-board .bs-cell').forEach(cell => {
                cell.addEventListener('click', () => {
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    this.playerAttack(row, col);
                });
            });
        }
    }

    renderBoard(board, type, showShips) {
        let html = `<div class="battleship-board ${type}-board">`;
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = board[row][col];
                let cellClass = 'bs-cell';
                let content = '';

                if (cell === 'hit') {
                    cellClass += ' hit';
                    content = '💥';
                } else if (cell === 'miss') {
                    cellClass += ' miss';
                    content = '•';
                } else if (cell === 'sunk') {
                    cellClass += ' sunk';
                    content = '💀';
                } else if (cell === 'ship' && showShips) {
                    cellClass += ' ship';
                }

                html += `<div class="${cellClass}" data-row="${row}" data-col="${col}">${content}</div>`;
            }
        }
        html += '</div>';
        return html;
    }

    showPreview(row, col) {
        const ship = this.ships[this.currentShipIndex];
        const canPlace = this.canPlaceShip(this.playerBoard, row, col, ship.size, this.isHorizontal);

        for (let i = 0; i < ship.size; i++) {
            const r = this.isHorizontal ? row : row + i;
            const c = this.isHorizontal ? col + i : col;
            const cell = this.gameArea.querySelector(`.player-board [data-row="${r}"][data-col="${c}"]`);
            if (cell) {
                cell.classList.add(canPlace ? 'preview' : 'invalid');
            }
        }
    }

    hidePreview() {
        this.gameArea.querySelectorAll('.preview, .invalid').forEach(cell => {
            cell.classList.remove('preview', 'invalid');
        });
    }

    placePlayerShip(row, col) {
        const ship = this.ships[this.currentShipIndex];
        if (!this.canPlaceShip(this.playerBoard, row, col, ship.size, this.isHorizontal)) return;

        const cells = [];
        for (let i = 0; i < ship.size; i++) {
            const r = this.isHorizontal ? row : row + i;
            const c = this.isHorizontal ? col + i : col;
            this.playerBoard[r][c] = 'ship';
            cells.push({ row: r, col: c });
        }
        this.playerShips.push({ ...ship, cells, hits: 0 });

        this.currentShipIndex++;
        if (this.currentShipIndex >= this.ships.length) {
            this.phase = 'playing';
        }
        this.render();
    }

    playerAttack(row, col) {
        if (this.phase !== 'playing') return;
        if (this.aiBoard[row][col] === 'hit' || this.aiBoard[row][col] === 'miss' || this.aiBoard[row][col] === 'sunk') return;

        if (this.aiBoard[row][col] === 'ship') {
            this.aiBoard[row][col] = 'hit';
            const ship = this.aiShips.find(s => s.cells.some(c => c.row === row && c.col === col));
            if (ship) {
                ship.hits++;
                if (ship.hits === ship.size) {
                    ship.cells.forEach(c => this.aiBoard[c.row][c.col] = 'sunk');
                    app.showSnackbar(`You sunk their ${ship.name}!`);
                }
            }
        } else {
            this.aiBoard[row][col] = 'miss';
        }

        if (this.checkWin(this.aiShips)) {
            this.phase = 'gameover';
            this.statusArea.textContent = '🎉 You win!';
            app.showSnackbar('Victory! You destroyed all enemy ships!');
            this.render();
            return;
        }

        this.render();
        this.statusArea.textContent = '🤖 AI is attacking...';
        setTimeout(() => this.aiAttack(), 600);
    }

    aiAttack() {
        let row, col;
        let attempts = 0;

        // Smart targeting: if we have a hit, try adjacent cells
        if (this.aiHits.length > 0) {
            const lastHit = this.aiHits[this.aiHits.length - 1];
            const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            
            for (const [dr, dc] of directions) {
                const nr = lastHit.row + dr;
                const nc = lastHit.col + dc;
                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                    const cell = this.playerBoard[nr][nc];
                    if (cell !== 'hit' && cell !== 'miss' && cell !== 'sunk') {
                        row = nr;
                        col = nc;
                        break;
                    }
                }
            }
        }

        // Random attack
        while (row === undefined && attempts < 100) {
            const r = Math.floor(Math.random() * this.size);
            const c = Math.floor(Math.random() * this.size);
            const cell = this.playerBoard[r][c];
            if (cell !== 'hit' && cell !== 'miss' && cell !== 'sunk') {
                row = r;
                col = c;
            }
            attempts++;
        }

        if (row === undefined) return;

        if (this.playerBoard[row][col] === 'ship') {
            this.playerBoard[row][col] = 'hit';
            this.aiHits.push({ row, col });
            
            const ship = this.playerShips.find(s => s.cells.some(c => c.row === row && c.col === col));
            if (ship) {
                ship.hits++;
                if (ship.hits === ship.size) {
                    ship.cells.forEach(c => this.playerBoard[c.row][c.col] = 'sunk');
                    this.aiHits = this.aiHits.filter(h => !ship.cells.some(c => c.row === h.row && c.col === h.col));
                    app.showSnackbar(`AI sunk your ${ship.name}!`);
                }
            }
        } else {
            this.playerBoard[row][col] = 'miss';
        }

        if (this.checkWin(this.playerShips)) {
            this.phase = 'gameover';
            this.statusArea.textContent = '💀 AI wins!';
            app.showSnackbar('Defeat! All your ships were destroyed.');
            this.render();
            return;
        }

        this.render();
    }

    checkWin(ships) {
        return ships.every(ship => ship.hits === ship.size);
    }

    updateStatus() {
        if (this.phase === 'placing') {
            this.statusArea.textContent = `Place your ships! ${this.ships.length - this.currentShipIndex} remaining`;
        } else if (this.phase === 'playing') {
            this.statusArea.textContent = 'Your turn - Attack enemy waters!';
        }
    }

    cleanup() {}
}
