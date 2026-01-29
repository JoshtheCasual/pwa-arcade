class SlidingPuzzle {
    constructor() {
        this.name = 'Sliding Puzzle';
        this.size = 4;
        this.tiles = [];
        this.moves = 0;
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
        this.moves = 0;
        this.seconds = 0;
        this.won = false;
        this.shuffle();
        this.timer = setInterval(() => {
            if (!this.won) {
                this.seconds++;
                this.renderStatus();
            }
        }, 1000);
        this.render();
    }

    shuffle() {
        const n = this.size * this.size;
        this.tiles = [];
        for (let i = 1; i < n; i++) this.tiles.push(i);
        this.tiles.push(0);

        // Fisher-Yates shuffle
        for (let i = this.tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
        }

        if (!this.isSolvable()) {
            // Swap first two non-zero tiles
            let a = -1, b = -1;
            for (let i = 0; i < this.tiles.length; i++) {
                if (this.tiles[i] !== 0) {
                    if (a === -1) a = i;
                    else if (b === -1) { b = i; break; }
                }
            }
            [this.tiles[a], this.tiles[b]] = [this.tiles[b], this.tiles[a]];
        }
    }

    isSolvable() {
        let inversions = 0;
        const flat = this.tiles.filter(t => t !== 0);
        for (let i = 0; i < flat.length; i++) {
            for (let j = i + 1; j < flat.length; j++) {
                if (flat[i] > flat[j]) inversions++;
            }
        }

        if (this.size % 2 === 1) {
            return inversions % 2 === 0;
        } else {
            const emptyIdx = this.tiles.indexOf(0);
            const emptyRowFromBottom = this.size - Math.floor(emptyIdx / this.size);
            return (inversions + emptyRowFromBottom) % 2 === 1;
        }
    }

    isAdjacent(i, j) {
        const ri = Math.floor(i / this.size), ci = i % this.size;
        const rj = Math.floor(j / this.size), cj = j % this.size;
        return (ri === rj && Math.abs(ci - cj) === 1) ||
               (ci === cj && Math.abs(ri - rj) === 1);
    }

    moveTile(index) {
        if (this.won) return;
        const emptyIdx = this.tiles.indexOf(0);
        if (this.isAdjacent(index, emptyIdx)) {
            [this.tiles[index], this.tiles[emptyIdx]] = [this.tiles[emptyIdx], this.tiles[index]];
            this.moves++;
            if (this.checkWin()) {
                this.won = true;
                clearInterval(this.timer);
                app.showSnackbar(`Solved in ${this.moves} moves!`);
            }
            this.render();
        }
    }

    checkWin() {
        for (let i = 0; i < this.tiles.length - 1; i++) {
            if (this.tiles[i] !== i + 1) return false;
        }
        return this.tiles[this.tiles.length - 1] === 0;
    }

    formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    renderStatus() {
        this.statusArea.innerHTML = `<div style="display:flex;gap:16px;justify-content:center;font-family:'Fredoka',sans-serif;">
            <span>Moves: ${this.moves}</span>
            <span>Time: ${this.formatTime(this.seconds)}</span>
        </div>`;
    }

    render() {
        this.renderStatus();

        const tileSize = this.size === 3 ? 80 : this.size === 4 ? 68 : 54;
        const gap = 4;
        const gridSize = tileSize * this.size + gap * (this.size - 1) + 24;

        let html = `<div style="display:grid;grid-template-columns:repeat(${this.size},${tileSize}px);gap:${gap}px;padding:12px;background:var(--gradient-card);border-radius:20px;box-shadow:0 12px 32px var(--shadow-soft);width:fit-content;margin:0 auto;">`;

        for (let i = 0; i < this.tiles.length; i++) {
            const t = this.tiles[i];
            if (t === 0) {
                html += `<div style="width:${tileSize}px;height:${tileSize}px;"></div>`;
            } else {
                html += `<button data-idx="${i}" style="
                    width:${tileSize}px;height:${tileSize}px;border:none;border-radius:12px;cursor:pointer;
                    background:linear-gradient(135deg,#14b8a6,#0d9488);color:#fff;
                    font-family:'Fredoka',sans-serif;font-size:${this.size === 5 ? 16 : 20}px;font-weight:700;
                    box-shadow:0 4px 12px rgba(20,184,166,0.3);
                    transition:transform 0.15s ease;
                ">${t}</button>`;
            }
        }
        html += '</div>';

        if (this.won) {
            html += `<div style="text-align:center;margin-top:16px;font-family:'Fredoka',sans-serif;font-size:18px;color:var(--mint-deep);">
                Puzzle solved! 🎉
            </div>`;
        }

        this.gameArea.innerHTML = html;

        this.gameArea.querySelectorAll('button[data-idx]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.moveTile(parseInt(btn.dataset.idx));
            });
        });

        this.controlsArea.innerHTML = `
            <div class="mode-selector">
                <button class="mode-btn ${this.size === 3 ? 'active' : ''}" data-size="3">3×3</button>
                <button class="mode-btn ${this.size === 4 ? 'active' : ''}" data-size="4">4×4</button>
                <button class="mode-btn ${this.size === 5 ? 'active' : ''}" data-size="5">5×5</button>
            </div>
            <button class="btn btn-primary" id="sp-reset">Shuffle</button>
        `;

        this.controlsArea.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.size = parseInt(btn.dataset.size);
                this.reset();
            });
        });
        document.getElementById('sp-reset').addEventListener('click', () => this.reset());
    }

    cleanup() {
        if (this.timer) clearInterval(this.timer);
        this.gameArea.innerHTML = '';
        this.statusArea.innerHTML = '';
        this.controlsArea.innerHTML = '';
    }
}
