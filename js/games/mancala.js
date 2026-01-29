class Mancala {
    constructor() {
        this.name = 'Mancala';
        this.pits = [];
        this.currentPlayer = 1;
        this.mode = 'ai';
        this.gameOver = false;
        this.lastMove = -1;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }

    reset() {
        this.pits = new Array(14).fill(4);
        this.pits[6] = 0;
        this.pits[13] = 0;
        this.currentPlayer = 1;
        this.gameOver = false;
        this.lastMove = -1;
        this.render();
    }

    sowStones(pit) {
        if (this.gameOver) return;
        if (this.currentPlayer === 1 && (pit < 0 || pit > 5)) return;
        if (this.currentPlayer === 2 && (pit < 7 || pit > 12)) return;
        if (this.pits[pit] === 0) return;

        let stones = this.pits[pit];
        this.pits[pit] = 0;
        let idx = pit;
        const skipStore = this.currentPlayer === 1 ? 13 : 6;

        while (stones > 0) {
            idx = (idx + 1) % 14;
            if (idx === skipStore) continue;
            this.pits[idx]++;
            stones--;
        }

        this.lastMove = pit;

        // Last stone in own store = extra turn
        const ownStore = this.currentPlayer === 1 ? 6 : 13;
        if (idx === ownStore) {
            this.checkEnd();
            this.render();
            if (!this.gameOver && this.mode === 'ai' && this.currentPlayer === 2) {
                setTimeout(() => this.aiMove(), 500);
            }
            return;
        }

        // Capture: last stone in own empty pit
        if (this.pits[idx] === 1) {
            const ownRange = this.currentPlayer === 1 ? [0, 5] : [7, 12];
            if (idx >= ownRange[0] && idx <= ownRange[1]) {
                const opposite = 12 - idx;
                if (this.pits[opposite] > 0) {
                    this.pits[ownStore] += this.pits[opposite] + 1;
                    this.pits[opposite] = 0;
                    this.pits[idx] = 0;
                }
            }
        }

        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.checkEnd();
        this.render();

        if (!this.gameOver && this.mode === 'ai' && this.currentPlayer === 2) {
            setTimeout(() => this.aiMove(), 500);
        }
    }

    checkEnd() {
        const p1Empty = this.pits.slice(0, 6).every(p => p === 0);
        const p2Empty = this.pits.slice(7, 13).every(p => p === 0);

        if (p1Empty || p2Empty) {
            for (let i = 0; i < 6; i++) { this.pits[6] += this.pits[i]; this.pits[i] = 0; }
            for (let i = 7; i < 13; i++) { this.pits[13] += this.pits[i]; this.pits[i] = 0; }
            this.gameOver = true;
            const msg = this.pits[6] > this.pits[13] ? 'You win!' :
                        this.pits[13] > this.pits[6] ? 'AI wins!' : "It's a tie!";
            app.showSnackbar(msg);
        }
    }

    aiMove() {
        if (this.gameOver || this.currentPlayer !== 2) return;

        const valid = [];
        for (let i = 7; i <= 12; i++) {
            if (this.pits[i] > 0) valid.push(i);
        }
        if (valid.length === 0) return;

        // 1. End in store (extra turn)
        for (const pit of valid) {
            let stones = this.pits[pit];
            let idx = pit;
            while (stones > 0) { idx = (idx + 1) % 14; if (idx === 6) continue; stones--; }
            if (idx === 13) { this.sowStones(pit); return; }
        }

        // 2. Capture
        let bestCapture = -1, bestVal = 0;
        for (const pit of valid) {
            let stones = this.pits[pit];
            let idx = pit;
            while (stones > 0) { idx = (idx + 1) % 14; if (idx === 6) continue; stones--; }
            if (idx >= 7 && idx <= 12 && this.pits[idx] === 0) {
                const opp = 12 - idx;
                if (this.pits[opp] > bestVal) { bestVal = this.pits[opp]; bestCapture = pit; }
            }
        }
        if (bestCapture >= 0) { this.sowStones(bestCapture); return; }

        // 3. Most stones
        valid.sort((a, b) => this.pits[b] - this.pits[a]);
        this.sowStones(valid[0]);
    }

    render() {
        const colors = { 1: '#14b8a6', 2: '#f43f5e' };
        this.statusArea.innerHTML = `<div style="display:flex;gap:16px;justify-content:center;font-family:'Fredoka',sans-serif;">
            <span style="color:${colors[1]}">You: ${this.pits[6]}</span>
            <span>${this.gameOver ? 'Game Over' : (this.currentPlayer === 1 ? 'Your turn' : 'AI thinking...')}</span>
            <span style="color:${colors[2]}">AI: ${this.pits[13]}</span>
        </div>`;

        const pitStyle = (count, clickable) => `
            width:48px;height:48px;border-radius:50%;border:none;
            background:var(--cream);box-shadow:inset 0 2px 6px var(--shadow-soft);
            font-family:'Fredoka',sans-serif;font-size:18px;font-weight:700;color:var(--text);
            display:flex;align-items:center;justify-content:center;
            cursor:${clickable ? 'pointer' : 'default'};
            transition:all 0.2s ease;
        `;

        const storeStyle = `
            width:56px;height:120px;border-radius:28px;
            background:var(--cream);box-shadow:inset 0 2px 6px var(--shadow-soft);
            display:flex;align-items:center;justify-content:center;
            font-family:'Fredoka',sans-serif;font-size:22px;font-weight:700;color:var(--text);
        `;

        let html = `<div style="display:flex;align-items:center;gap:12px;background:var(--gradient-card);padding:20px;border-radius:24px;box-shadow:0 12px 32px var(--shadow-soft);">`;

        // P2 store (left)
        html += `<div style="${storeStyle}">${this.pits[13]}</div>`;

        // Middle pits
        html += `<div style="display:flex;flex-direction:column;gap:12px;">`;
        // Top row: P2 pits (12..7, right to left visually)
        html += `<div style="display:flex;gap:8px;">`;
        for (let i = 12; i >= 7; i--) {
            html += `<div style="${pitStyle(this.pits[i], false)}">${this.pits[i]}</div>`;
        }
        html += `</div>`;
        // Bottom row: P1 pits (0..5)
        html += `<div style="display:flex;gap:8px;">`;
        for (let i = 0; i <= 5; i++) {
            const clickable = this.currentPlayer === 1 && this.pits[i] > 0 && !this.gameOver;
            html += `<button data-pit="${i}" style="${pitStyle(this.pits[i], clickable)}${clickable ? 'background:linear-gradient(135deg,#d1fae5,#a7f3d0);' : ''}">${this.pits[i]}</button>`;
        }
        html += `</div>`;
        html += `</div>`;

        // P1 store (right)
        html += `<div style="${storeStyle}">${this.pits[6]}</div>`;

        html += `</div>`;
        this.gameArea.innerHTML = html;

        this.gameArea.querySelectorAll('button[data-pit]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.currentPlayer === 1) {
                    this.sowStones(parseInt(btn.dataset.pit));
                }
            });
        });

        this.controlsArea.innerHTML = `<button class="btn btn-primary" id="mancala-reset">New Game</button>`;
        document.getElementById('mancala-reset').addEventListener('click', () => this.reset());
    }

    cleanup() {
        this.gameArea.innerHTML = '';
        this.statusArea.innerHTML = '';
        this.controlsArea.innerHTML = '';
    }
}
