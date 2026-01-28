// Solitaire - Klondike solitaire
class Solitaire {
    constructor() {
        this.name = 'Solitaire';
        this.deck = [];
        this.tableau = [[], [], [], [], [], [], []];
        this.foundations = [[], [], [], []];
        this.stock = [];
        this.waste = [];
        this.selected = null;
        this.moves = 0;
        this.gameOver = false;
        this.won = false;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = [];
        
        for (const suit of suits) {
            for (let i = 0; i < values.length; i++) {
                this.deck.push({
                    suit,
                    value: values[i],
                    rank: i,
                    color: suit === '♥' || suit === '♦' ? 'red' : 'black',
                    faceUp: false
                });
            }
        }
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    reset() {
        this.createDeck();
        this.shuffle();
        
        this.tableau = [[], [], [], [], [], [], []];
        this.foundations = [[], [], [], []];
        this.stock = [];
        this.waste = [];
        this.selected = null;
        this.moves = 0;
        this.gameOver = false;
        this.won = false;

        // Deal to tableau
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = this.deck.pop();
                card.faceUp = (j === i);
                this.tableau[j].push(card);
            }
        }

        // Rest to stock
        this.stock = this.deck.splice(0);
        
        this.render();
    }

    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="solitaireReset">New Game</button>
        `;

        document.getElementById('solitaireReset')?.addEventListener('click', () => this.reset());

        this.statusArea.textContent = `Moves: ${this.moves}`;

        let html = '<div class="solitaire-board">';

        // Top row: Stock, Waste, and Foundations
        html += '<div class="solitaire-top">';
        
        // Stock
        html += `<div class="sol-pile stock" data-pile="stock">`;
        if (this.stock.length > 0) {
            html += '<div class="sol-card back">🂠</div>';
        } else {
            html += '<div class="sol-card empty">↺</div>';
        }
        html += '</div>';

        // Waste
        html += `<div class="sol-pile waste" data-pile="waste">`;
        if (this.waste.length > 0) {
            const card = this.waste[this.waste.length - 1];
            html += this.renderCard(card, 'waste', this.waste.length - 1);
        } else {
            html += '<div class="sol-card empty"></div>';
        }
        html += '</div>';

        html += '<div class="sol-spacer"></div>';

        // Foundations
        for (let i = 0; i < 4; i++) {
            html += `<div class="sol-pile foundation" data-pile="foundation" data-index="${i}">`;
            if (this.foundations[i].length > 0) {
                const card = this.foundations[i][this.foundations[i].length - 1];
                html += this.renderCard(card, 'foundation', i);
            } else {
                html += '<div class="sol-card empty">♠♥♦♣</div>';
            }
            html += '</div>';
        }

        html += '</div>';

        // Tableau
        html += '<div class="solitaire-tableau">';
        for (let i = 0; i < 7; i++) {
            html += `<div class="sol-pile tableau" data-pile="tableau" data-index="${i}">`;
            if (this.tableau[i].length === 0) {
                html += '<div class="sol-card empty">K</div>';
            } else {
                this.tableau[i].forEach((card, j) => {
                    html += this.renderCard(card, 'tableau', i, j);
                });
            }
            html += '</div>';
        }
        html += '</div>';

        if (this.won) {
            html += '<div class="sol-overlay">🎉 You Won!</div>';
        }

        html += '</div>';
        this.gameArea.innerHTML = html;

        if (!document.getElementById('solitaire-styles')) {
            const style = document.createElement('style');
            style.id = 'solitaire-styles';
            style.textContent = `
                .solitaire-board { 
                    max-width: 500px; margin: 0 auto; 
                    position: relative; padding: 10px;
                }
                .solitaire-top { 
                    display: flex; gap: 8px; margin-bottom: 16px;
                    align-items: flex-start;
                }
                .sol-spacer { width: 30px; }
                .solitaire-tableau { 
                    display: flex; gap: 8px; 
                    justify-content: center;
                }
                .sol-pile { 
                    position: relative; min-height: 90px;
                }
                .sol-pile.tableau { min-height: 200px; }
                .sol-card {
                    width: 55px; height: 80px;
                    border-radius: 6px; border: 1px solid #333;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px; cursor: pointer;
                    position: relative;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    transition: transform 0.1s;
                }
                .sol-card:hover { transform: translateY(-2px); }
                .sol-card.back { 
                    background: linear-gradient(135deg, #1e3a5f, #0d253f); 
                    color: #4a90d9; font-size: 40px;
                }
                .sol-card.face { background: white; }
                .sol-card.face.red { color: #dc2626; }
                .sol-card.face.black { color: #1f2937; }
                .sol-card.empty { 
                    background: rgba(255,255,255,0.1); 
                    border: 2px dashed rgba(255,255,255,0.3);
                    color: rgba(255,255,255,0.3); font-size: 10px;
                }
                .sol-card.selected { box-shadow: 0 0 10px #ffd700; }
                .tableau .sol-card { position: absolute; left: 0; }
                .sol-card-content { text-align: center; }
                .sol-card-corner { position: absolute; font-size: 10px; line-height: 1; }
                .sol-card-corner.tl { top: 3px; left: 4px; }
                .sol-card-corner.br { bottom: 3px; right: 4px; transform: rotate(180deg); }
                .sol-card-suit { font-size: 24px; }
                .sol-overlay {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.9); color: gold; padding: 30px 50px;
                    border-radius: 10px; font-size: 28px; font-weight: bold;
                }
            `;
            document.head.appendChild(style);
        }

        this.bindEvents();
    }

    renderCard(card, pile, index, stackIndex = 0) {
        if (!card.faceUp) {
            const top = pile === 'tableau' ? stackIndex * 20 : 0;
            return `<div class="sol-card back" style="top: ${top}px;" data-pile="${pile}" data-index="${index}" data-stack="${stackIndex}">🂠</div>`;
        }

        const isSelected = this.selected && 
            this.selected.pile === pile && 
            this.selected.index === index &&
            (pile !== 'tableau' || this.selected.stackIndex === stackIndex);

        const top = pile === 'tableau' ? stackIndex * 20 : 0;
        
        return `
            <div class="sol-card face ${card.color} ${isSelected ? 'selected' : ''}" 
                 style="top: ${top}px; z-index: ${stackIndex};"
                 data-pile="${pile}" data-index="${index}" data-stack="${stackIndex}">
                <span class="sol-card-corner tl">${card.value}<br>${card.suit}</span>
                <span class="sol-card-suit">${card.suit}</span>
                <span class="sol-card-corner br">${card.value}<br>${card.suit}</span>
            </div>
        `;
    }

    bindEvents() {
        // Stock click
        this.gameArea.querySelector('.stock')?.addEventListener('click', () => {
            if (this.stock.length > 0) {
                const card = this.stock.pop();
                card.faceUp = true;
                this.waste.push(card);
            } else {
                this.stock = this.waste.reverse();
                this.stock.forEach(c => c.faceUp = false);
                this.waste = [];
            }
            this.selected = null;
            this.render();
        });

        // Card clicks
        this.gameArea.querySelectorAll('.sol-card.face').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const pile = el.dataset.pile;
                const index = parseInt(el.dataset.index);
                const stackIndex = parseInt(el.dataset.stack || 0);
                this.handleCardClick(pile, index, stackIndex);
            });
        });

        // Empty pile clicks
        this.gameArea.querySelectorAll('.sol-card.empty').forEach(el => {
            const parent = el.closest('.sol-pile');
            if (parent) {
                el.addEventListener('click', () => {
                    const pile = parent.dataset.pile;
                    const index = parseInt(parent.dataset.index || 0);
                    this.handleEmptyClick(pile, index);
                });
            }
        });

        // Double-click to auto-move to foundation
        this.gameArea.querySelectorAll('.sol-card.face').forEach(el => {
            el.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                const pile = el.dataset.pile;
                const index = parseInt(el.dataset.index);
                const stackIndex = parseInt(el.dataset.stack || 0);
                this.autoMoveToFoundation(pile, index, stackIndex);
            });
        });
    }

    handleCardClick(pile, index, stackIndex) {
        if (this.selected) {
            if (this.selected.pile === pile && this.selected.index === index) {
                this.selected = null;
            } else if (pile === 'tableau') {
                this.tryMove(pile, index);
            } else if (pile === 'foundation') {
                this.tryMove(pile, index);
            }
        } else {
            if (pile === 'waste' && this.waste.length > 0) {
                this.selected = { pile, index: 0, stackIndex: 0, cards: [this.waste[this.waste.length - 1]] };
            } else if (pile === 'tableau') {
                const col = this.tableau[index];
                const cards = col.slice(stackIndex).filter(c => c.faceUp);
                if (cards.length > 0) {
                    this.selected = { pile, index, stackIndex, cards };
                }
            } else if (pile === 'foundation') {
                const foundation = this.foundations[index];
                if (foundation.length > 0) {
                    this.selected = { pile, index, stackIndex: 0, cards: [foundation[foundation.length - 1]] };
                }
            }
        }
        this.render();
    }

    handleEmptyClick(pile, index) {
        if (!this.selected) return;
        this.tryMove(pile, index);
    }

    tryMove(toPile, toIndex) {
        if (!this.selected) return;

        const { pile: fromPile, index: fromIndex, stackIndex, cards } = this.selected;
        const card = cards[0];

        let valid = false;

        if (toPile === 'tableau') {
            const targetCol = this.tableau[toIndex];
            if (targetCol.length === 0) {
                valid = card.value === 'K';
            } else {
                const topCard = targetCol[targetCol.length - 1];
                valid = topCard.faceUp && 
                        topCard.color !== card.color && 
                        topCard.rank === card.rank + 1;
            }

            if (valid) {
                // Remove cards from source
                if (fromPile === 'waste') {
                    this.waste.pop();
                } else if (fromPile === 'tableau') {
                    this.tableau[fromIndex].splice(stackIndex);
                    this.flipTopCard(fromIndex);
                } else if (fromPile === 'foundation') {
                    this.foundations[fromIndex].pop();
                }

                // Add to target
                cards.forEach(c => this.tableau[toIndex].push(c));
                this.moves++;
            }
        } else if (toPile === 'foundation' && cards.length === 1) {
            const foundation = this.foundations[toIndex];
            if (foundation.length === 0) {
                valid = card.value === 'A';
            } else {
                const topCard = foundation[foundation.length - 1];
                valid = topCard.suit === card.suit && topCard.rank === card.rank - 1;
            }

            if (valid) {
                if (fromPile === 'waste') {
                    this.waste.pop();
                } else if (fromPile === 'tableau') {
                    this.tableau[fromIndex].pop();
                    this.flipTopCard(fromIndex);
                }
                foundation.push(card);
                this.moves++;
            }
        }

        this.selected = null;
        this.checkWin();
        this.render();
    }

    autoMoveToFoundation(pile, index, stackIndex) {
        let card;
        if (pile === 'waste') {
            card = this.waste[this.waste.length - 1];
        } else if (pile === 'tableau') {
            const col = this.tableau[index];
            if (stackIndex !== col.length - 1) return;
            card = col[col.length - 1];
        } else {
            return;
        }

        if (!card) return;

        for (let i = 0; i < 4; i++) {
            const foundation = this.foundations[i];
            let valid = false;
            
            if (foundation.length === 0) {
                valid = card.value === 'A';
            } else {
                const top = foundation[foundation.length - 1];
                valid = top.suit === card.suit && top.rank === card.rank - 1;
            }

            if (valid) {
                if (pile === 'waste') {
                    this.waste.pop();
                } else {
                    this.tableau[index].pop();
                    this.flipTopCard(index);
                }
                foundation.push(card);
                this.moves++;
                this.selected = null;
                this.checkWin();
                this.render();
                return;
            }
        }
    }

    flipTopCard(colIndex) {
        const col = this.tableau[colIndex];
        if (col.length > 0 && !col[col.length - 1].faceUp) {
            col[col.length - 1].faceUp = true;
        }
    }

    checkWin() {
        const total = this.foundations.reduce((sum, f) => sum + f.length, 0);
        if (total === 52) {
            this.won = true;
            this.gameOver = true;
            app.showSnackbar(`🎉 You won in ${this.moves} moves!`);
        }
    }

    cleanup() {}
}
