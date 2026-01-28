// 2048 - Sliding puzzle game
class Puzzle2048 {
    constructor() {
        this.name = '2048';
        this.size = 4;
        this.board = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048-best') || '0');
        this.gameOver = false;
        this.won = false;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.setupControls();
        this.reset();
    }

    setupControls() {
        // Keyboard
        this.keyHandler = (e) => {
            if (this.gameOver) return;
            const keyMap = {
                'ArrowUp': 'up', 'ArrowDown': 'down',
                'ArrowLeft': 'left', 'ArrowRight': 'right',
                'w': 'up', 's': 'down', 'a': 'left', 'd': 'right'
            };
            if (keyMap[e.key]) {
                e.preventDefault();
                this.move(keyMap[e.key]);
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    reset() {
        this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }

    addRandomTile() {
        const empty = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === 0) empty.push({ r, c });
            }
        }
        if (empty.length === 0) return;
        const { r, c } = empty[Math.floor(Math.random() * empty.length)];
        this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="p2048Reset">New Game</button>
            <p style="margin-top: 8px; font-size: 12px;">Use arrow keys or swipe</p>
        `;

        document.getElementById('p2048Reset')?.addEventListener('click', () => this.reset());

        this.statusArea.textContent = `Score: ${this.score} | Best: ${this.bestScore}`;

        const colors = {
            0: '#cdc1b4', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179',
            16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72',
            256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
        };

        let html = '<div class="p2048-board">';
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const val = this.board[r][c];
                const bg = colors[val] || '#3c3a32';
                const textColor = val <= 4 ? '#776e65' : '#f9f6f2';
                const fontSize = val >= 1000 ? '24px' : val >= 100 ? '28px' : '32px';
                
                html += `<div class="p2048-cell" style="background:${bg};color:${textColor};font-size:${fontSize}">
                    ${val || ''}
                </div>`;
            }
        }
        html += '</div>';

        if (this.gameOver) {
            html += `<div class="p2048-overlay">${this.won ? '🎉 You Win!' : '💀 Game Over'}</div>`;
        }

        this.gameArea.innerHTML = html;

        if (!document.getElementById('p2048-styles')) {
            const style = document.createElement('style');
            style.id = 'p2048-styles';
            style.textContent = `
                .p2048-board {
                    display: grid;
                    grid-template-columns: repeat(4, 70px);
                    gap: 8px;
                    background: #bbada0;
                    padding: 10px;
                    border-radius: 6px;
                    width: fit-content;
                    margin: 0 auto;
                    position: relative;
                }
                .p2048-cell {
                    width: 70px;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    border-radius: 4px;
                    transition: all 0.1s;
                }
                .p2048-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(255,255,255,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    font-weight: bold;
                    border-radius: 6px;
                }
            `;
            document.head.appendChild(style);
        }

        // Touch controls
        this.setupTouch();
    }

    setupTouch() {
        const board = this.gameArea.querySelector('.p2048-board');
        if (!board) return;

        let startX, startY;
        board.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        board.addEventListener('touchend', (e) => {
            if (this.gameOver) return;
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            const absDx = Math.abs(dx), absDy = Math.abs(dy);
            
            if (Math.max(absDx, absDy) < 30) return;
            
            if (absDx > absDy) {
                this.move(dx > 0 ? 'right' : 'left');
            } else {
                this.move(dy > 0 ? 'down' : 'up');
            }
        });
    }

    move(direction) {
        const oldBoard = JSON.stringify(this.board);
        
        if (direction === 'left' || direction === 'right') {
            for (let r = 0; r < this.size; r++) {
                let row = this.board[r].filter(x => x);
                if (direction === 'right') row.reverse();
                row = this.merge(row);
                if (direction === 'right') row.reverse();
                while (row.length < this.size) {
                    direction === 'right' ? row.unshift(0) : row.push(0);
                }
                this.board[r] = row;
            }
        } else {
            for (let c = 0; c < this.size; c++) {
                let col = [];
                for (let r = 0; r < this.size; r++) col.push(this.board[r][c]);
                col = col.filter(x => x);
                if (direction === 'down') col.reverse();
                col = this.merge(col);
                if (direction === 'down') col.reverse();
                while (col.length < this.size) {
                    direction === 'down' ? col.unshift(0) : col.push(0);
                }
                for (let r = 0; r < this.size; r++) this.board[r][c] = col[r];
            }
        }

        if (JSON.stringify(this.board) !== oldBoard) {
            this.addRandomTile();
            this.checkGameOver();
            
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('2048-best', this.bestScore.toString());
            }
        }

        this.render();
    }

    merge(line) {
        const result = [];
        for (let i = 0; i < line.length; i++) {
            if (i < line.length - 1 && line[i] === line[i + 1]) {
                result.push(line[i] * 2);
                this.score += line[i] * 2;
                if (line[i] * 2 === 2048 && !this.won) {
                    this.won = true;
                    app.showSnackbar('🎉 You reached 2048!');
                }
                i++;
            } else {
                result.push(line[i]);
            }
        }
        return result;
    }

    checkGameOver() {
        // Check for empty cells
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === 0) return;
            }
        }

        // Check for possible merges
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const val = this.board[r][c];
                if (r < this.size - 1 && this.board[r + 1][c] === val) return;
                if (c < this.size - 1 && this.board[r][c + 1] === val) return;
            }
        }

        this.gameOver = true;
        app.showSnackbar(`Game Over! Score: ${this.score}`);
    }

    cleanup() {
        document.removeEventListener('keydown', this.keyHandler);
    }
}
