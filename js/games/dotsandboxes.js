class DotsAndBoxes {
    constructor() {
        this.name = 'Dots and Boxes';
        this.gridSize = 4;
        this.edges = {};
        this.boxes = {};
        this.currentPlayer = 1;
        this.scores = { 1: 0, 2: 0 };
        this.mode = 'ai';
        this.gameOver = false;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }

    reset() {
        this.edges = {};
        this.boxes = {};
        this.currentPlayer = 1;
        this.scores = { 1: 0, 2: 0 };
        this.gameOver = false;
        this.render();
    }

    edgeKey(r, c, dir) {
        return `${r},${c},${dir}`;
    }

    addEdge(r, c, dir) {
        const key = this.edgeKey(r, c, dir);
        if (this.edges[key] || this.gameOver) return false;
        this.edges[key] = this.currentPlayer;

        const completed = this.checkBoxes(r, c, dir);
        if (!completed) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        }

        this.checkGameOver();
        this.render();

        if (!this.gameOver && this.mode === 'ai' && this.currentPlayer === 2) {
            setTimeout(() => this.aiMove(), 400);
        }
        return true;
    }

    checkBoxes(r, c, dir) {
        let completed = false;
        const boxes = this.getAdjacentBoxes(r, c, dir);
        for (const [br, bc] of boxes) {
            if (this.isBoxComplete(br, bc) && !this.boxes[`${br},${bc}`]) {
                this.boxes[`${br},${bc}`] = this.currentPlayer;
                this.scores[this.currentPlayer]++;
                completed = true;
            }
        }
        return completed;
    }

    getAdjacentBoxes(r, c, dir) {
        const s = this.gridSize - 1;
        const result = [];
        if (dir === 'h') {
            if (r > 0) result.push([r - 1, c]);
            if (r < s) result.push([r, c]);
        } else {
            if (c > 0) result.push([r, c - 1]);
            if (c < s) result.push([r, c]);
        }
        return result;
    }

    isBoxComplete(r, c) {
        return this.edges[this.edgeKey(r, c, 'h')] &&
               this.edges[this.edgeKey(r + 1, c, 'h')] &&
               this.edges[this.edgeKey(r, c, 'v')] &&
               this.edges[this.edgeKey(r, c + 1, 'v')];
    }

    countBoxEdges(r, c) {
        let count = 0;
        if (this.edges[this.edgeKey(r, c, 'h')]) count++;
        if (this.edges[this.edgeKey(r + 1, c, 'h')]) count++;
        if (this.edges[this.edgeKey(r, c, 'v')]) count++;
        if (this.edges[this.edgeKey(r, c + 1, 'v')]) count++;
        return count;
    }

    checkGameOver() {
        const totalBoxes = (this.gridSize - 1) * (this.gridSize - 1);
        if (this.scores[1] + this.scores[2] >= totalBoxes) {
            this.gameOver = true;
            const msg = this.scores[1] > this.scores[2] ? 'You win!' :
                        this.scores[2] > this.scores[1] ? 'AI wins!' : "It's a tie!";
            app.showSnackbar(msg);
        }
    }

    aiMove() {
        if (this.gameOver) return;
        const available = this.getAvailableEdges();
        if (available.length === 0) return;

        // 1. Complete a box
        for (const [r, c, d] of available) {
            const boxes = this.getAdjacentBoxes(r, c, d);
            for (const [br, bc] of boxes) {
                if (this.countBoxEdges(br, bc) === 3 && !this.boxes[`${br},${bc}`]) {
                    this.addEdge(r, c, d);
                    return;
                }
            }
        }

        // 2. Avoid giving 3rd edge
        const safe = available.filter(([r, c, d]) => {
            const boxes = this.getAdjacentBoxes(r, c, d);
            return boxes.every(([br, bc]) => this.countBoxEdges(br, bc) < 2 || this.boxes[`${br},${bc}`]);
        });

        if (safe.length > 0) {
            const pick = safe[Math.floor(Math.random() * safe.length)];
            this.addEdge(pick[0], pick[1], pick[2]);
            return;
        }

        // 3. Random
        const pick = available[Math.floor(Math.random() * available.length)];
        this.addEdge(pick[0], pick[1], pick[2]);
    }

    getAvailableEdges() {
        const result = [];
        const s = this.gridSize;
        for (let r = 0; r < s; r++) {
            for (let c = 0; c < s - 1; c++) {
                if (!this.edges[this.edgeKey(r, c, 'h')]) result.push([r, c, 'h']);
            }
        }
        for (let r = 0; r < s - 1; r++) {
            for (let c = 0; c < s; c++) {
                if (!this.edges[this.edgeKey(r, c, 'v')]) result.push([r, c, 'v']);
            }
        }
        return result;
    }

    render() {
        const s = this.gridSize;
        const dotSize = 12;
        const spacing = 60;
        const edgeThick = 6;

        const colors = { 1: '#14b8a6', 2: '#f43f5e' };
        const boxColors = { 1: 'rgba(20,184,166,0.2)', 2: 'rgba(244,63,94,0.2)' };

        this.statusArea.innerHTML = `<div style="display:flex;gap:16px;justify-content:center;font-family:'Fredoka',sans-serif;">
            <span style="color:${colors[1]}">You: ${this.scores[1]}</span>
            <span>${this.gameOver ? 'Game Over' : (this.currentPlayer === 1 ? 'Your turn' : 'AI thinking...')}</span>
            <span style="color:${colors[2]}">AI: ${this.scores[2]}</span>
        </div>`;

        const totalW = (s - 1) * spacing + dotSize;
        const totalH = totalW;

        let html = `<div style="position:relative;width:${totalW}px;height:${totalH}px;margin:0 auto;">`;

        // Boxes
        for (let r = 0; r < s - 1; r++) {
            for (let c = 0; c < s - 1; c++) {
                const key = `${r},${c}`;
                if (this.boxes[key]) {
                    const x = c * spacing + dotSize / 2;
                    const y = r * spacing + dotSize / 2;
                    html += `<div style="position:absolute;left:${x}px;top:${y}px;width:${spacing}px;height:${spacing}px;background:${boxColors[this.boxes[key]]};border-radius:4px;"></div>`;
                }
            }
        }

        // Horizontal edges
        for (let r = 0; r < s; r++) {
            for (let c = 0; c < s - 1; c++) {
                const key = this.edgeKey(r, c, 'h');
                const x = c * spacing + dotSize;
                const y = r * spacing + dotSize / 2 - edgeThick / 2;
                const filled = this.edges[key];
                html += `<div data-edge="${r},${c},h" style="position:absolute;left:${x}px;top:${y}px;width:${spacing - dotSize}px;height:${edgeThick}px;
                    background:${filled ? colors[filled] : 'var(--shadow-soft)'};
                    border-radius:3px;cursor:${filled ? 'default' : 'pointer'};
                    transition:background 0.2s;
                    ${!filled ? 'opacity:0.4;' : ''}
                "></div>`;
            }
        }

        // Vertical edges
        for (let r = 0; r < s - 1; r++) {
            for (let c = 0; c < s; c++) {
                const key = this.edgeKey(r, c, 'v');
                const x = c * spacing + dotSize / 2 - edgeThick / 2;
                const y = r * spacing + dotSize;
                const filled = this.edges[key];
                html += `<div data-edge="${r},${c},v" style="position:absolute;left:${x}px;top:${y}px;width:${edgeThick}px;height:${spacing - dotSize}px;
                    background:${filled ? colors[filled] : 'var(--shadow-soft)'};
                    border-radius:3px;cursor:${filled ? 'default' : 'pointer'};
                    transition:background 0.2s;
                    ${!filled ? 'opacity:0.4;' : ''}
                "></div>`;
            }
        }

        // Dots
        for (let r = 0; r < s; r++) {
            for (let c = 0; c < s; c++) {
                const x = c * spacing;
                const y = r * spacing;
                html += `<div style="position:absolute;left:${x}px;top:${y}px;width:${dotSize}px;height:${dotSize}px;background:var(--text);border-radius:50%;z-index:2;"></div>`;
            }
        }

        html += '</div>';
        this.gameArea.innerHTML = html;

        // Edge click handlers
        this.gameArea.querySelectorAll('[data-edge]').forEach(el => {
            el.addEventListener('click', () => {
                if (this.currentPlayer !== 1 && this.mode === 'ai') return;
                const [r, c, d] = el.dataset.edge.split(',');
                this.addEdge(parseInt(r), parseInt(c), d);
            });
            if (!this.edges[el.dataset.edge]) {
                el.addEventListener('mouseenter', () => { el.style.opacity = '0.8'; el.style.background = colors[1]; });
                el.addEventListener('mouseleave', () => { el.style.opacity = '0.4'; el.style.background = 'var(--shadow-soft)'; });
            }
        });

        this.controlsArea.innerHTML = `<button class="btn btn-primary" id="dab-reset">New Game</button>`;
        document.getElementById('dab-reset').addEventListener('click', () => this.reset());
    }

    cleanup() {
        this.gameArea.innerHTML = '';
        this.statusArea.innerHTML = '';
        this.controlsArea.innerHTML = '';
    }
}
