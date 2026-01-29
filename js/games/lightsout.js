class LightsOut {
    constructor() {
        this.name = 'Lights Out';
        this.size = 5;
        this.grid = [];
        this.moves = 0;
        this.level = 1;
        this.won = false;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }

    reset() {
        this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(false));
        this.moves = 0;
        this.won = false;
        this.generatePuzzle();
        this.render();
    }

    generatePuzzle() {
        const toggles = this.level + 4;
        for (let i = 0; i < toggles; i++) {
            const r = Math.floor(Math.random() * this.size);
            const c = Math.floor(Math.random() * this.size);
            this.applyToggle(r, c);
        }
        // Ensure at least one light is on
        if (this.grid.every(row => row.every(cell => !cell))) {
            const r = Math.floor(Math.random() * this.size);
            const c = Math.floor(Math.random() * this.size);
            this.applyToggle(r, c);
        }
    }

    applyToggle(row, col) {
        const dirs = [[0,0],[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dr, dc] of dirs) {
            const nr = row + dr, nc = col + dc;
            if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                this.grid[nr][nc] = !this.grid[nr][nc];
            }
        }
    }

    toggleCell(row, col) {
        if (this.won) return;
        this.applyToggle(row, col);
        this.moves++;
        if (this.checkWin()) {
            this.won = true;
            this.level++;
            app.showSnackbar(`You won in ${this.moves} moves!`);
        }
        this.render();
    }

    checkWin() {
        return this.grid.every(row => row.every(cell => !cell));
    }

    render() {
        this.statusArea.innerHTML = `<div style="display:flex;gap:16px;justify-content:center;font-family:'Fredoka',sans-serif;">
            <span>Level: ${this.level}</span>
            <span>Moves: ${this.moves}</span>
        </div>`;

        let html = '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-width:300px;margin:0 auto;">';
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const on = this.grid[r][c];
                html += `<button data-r="${r}" data-c="${c}" style="
                    width:54px;height:54px;border:none;border-radius:12px;cursor:pointer;
                    transition:all 0.2s ease;
                    background:${on ? 'linear-gradient(135deg,#FBBF24,#F59E0B)' : 'var(--cream)'};
                    ${on ? 'box-shadow:0 0 15px #fbbf24,0 4px 12px rgba(251,191,36,0.4);' : 'box-shadow:0 2px 8px var(--shadow-soft);'}
                    color:${on ? '#fff' : 'var(--text-light)'};
                    font-size:20px;
                ">${on ? '💡' : ''}</button>`;
            }
        }
        html += '</div>';

        if (this.won) {
            html += `<div style="text-align:center;margin-top:16px;font-family:'Fredoka',sans-serif;font-size:18px;color:var(--mint-deep);">
                All lights out! 🎉
            </div>`;
        }

        this.gameArea.innerHTML = html;

        this.gameArea.querySelectorAll('button[data-r]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleCell(parseInt(btn.dataset.r), parseInt(btn.dataset.c));
            });
        });

        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="lo-reset">New Puzzle</button>
        `;
        document.getElementById('lo-reset').addEventListener('click', () => this.reset());
    }

    cleanup() {
        this.gameArea.innerHTML = '';
        this.statusArea.innerHTML = '';
        this.controlsArea.innerHTML = '';
    }
}
