class Freecell {
    constructor() {
        this.name = 'Freecell';
        this.tableau = [];
        this.freeCells = [null, null, null, null];
        this.foundations = { hearts: [], diamonds: [], clubs: [], spades: [] };
        this.selected = null;
        this.history = [];
        this.gameNumber = 1;
        this.won = false;
        this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.suitSymbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
        this.suitColors = { hearts: '#DC2626', diamonds: '#DC2626', clubs: '#1a1a2e', spades: '#1a1a2e' };
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }

    reset() {
        this.selected = null;
        this.history = [];
        this.won = false;
        this.freeCells = [null, null, null, null];
        this.foundations = { hearts: [], diamonds: [], clubs: [], spades: [] };
        this.deal();
        this.render();
    }

    makeDeck() {
        const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
        const deck = [];
        for (const suit of this.suits) {
            for (let v = 0; v < 13; v++) {
                deck.push({ suit, value: values[v], num: v + 1 });
            }
        }
        return deck;
    }

    deal() {
        let seed = this.gameNumber;
        const lcg = () => { seed = (seed * 214013 + 2531011) & 0x7fffffff; return (seed >> 16) & 0x7fff; };

        const deck = this.makeDeck();
        // Shuffle with LCG
        for (let i = deck.length - 1; i > 0; i--) {
            const j = lcg() % (i + 1);
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        this.tableau = Array.from({ length: 8 }, () => []);
        for (let i = 0; i < 52; i++) {
            this.tableau[i % 8].push(deck[i]);
        }
    }

    isRed(card) { return card.suit === 'hearts' || card.suit === 'diamonds'; }

    canPlaceOnTableau(card, col) {
        if (this.tableau[col].length === 0) return true;
        const top = this.tableau[col][this.tableau[col].length - 1];
        return this.isRed(card) !== this.isRed(top) && card.num === top.num - 1;
    }

    canPlaceOnFoundation(card) {
        const pile = this.foundations[card.suit];
        if (pile.length === 0) return card.num === 1;
        return card.num === pile[pile.length - 1].num + 1;
    }

    maxMoveSize() {
        const emptyFree = this.freeCells.filter(c => c === null).length;
        const emptyCols = this.tableau.filter(c => c.length === 0).length;
        return (emptyFree + 1) * Math.pow(2, emptyCols);
    }

    getMovableStackSize(colIdx) {
        const col = this.tableau[colIdx];
        if (col.length === 0) return 0;
        let size = 1;
        for (let i = col.length - 2; i >= 0; i--) {
            const curr = col[i], next = col[i + 1];
            if (this.isRed(curr) !== this.isRed(next) && curr.num === next.num + 1) {
                size++;
            } else break;
        }
        return size;
    }

    selectCard(source) {
        if (this.won) return;

        if (this.selected === null) {
            this.selected = source;
            this.render();
            return;
        }

        // Try to move
        const from = this.selected;
        this.selected = null;
        const moved = this.tryMove(from, source);
        if (!moved) {
            // If clicking same type of source, select new
            this.selected = source;
        }
        this.autoFoundation();
        this.checkWin();
        this.render();
    }

    tryMove(from, to) {
        let card, returnCard;

        if (from.type === 'tableau') {
            const col = this.tableau[from.col];
            if (col.length === 0) return false;

            if (to.type === 'foundation') {
                card = col[col.length - 1];
                if (this.canPlaceOnFoundation(card)) {
                    this.history.push({ from, to, card: col.pop() });
                    this.foundations[card.suit].push(card);
                    return true;
                }
                return false;
            }

            if (to.type === 'freecell') {
                if (this.freeCells[to.idx] !== null) return false;
                this.history.push({ from, to, card: col.pop() });
                this.freeCells[to.idx] = this.history[this.history.length - 1].card;
                return true;
            }

            if (to.type === 'tableau') {
                if (to.col === from.col) return false;
                // Stack move
                const stackSize = this.getMovableStackSize(from.col);
                const destEmpty = this.tableau[to.col].length === 0;
                // Find how many cards to move
                for (let n = Math.min(stackSize, this.maxMoveSize()); n >= 1; n--) {
                    const startIdx = col.length - n;
                    const bottomCard = col[startIdx];
                    if (destEmpty || this.canPlaceOnTableau(bottomCard, to.col)) {
                        // Check max move accounting for destination being empty
                        const emptyFree = this.freeCells.filter(c => c === null).length;
                        let emptyCols = this.tableau.filter(c => c.length === 0).length;
                        if (destEmpty) emptyCols--;
                        const maxMove = (emptyFree + 1) * Math.pow(2, Math.max(0, emptyCols));
                        if (n > maxMove) continue;

                        const cards = col.splice(startIdx, n);
                        this.history.push({ from, to, cards });
                        this.tableau[to.col].push(...cards);
                        return true;
                    }
                }
                return false;
            }
        }

        if (from.type === 'freecell') {
            card = this.freeCells[from.idx];
            if (!card) return false;

            if (to.type === 'foundation') {
                if (this.canPlaceOnFoundation(card)) {
                    this.history.push({ from, to, card });
                    this.foundations[card.suit].push(card);
                    this.freeCells[from.idx] = null;
                    return true;
                }
                return false;
            }
            if (to.type === 'tableau') {
                if (this.tableau[to.col].length === 0 || this.canPlaceOnTableau(card, to.col)) {
                    this.history.push({ from, to, card });
                    this.tableau[to.col].push(card);
                    this.freeCells[from.idx] = null;
                    return true;
                }
                return false;
            }
            if (to.type === 'freecell') {
                if (this.freeCells[to.idx] !== null) return false;
                this.history.push({ from, to, card });
                this.freeCells[to.idx] = card;
                this.freeCells[from.idx] = null;
                return true;
            }
        }

        return false;
    }

    autoFoundation() {
        let moved = true;
        while (moved) {
            moved = false;
            const minOpp = (card) => {
                const oppSuits = this.isRed(card)
                    ? ['clubs', 'spades'] : ['hearts', 'diamonds'];
                return Math.min(...oppSuits.map(s => this.foundations[s].length));
            };

            // From tableau
            for (let c = 0; c < 8; c++) {
                const col = this.tableau[c];
                if (col.length === 0) continue;
                const card = col[col.length - 1];
                if (this.canPlaceOnFoundation(card) && card.num <= minOpp(card) + 2) {
                    col.pop();
                    this.foundations[card.suit].push(card);
                    moved = true;
                }
            }
            // From free cells
            for (let i = 0; i < 4; i++) {
                const card = this.freeCells[i];
                if (!card) continue;
                if (this.canPlaceOnFoundation(card) && card.num <= minOpp(card) + 2) {
                    this.freeCells[i] = null;
                    this.foundations[card.suit].push(card);
                    moved = true;
                }
            }
        }
    }

    checkWin() {
        const total = this.suits.reduce((s, suit) => s + this.foundations[suit].length, 0);
        if (total === 52) {
            this.won = true;
            app.showSnackbar('You won! 🎉');
        }
    }

    undo() {
        if (this.history.length === 0) return;
        const move = this.history.pop();
        // Reverse the move
        if (move.cards) {
            const cards = this.tableau[move.to.col].splice(-move.cards.length);
            this.tableau[move.from.col].push(...cards);
        } else {
            const card = move.card;
            // Remove from destination
            if (move.to.type === 'foundation') this.foundations[card.suit].pop();
            else if (move.to.type === 'freecell') this.freeCells[move.to.idx] = null;
            else if (move.to.type === 'tableau') this.tableau[move.to.col].pop();
            // Put back to source
            if (move.from.type === 'freecell') this.freeCells[move.from.idx] = card;
            else if (move.from.type === 'tableau') this.tableau[move.from.col].push(card);
        }
        this.selected = null;
        this.render();
    }

    renderCard(card, small) {
        const sym = this.suitSymbols[card.suit];
        const color = this.suitColors[card.suit];
        return `<span style="color:${color};font-weight:700;">${card.value}${sym}</span>`;
    }

    render() {
        const cardW = 42, cardH = 58, overlap = 22;
        const sel = this.selected;

        let html = '<div style="font-family:\'Fredoka\',sans-serif;max-width:400px;margin:0 auto;">';

        // Top row: free cells + foundations
        html += '<div style="display:flex;gap:4px;margin-bottom:12px;justify-content:center;">';

        // Free cells
        for (let i = 0; i < 4; i++) {
            const card = this.freeCells[i];
            const isSel = sel && sel.type === 'freecell' && sel.idx === i;
            html += `<div data-action="freecell" data-idx="${i}" style="
                width:${cardW}px;height:${cardH}px;border-radius:8px;
                border:2px ${isSel ? 'solid #14b8a6' : 'dashed var(--shadow-soft)'};
                background:${card ? '#fff' : 'transparent'};
                display:flex;align-items:center;justify-content:center;cursor:pointer;
                font-size:13px;box-shadow:${isSel ? '0 0 8px #14b8a6' : 'none'};
            ">${card ? this.renderCard(card) : ''}</div>`;
        }

        html += '<div style="width:12px;"></div>';

        // Foundations
        for (const suit of this.suits) {
            const pile = this.foundations[suit];
            const top = pile.length > 0 ? pile[pile.length - 1] : null;
            html += `<div data-action="foundation" data-suit="${suit}" style="
                width:${cardW}px;height:${cardH}px;border-radius:8px;
                border:2px dashed var(--shadow-soft);
                background:${top ? '#fff' : 'rgba(34,197,94,0.1)'};
                display:flex;align-items:center;justify-content:center;cursor:pointer;
                font-size:13px;
            ">${top ? this.renderCard(top) : `<span style="color:#ccc;font-size:16px;">${this.suitSymbols[suit]}</span>`}</div>`;
        }
        html += '</div>';

        // Tableau
        html += '<div style="display:flex;gap:4px;justify-content:center;">';
        for (let c = 0; c < 8; c++) {
            const col = this.tableau[c];
            const colH = Math.max(cardH, cardH + (col.length - 1) * overlap);
            html += `<div data-action="tableau" data-col="${c}" style="
                width:${cardW}px;min-height:${colH}px;position:relative;cursor:pointer;
            ">`;
            if (col.length === 0) {
                html += `<div style="width:${cardW}px;height:${cardH}px;border-radius:8px;border:2px dashed var(--shadow-soft);"></div>`;
            }
            for (let r = 0; r < col.length; r++) {
                const card = col[r];
                const isSel = sel && sel.type === 'tableau' && sel.col === c && r >= col.length - this.getMovableStackSize(c);
                const isSelCard = sel && sel.type === 'tableau' && sel.col === c;
                html += `<div style="
                    position:absolute;top:${r * overlap}px;
                    width:${cardW}px;height:${cardH}px;border-radius:8px;
                    background:#fff;border:1.5px solid ${isSelCard && r >= col.length - this.getMovableStackSize(c) ? '#14b8a6' : '#ddd'};
                    display:flex;align-items:center;justify-content:center;
                    font-size:12px;z-index:${r};
                    box-shadow:${isSelCard && r >= col.length - this.getMovableStackSize(c) ? '0 0 6px #14b8a6' : '0 1px 3px rgba(0,0,0,0.1)'};
                ">${this.renderCard(card)}</div>`;
            }
            html += '</div>';
        }
        html += '</div></div>';

        if (this.won) {
            html += '<div style="text-align:center;margin-top:16px;font-family:\'Fredoka\',sans-serif;font-size:20px;color:var(--mint-deep);">You Won! 🎉</div>';
        }

        this.gameArea.innerHTML = html;
        this.statusArea.innerHTML = `<div style="font-family:'Fredoka',sans-serif;text-align:center;">Game #${this.gameNumber}</div>`;

        // Event listeners
        this.gameArea.querySelectorAll('[data-action="freecell"]').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.idx);
                if (this.freeCells[idx]) {
                    this.selectCard({ type: 'freecell', idx });
                } else if (this.selected) {
                    this.selectCard({ type: 'freecell', idx });
                }
            });
        });

        this.gameArea.querySelectorAll('[data-action="foundation"]').forEach(el => {
            el.addEventListener('click', () => {
                if (this.selected) {
                    this.selectCard({ type: 'foundation', suit: el.dataset.suit });
                }
            });
        });

        this.gameArea.querySelectorAll('[data-action="tableau"]').forEach(el => {
            el.addEventListener('click', () => {
                const col = parseInt(el.dataset.col);
                if (this.selected) {
                    this.selectCard({ type: 'tableau', col });
                } else if (this.tableau[col].length > 0) {
                    this.selectCard({ type: 'tableau', col });
                }
            });
        });

        this.controlsArea.innerHTML = `
            <button class="btn btn-outline" id="fc-undo">Undo</button>
            <button class="btn btn-primary" id="fc-new">New Game</button>
        `;
        document.getElementById('fc-undo').addEventListener('click', () => this.undo());
        document.getElementById('fc-new').addEventListener('click', () => {
            this.gameNumber = Math.floor(Math.random() * 32000) + 1;
            this.reset();
        });
    }

    cleanup() {
        this.gameArea.innerHTML = '';
        this.statusArea.innerHTML = '';
        this.controlsArea.innerHTML = '';
    }
}
