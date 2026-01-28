// Solitaire - Klondike solitaire
class Solitaire {
    constructor() {
        this.name = 'Solitaire';
        this.suits = ['♠', '♥', '♦', '♣'];
        this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = [];
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.selected = null;
        this.moves = 0;
    }
    
    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }
    
    createDeck() {
        this.deck = [];
        for (const suit of this.suits) {
            for (let i = 0; i < this.values.length; i++) {
                this.deck.push({
                    suit,
                    value: this.values[i],
                    rank: i,
                    faceUp: false,
                    isRed: suit === '♥' || suit === '♦'
                });
            }
        }
        // Shuffle
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    reset() {
        this.createDeck();
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.selected = null;
        this.moves = 0;
        
        // Deal to tableau
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = this.deck.pop();
                if (j === i) card.faceUp = true;
                this.tableau[j].push(card);
            }
        }
        
        // Rest goes to stock
        this.stock = this.deck.reverse();
        this.deck = [];
        
        this.render();
    }
    
    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="solNewGame">New Game</button>
            <div style="margin-top: 12px; text-align: center; font-size: 14px; color: var(--text-secondary);">
                Moves: ${this.moves}
            </div>
        `;
        
        document.getElementById('solNewGame')?.addEventListener('click', () => this.reset());
        
        this.statusArea.textContent = this.checkWin() ? '🎉 You won!' : 'Move all cards to foundations';
        
        let html = `<div class="sol-container">
            <div class="sol-top">
                <div class="sol-stock-waste">
                    <div class="sol-pile stock" id="solStock">
                        ${this.stock.length > 0 ? '<div class="sol-card back">🂠</div>' : '<div class="sol-empty">○</div>'}
                    </div>
                    <div class="sol-pile waste" id="solWaste">
                        ${this.waste.length > 0 ? this.renderCard(this.waste[this.waste.length - 1], true) : '<div class="sol-empty"></div>'}
                    </div>
                </div>
                <div class="sol-foundations">
                    ${this.foundations.map((f, i) => `
                        <div class="sol-pile foundation" data-foundation="${i}">
                            ${f.length > 0 ? this.renderCard(f[f.length - 1], true) : `<div class="sol-empty">${this.suits[i]}</div>`}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="sol-tableau">
                ${this.tableau.map((pile, i) => `
                    <div class="sol-column" data-column="${i}">
                        ${pile.length === 0 ? '<div class="sol-empty-column" data-column="' + i + '">⬜</div>' : ''}
                        ${pile.map((card, j) => this.renderCard(card, card.faceUp, j, i)).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
        <style>
            .sol-container {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 8px;
                max-width: 360px;
                margin: 0 auto;
            }
            .sol-top {
                display: flex;
                justify-content: space-between;
            }
            .sol-stock-waste {
                display: flex;
                gap: 8px;
            }
            .sol-foundations {
                display: flex;
                gap: 4px;
            }
            .sol-pile {
                width: 45px;
                height: 63px;
            }
            .sol-empty {
                width: 45px;
                height: 63px;
                border: 2px dashed var(--text-secondary);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-secondary);
                font-size: 20px;
                opacity: 0.5;
            }
            .sol-tableau {
                display: flex;
                gap: 4px;
                justify-content: center;
            }
            .sol-column {
                width: 45px;
                min-height: 63px;
                position: relative;
            }
            .sol-card {
                width: 45px;
                height: 63px;
                background: white;
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                user-select: none;
                position: absolute;
                left: 0;
            }
            .sol-card.back {
                background: linear-gradient(145deg, #1e3a8a, #1e40af);
                color: white;
                font-size: 28px;
            }
            .sol-card.red { color: #dc2626; }
            .sol-card.black { color: #1f2937; }
            .sol-card.selected {
                box-shadow: 0 0 0 3px #3b82f6;
            }
            .sol-card.in-pile {
                position: static;
            }
            .sol-empty-column {
                width: 45px;
                height: 63px;
                border: 2px dashed var(--text-secondary);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.3;
                cursor: pointer;
            }
            .card-value { font-size: 14px; }
            .card-suit { font-size: 16px; margin-top: -2px; }
        </style>`;
        
        this.gameArea.innerHTML = html;
        
        // Event listeners
        document.getElementById('solStock')?.addEventListener('click', () => this.drawFromStock());
        document.getElementById('solWaste')?.addEventListener('click', () => this.selectWaste());
        
        document.querySelectorAll('.foundation').forEach(f => {
            f.addEventListener('click', () => {
                const idx = parseInt(f.dataset.foundation);
                this.handleFoundationClick(idx);
            });
        });
        
        document.querySelectorAll('.sol-column').forEach(col => {
            col.addEventListener('click', (e) => {
                const colIdx = parseInt(col.dataset.column);
                const cardEl = e.target.closest('.sol-card');
                if (cardEl) {
                    const cardIdx = parseInt(cardEl.dataset.cardidx);
                    this.handleTableauClick(colIdx, cardIdx);
                } else if (e.target.classList.contains('sol-empty-column')) {
                    this.handleTableauClick(colIdx, -1);
                }
            });
        });
    }
    
    renderCard(card, faceUp, stackIndex = 0, columnIndex = -1) {
        if (!faceUp) {
            return `<div class="sol-card back" style="top: ${stackIndex * 18}px;" data-cardidx="${stackIndex}">🂠</div>`;
        }
        const colorClass = card.isRed ? 'red' : 'black';
        const selectedClass = this.selected && 
            this.selected.source === 'tableau' && 
            this.selected.column === columnIndex && 
            stackIndex >= this.selected.cardIndex ? 'selected' : '';
        const wasteSelected = this.selected?.source === 'waste' && columnIndex === -1 ? 'selected' : '';
        
        return `<div class="sol-card ${colorClass} ${selectedClass} ${wasteSelected} ${columnIndex === -1 ? 'in-pile' : ''}" 
                     style="top: ${stackIndex * 18}px;" 
                     data-cardidx="${stackIndex}">
            <span class="card-value">${card.value}</span>
            <span class="card-suit">${card.suit}</span>
        </div>`;
    }
    
    drawFromStock() {
        if (this.stock.length === 0) {
            this.stock = this.waste.reverse();
            this.waste = [];
            this.stock.forEach(c => c.faceUp = false);
        } else {
            const card = this.stock.pop();
            card.faceUp = true;
            this.waste.push(card);
        }
        this.selected = null;
        this.render();
    }
    
    selectWaste() {
        if (this.waste.length === 0) return;
        
        if (this.selected?.source === 'waste') {
            // Try auto-move to foundation
            const card = this.waste[this.waste.length - 1];
            for (let i = 0; i < 4; i++) {
                if (this.canMoveToFoundation(card, i)) {
                    this.waste.pop();
                    this.foundations[i].push(card);
                    this.moves++;
                    this.selected = null;
                    this.render();
                    this.checkWin();
                    return;
                }
            }
            this.selected = null;
        } else {
            this.selected = {source: 'waste'};
        }
        this.render();
    }
    
    handleFoundationClick(foundationIdx) {
        if (!this.selected) return;
        
        let card;
        if (this.selected.source === 'waste') {
            card = this.waste[this.waste.length - 1];
            if (this.canMoveToFoundation(card, foundationIdx)) {
                this.waste.pop();
                this.foundations[foundationIdx].push(card);
                this.moves++;
            }
        } else if (this.selected.source === 'tableau') {
            const pile = this.tableau[this.selected.column];
            if (this.selected.cardIndex === pile.length - 1) {
                card = pile[pile.length - 1];
                if (this.canMoveToFoundation(card, foundationIdx)) {
                    pile.pop();
                    this.foundations[foundationIdx].push(card);
                    this.moves++;
                    if (pile.length > 0) pile[pile.length - 1].faceUp = true;
                }
            }
        }
        
        this.selected = null;
        this.render();
        this.checkWin();
    }
    
    handleTableauClick(colIdx, cardIdx) {
        const pile = this.tableau[colIdx];
        
        if (cardIdx === -1 && pile.length === 0) {
            // Empty column - can only place King
            if (this.selected) {
                let cards;
                if (this.selected.source === 'waste') {
                    const card = this.waste[this.waste.length - 1];
                    if (card.value === 'K') {
                        this.waste.pop();
                        pile.push(card);
                        this.moves++;
                    }
                } else if (this.selected.source === 'tableau') {
                    const srcPile = this.tableau[this.selected.column];
                    const card = srcPile[this.selected.cardIndex];
                    if (card.value === 'K') {
                        cards = srcPile.splice(this.selected.cardIndex);
                        pile.push(...cards);
                        this.moves++;
                        if (srcPile.length > 0) srcPile[srcPile.length - 1].faceUp = true;
                    }
                }
                this.selected = null;
                this.render();
            }
            return;
        }
        
        const card = pile[cardIdx];
        if (!card) return;
        
        if (!card.faceUp) {
            // Can't select face-down cards
            return;
        }
        
        if (this.selected) {
            // Try to move
            const targetCard = pile[pile.length - 1];
            let srcCards;
            
            if (this.selected.source === 'waste') {
                const srcCard = this.waste[this.waste.length - 1];
                if (this.canStack(srcCard, targetCard)) {
                    this.waste.pop();
                    pile.push(srcCard);
                    this.moves++;
                }
            } else if (this.selected.source === 'tableau' && this.selected.column !== colIdx) {
                const srcPile = this.tableau[this.selected.column];
                const srcCard = srcPile[this.selected.cardIndex];
                if (this.canStack(srcCard, targetCard)) {
                    srcCards = srcPile.splice(this.selected.cardIndex);
                    pile.push(...srcCards);
                    this.moves++;
                    if (srcPile.length > 0) srcPile[srcPile.length - 1].faceUp = true;
                }
            }
            
            this.selected = null;
        } else {
            // Select this card
            this.selected = {source: 'tableau', column: colIdx, cardIndex: cardIdx};
        }
        
        this.render();
    }
    
    canMoveToFoundation(card, foundationIdx) {
        const foundation = this.foundations[foundationIdx];
        if (foundation.length === 0) {
            return card.value === 'A' && card.suit === this.suits[foundationIdx];
        }
        const top = foundation[foundation.length - 1];
        return card.suit === top.suit && card.rank === top.rank + 1;
    }
    
    canStack(card, targetCard) {
        if (!targetCard) return card.value === 'K';
        return card.isRed !== targetCard.isRed && card.rank === targetCard.rank - 1;
    }
    
    checkWin() {
        const won = this.foundations.every(f => f.length === 13);
        if (won) {
            app.showSnackbar('🎉 Congratulations! You won!');
        }
        return won;
    }
    
    cleanup() {}
}
