class Sudoku {
    constructor() {
        this.name = 'Sudoku';
        this.grid = [];
        this.solution = [];
        this.selectedCell = null;
        this.difficulty = 'medium';
        this.timer = null;
        this.seconds = 0;
        this.noteMode = false;
        this.won = false;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }

    reset() {
        if (this.timer) clearInterval(this.timer);
        this.seconds = 0;
        this.won = false;
        this.selectedCell = null;
        this.noteMode = false;
        this.generatePuzzle();
        this.timer = setInterval(() => {
            if (!this.won) { this.seconds++; this.renderStatus(); }
        }, 1000);
        this.render();
    }

    generatePuzzle() {
        this.solution = Array.from({ length: 9 }, () => Array(9).fill(0));
        this.fillGrid(this.solution);

        this.grid = Array.from({ length: 9 }, (_, r) =>
            Array.from({ length: 9 }, (_, c) => ({
                value: this.solution[r][c],
                given: true,
                notes: new Set()
            }))
        );

        const clueTargets = { easy: 40, medium: 32, hard: 26 };
        const target = clueTargets[this.difficulty] || 32;
        this.removeClues(target);
    }

    fillGrid(grid) {
        const find = () => {
            for (let r = 0; r < 9; r++)
                for (let c = 0; c < 9; c++)
                    if (grid[r][c] === 0) return [r, c];
            return null;
        };

        const cell = find();
        if (!cell) return true;
        const [r, c] = cell;

        const nums = [1,2,3,4,5,6,7,8,9];
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }

        for (const n of nums) {
            if (!this.hasConflict(grid, r, c, n)) {
                grid[r][c] = n;
                if (this.fillGrid(grid)) return true;
                grid[r][c] = 0;
            }
        }
        return false;
    }

    hasConflict(grid, r, c, num) {
        for (let i = 0; i < 9; i++) {
            if (grid[r][i] === num) return true;
            if (grid[i][c] === num) return true;
        }
        const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
        for (let dr = 0; dr < 3; dr++)
            for (let dc = 0; dc < 3; dc++)
                if (grid[br + dr][bc + dc] === num) return true;
        return false;
    }

    removeClues(target) {
        const cells = [];
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                cells.push([r, c]);
        // Shuffle
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[j]] = [cells[j], cells[i]];
        }

        let given = 81;
        for (const [r, c] of cells) {
            if (given <= target) break;
            const backup = this.grid[r][c].value;
            this.grid[r][c].value = 0;
            this.grid[r][c].given = false;

            // Simple check: count solutions (limit 2)
            const testGrid = this.grid.map(row => row.map(cell => cell.given ? cell.value : 0));
            let solutions = 0;
            const countSolutions = (g) => {
                if (solutions > 1) return;
                let cell = null;
                for (let rr = 0; rr < 9; rr++)
                    for (let cc = 0; cc < 9; cc++)
                        if (g[rr][cc] === 0) { cell = [rr, cc]; break; }
                if (!cell) { solutions++; return; }
                if (cell === null) return;
                const [rr, cc] = cell;
                for (let n = 1; n <= 9; n++) {
                    if (!this.hasConflict(g, rr, cc, n)) {
                        g[rr][cc] = n;
                        countSolutions(g);
                        g[rr][cc] = 0;
                        if (solutions > 1) return;
                    }
                }
            };
            countSolutions(testGrid);

            if (solutions !== 1) {
                this.grid[r][c].value = backup;
                this.grid[r][c].given = true;
            } else {
                given--;
            }
        }
    }

    placeNumber(num) {
        if (!this.selectedCell || this.won) return;
        const [r, c] = this.selectedCell;
        if (this.grid[r][c].given) return;

        if (this.noteMode) {
            if (num === 0) {
                this.grid[r][c].notes.clear();
            } else {
                if (this.grid[r][c].notes.has(num)) this.grid[r][c].notes.delete(num);
                else this.grid[r][c].notes.add(num);
            }
        } else {
            this.grid[r][c].value = num;
            this.grid[r][c].notes.clear();
            if (this.checkWin()) {
                this.won = true;
                clearInterval(this.timer);
                app.showSnackbar('Puzzle solved!');
            }
        }
        this.render();
    }

    checkWin() {
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                if (this.grid[r][c].value !== this.solution[r][c]) return false;
        return true;
    }

    getCellConflict(r, c) {
        const val = this.grid[r][c].value;
        if (val === 0) return false;
        if (this.grid[r][c].given) return false;
        return val !== this.solution[r][c];
    }

    formatTime(s) {
        const m = Math.floor(s / 60);
        return `${m}:${(s % 60).toString().padStart(2, '0')}`;
    }

    renderStatus() {
        this.statusArea.innerHTML = `<div style="display:flex;gap:16px;justify-content:center;font-family:'Fredoka',sans-serif;">
            <span>Time: ${this.formatTime(this.seconds)}</span>
            <span style="text-transform:capitalize;">${this.difficulty}</span>
        </div>`;
    }

    render() {
        this.renderStatus();
        const sel = this.selectedCell;
        const cellSize = 38;

        let html = '<div style="margin:0 auto;width:fit-content;">';
        html += `<div style="display:grid;grid-template-columns:repeat(9,${cellSize}px);border:2px solid var(--text);background:var(--text);gap:1px;border-radius:8px;overflow:hidden;">`;

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = this.grid[r][c];
                const isSel = sel && sel[0] === r && sel[1] === c;
                const sameVal = sel && cell.value && !cell.notes.size &&
                    this.grid[sel[0]][sel[1]].value === cell.value && cell.value !== 0;
                const conflict = this.getCellConflict(r, c);

                const borderR = (c + 1) % 3 === 0 && c < 8 ? '2px solid var(--text)' : 'none';
                const borderB = (r + 1) % 3 === 0 && r < 8 ? '2px solid var(--text)' : 'none';

                let bg = 'var(--cream)';
                if (isSel) bg = '#bfdbfe';
                else if (sameVal) bg = '#dbeafe';

                html += `<div data-r="${r}" data-c="${c}" style="
                    width:${cellSize}px;height:${cellSize}px;
                    background:${bg};
                    display:flex;align-items:center;justify-content:center;
                    cursor:pointer;position:relative;
                    border-right:${borderR};border-bottom:${borderB};
                    font-family:'Fredoka',sans-serif;
                ">`;

                if (cell.value) {
                    html += `<span style="
                        font-size:18px;font-weight:${cell.given ? '700' : '500'};
                        color:${conflict ? '#DC2626' : cell.given ? 'var(--text)' : '#2563eb'};
                    ">${cell.value}</span>`;
                } else if (cell.notes.size > 0) {
                    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);width:100%;height:100%;padding:1px;">';
                    for (let n = 1; n <= 9; n++) {
                        html += `<span style="font-size:8px;color:var(--text-light);text-align:center;line-height:12px;">${cell.notes.has(n) ? n : ''}</span>`;
                    }
                    html += '</div>';
                }

                html += '</div>';
            }
        }
        html += '</div>';

        // Number picker
        html += '<div style="display:flex;gap:4px;justify-content:center;margin-top:12px;">';
        for (let n = 1; n <= 9; n++) {
            html += `<button data-num="${n}" style="
                width:34px;height:38px;border:none;border-radius:8px;cursor:pointer;
                background:${this.noteMode ? 'var(--cream)' : 'linear-gradient(135deg,#2563eb,#1d4ed8)'};
                color:${this.noteMode ? 'var(--text)' : '#fff'};
                font-family:'Fredoka',sans-serif;font-size:16px;font-weight:600;
            ">${n}</button>`;
        }
        html += `<button data-num="0" style="
            width:34px;height:38px;border:none;border-radius:8px;cursor:pointer;
            background:var(--cream);color:var(--text);
            font-family:'Fredoka',sans-serif;font-size:12px;
        ">✕</button>`;
        html += '</div>';

        if (this.won) {
            html += '<div style="text-align:center;margin-top:12px;font-family:\'Fredoka\',sans-serif;font-size:18px;color:var(--mint-deep);">Puzzle Solved! 🎉</div>';
        }

        html += '</div>';
        this.gameArea.innerHTML = html;

        // Cell clicks
        this.gameArea.querySelectorAll('[data-r]').forEach(el => {
            el.addEventListener('click', () => {
                this.selectedCell = [parseInt(el.dataset.r), parseInt(el.dataset.c)];
                this.render();
            });
        });

        // Number clicks
        this.gameArea.querySelectorAll('[data-num]').forEach(el => {
            el.addEventListener('click', () => {
                this.placeNumber(parseInt(el.dataset.num));
            });
        });

        // Keyboard
        if (!this._onKey) {
            this._onKey = (e) => {
                const n = parseInt(e.key);
                if (n >= 1 && n <= 9) this.placeNumber(n);
                if (e.key === 'Backspace' || e.key === 'Delete') this.placeNumber(0);
                if (e.key === 'ArrowUp' && this.selectedCell) { this.selectedCell[0] = Math.max(0, this.selectedCell[0] - 1); this.render(); }
                if (e.key === 'ArrowDown' && this.selectedCell) { this.selectedCell[0] = Math.min(8, this.selectedCell[0] + 1); this.render(); }
                if (e.key === 'ArrowLeft' && this.selectedCell) { this.selectedCell[1] = Math.max(0, this.selectedCell[1] - 1); this.render(); }
                if (e.key === 'ArrowRight' && this.selectedCell) { this.selectedCell[1] = Math.min(8, this.selectedCell[1] + 1); this.render(); }
            };
            document.addEventListener('keydown', this._onKey);
        }

        this.controlsArea.innerHTML = `
            <button class="btn ${this.noteMode ? 'btn-secondary' : 'btn-outline'}" id="sdk-note">Notes ${this.noteMode ? 'ON' : 'OFF'}</button>
            <div class="mode-selector">
                <button class="mode-btn ${this.difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
                <button class="mode-btn ${this.difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
                <button class="mode-btn ${this.difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
            </div>
            <button class="btn btn-primary" id="sdk-new">New</button>
        `;
        document.getElementById('sdk-note').addEventListener('click', () => { this.noteMode = !this.noteMode; this.render(); });
        this.controlsArea.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => { this.difficulty = btn.dataset.diff; this.reset(); });
        });
        document.getElementById('sdk-new').addEventListener('click', () => this.reset());
    }

    cleanup() {
        if (this.timer) clearInterval(this.timer);
        if (this._onKey) { document.removeEventListener('keydown', this._onKey); this._onKey = null; }
        this.gameArea.innerHTML = '';
        this.statusArea.innerHTML = '';
        this.controlsArea.innerHTML = '';
    }
}
