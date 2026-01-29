class Nonogram {
    constructor() {
        this.name = 'Nonogram';
        this.size = 5;
        this.pattern = [];
        this.grid = [];
        this.rowClues = [];
        this.colClues = [];
        this.timer = null;
        this.seconds = 0;
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
        this.generatePattern();
        this.grid = Array.from({ length: this.size }, () => Array(this.size).fill('empty'));
        this.deriveClues();
        this.timer = setInterval(() => {
            if (!this.won) { this.seconds++; this.renderStatus(); }
        }, 1000);
        this.render();
    }

    generatePattern() {
        this.pattern = Array.from({ length: this.size }, () =>
            Array.from({ length: this.size }, () => Math.random() < 0.45)
        );
        // Ensure each row/col has at least 1 filled
        for (let r = 0; r < this.size; r++) {
            if (this.pattern[r].every(c => !c)) {
                this.pattern[r][Math.floor(Math.random() * this.size)] = true;
            }
        }
        for (let c = 0; c < this.size; c++) {
            if (this.pattern.every(row => !row[c])) {
                this.pattern[Math.floor(Math.random() * this.size)][c] = true;
            }
        }
    }

    deriveClues() {
        this.rowClues = [];
        for (let r = 0; r < this.size; r++) {
            const clues = [];
            let count = 0;
            for (let c = 0; c < this.size; c++) {
                if (this.pattern[r][c]) { count++; }
                else if (count > 0) { clues.push(count); count = 0; }
            }
            if (count > 0) clues.push(count);
            this.rowClues.push(clues.length > 0 ? clues : [0]);
        }

        this.colClues = [];
        for (let c = 0; c < this.size; c++) {
            const clues = [];
            let count = 0;
            for (let r = 0; r < this.size; r++) {
                if (this.pattern[r][c]) { count++; }
                else if (count > 0) { clues.push(count); count = 0; }
            }
            if (count > 0) clues.push(count);
            this.colClues.push(clues.length > 0 ? clues : [0]);
        }
    }

    toggleCell(r, c, mark) {
        if (this.won) return;
        if (mark) {
            // Right-click / long press: mark X
            this.grid[r][c] = this.grid[r][c] === 'marked' ? 'empty' : 'marked';
        } else {
            this.grid[r][c] = this.grid[r][c] === 'filled' ? 'empty' : 'filled';
        }
        if (this.checkWin()) {
            this.won = true;
            clearInterval(this.timer);
            app.showSnackbar('Puzzle solved!');
        }
        this.render();
    }

    checkWin() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const filled = this.grid[r][c] === 'filled';
                if (filled !== this.pattern[r][c]) return false;
            }
        }
        return true;
    }

    isRowComplete(r) {
        const clues = [];
        let count = 0;
        for (let c = 0; c < this.size; c++) {
            if (this.grid[r][c] === 'filled') { count++; }
            else if (count > 0) { clues.push(count); count = 0; }
        }
        if (count > 0) clues.push(count);
        if (clues.length === 0) clues.push(0);
        return JSON.stringify(clues) === JSON.stringify(this.rowClues[r]);
    }

    isColComplete(c) {
        const clues = [];
        let count = 0;
        for (let r = 0; r < this.size; r++) {
            if (this.grid[r][c] === 'filled') { count++; }
            else if (count > 0) { clues.push(count); count = 0; }
        }
        if (count > 0) clues.push(count);
        if (clues.length === 0) clues.push(0);
        return JSON.stringify(clues) === JSON.stringify(this.colClues[c]);
    }

    formatTime(s) {
        const m = Math.floor(s / 60);
        return `${m}:${(s % 60).toString().padStart(2, '0')}`;
    }

    renderStatus() {
        this.statusArea.innerHTML = `<div style="display:flex;gap:16px;justify-content:center;font-family:'Fredoka',sans-serif;">
            <span>Time: ${this.formatTime(this.seconds)}</span>
            <span>${this.size}×${this.size}</span>
        </div>`;
    }

    render() {
        this.renderStatus();
        const cellSize = this.size <= 5 ? 44 : 32;
        const clueW = this.size <= 5 ? 60 : 80;
        const clueH = this.size <= 5 ? 50 : 70;

        let html = '<div style="margin:0 auto;width:fit-content;font-family:\'Fredoka\',sans-serif;user-select:none;">';

        // Column clues header
        html += `<div style="display:flex;margin-left:${clueW}px;">`;
        for (let c = 0; c < this.size; c++) {
            const done = this.isColComplete(c);
            html += `<div style="width:${cellSize}px;text-align:center;font-size:12px;font-weight:600;
                color:${done ? 'var(--mint-deep)' : 'var(--text)'};opacity:${done ? '0.5' : '1'};
                display:flex;flex-direction:column;justify-content:flex-end;height:${clueH}px;padding-bottom:4px;">`;
            for (const n of this.colClues[c]) {
                html += `<div>${n}</div>`;
            }
            html += '</div>';
        }
        html += '</div>';

        // Rows
        for (let r = 0; r < this.size; r++) {
            const rowDone = this.isRowComplete(r);
            html += '<div style="display:flex;">';
            // Row clues
            html += `<div style="width:${clueW}px;display:flex;align-items:center;justify-content:flex-end;gap:4px;padding-right:8px;
                font-size:13px;font-weight:600;color:${rowDone ? 'var(--mint-deep)' : 'var(--text)'};opacity:${rowDone ? '0.5' : '1'};">`;
            for (const n of this.rowClues[r]) {
                html += `<span>${n}</span>`;
            }
            html += '</div>';

            // Cells
            for (let c = 0; c < this.size; c++) {
                const state = this.grid[r][c];
                let bg = 'var(--cream)';
                let content = '';
                if (state === 'filled') { bg = 'var(--text)'; }
                else if (state === 'marked') { content = '✕'; }

                html += `<div data-r="${r}" data-c="${c}" style="
                    width:${cellSize}px;height:${cellSize}px;
                    background:${bg};
                    border:1px solid var(--shadow-soft);
                    ${r % 5 === 0 ? 'border-top:2px solid var(--text);' : ''}
                    ${c % 5 === 0 ? 'border-left:2px solid var(--text);' : ''}
                    display:flex;align-items:center;justify-content:center;
                    cursor:pointer;font-size:14px;color:var(--text-light);
                    transition:background 0.1s;
                ">${content}</div>`;
            }
            html += '</div>';
        }

        if (this.won) {
            html += '<div style="text-align:center;margin-top:12px;font-size:18px;color:var(--mint-deep);">Puzzle Solved! 🎉</div>';
        }

        html += '</div>';
        this.gameArea.innerHTML = html;

        // Event listeners
        this.gameArea.querySelectorAll('[data-r]').forEach(el => {
            const r = parseInt(el.dataset.r), c = parseInt(el.dataset.c);
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCell(r, c, false);
            });
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.toggleCell(r, c, true);
            });
            // Long press for touch
            let pressTimer = null;
            el.addEventListener('touchstart', (e) => {
                e.preventDefault();
                pressTimer = setTimeout(() => {
                    this.toggleCell(r, c, true);
                    pressTimer = null;
                }, 400);
            }, { passive: false });
            el.addEventListener('touchend', (e) => {
                e.preventDefault();
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                    this.toggleCell(r, c, false);
                }
            });
        });

        this.controlsArea.innerHTML = `
            <div class="mode-selector">
                <button class="mode-btn ${this.size === 5 ? 'active' : ''}" data-size="5">5×5</button>
                <button class="mode-btn ${this.size === 10 ? 'active' : ''}" data-size="10">10×10</button>
            </div>
            <button class="btn btn-primary" id="nono-new">New Puzzle</button>
        `;
        this.controlsArea.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => { this.size = parseInt(btn.dataset.size); this.reset(); });
        });
        document.getElementById('nono-new').addEventListener('click', () => this.reset());
    }

    cleanup() {
        if (this.timer) clearInterval(this.timer);
        this.gameArea.innerHTML = '';
        this.statusArea.innerHTML = '';
        this.controlsArea.innerHTML = '';
    }
}
