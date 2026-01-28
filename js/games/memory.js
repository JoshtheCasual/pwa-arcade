// Memory Match - with solo and 2-player competitive modes
class MemoryGame {
    constructor() {
        this.name = 'Memory Match';
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.isLocked = false;
        this.gridSize = 4;
        this.timer = null;
        this.seconds = 0;
        this.mode = 'solo'; // 'solo' or 'pvp'
        this.currentPlayer = 1;
        this.scores = { 1: 0, 2: 0 };
        this.moves = 0;
    }
    
    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }
    
    reset() {
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.isLocked = false;
        this.seconds = 0;
        this.moves = 0;
        this.currentPlayer = 1;
        this.scores = { 1: 0, 2: 0 };
        
        if (this.timer) clearInterval(this.timer);
        
        if (this.mode === 'solo') {
            this.timer = setInterval(() => {
                this.seconds++;
                this.updateStatus();
            }, 1000);
        }
        
        this.generateCards();
        this.render();
    }
    
    generateCards() {
        const emojis = [
            '🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎰', '🎳',
            '🎸', '🎹', '🎺', '🎻', '🌟', '🌙', '☀️', '🌈',
            '🔥', '💎', '🍀', '🌸', '🦋', '🐬', '🦜', '🦊',
            '🐼', '🦁', '🐸', '🦉', '🍕', '🍦', '🧁', '🍩'
        ];
        
        const cols = 4;
        const rows = this.gridSize;
        const pairs = (cols * rows) / 2;
        
        const selected = emojis.sort(() => Math.random() - 0.5).slice(0, pairs);
        
        this.cards = [...selected, ...selected]
            .sort(() => Math.random() - 0.5)
            .map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
    }
    
    render() {
        // Controls
        this.controlsArea.innerHTML = `
            <div class="mode-selector">
                <button class="mode-btn ${this.mode === 'solo' ? 'active' : ''}" data-mode="solo">🎯 Solo</button>
                <button class="mode-btn ${this.mode === 'pvp' ? 'active' : ''}" data-mode="pvp">👥 2 Players</button>
            </div>
            <div class="mode-selector" style="margin-top: 12px;">
                <button class="mode-btn ${this.gridSize === 4 ? 'active' : ''}" data-size="4">4×4</button>
                <button class="mode-btn ${this.gridSize === 5 ? 'active' : ''}" data-size="5">4×5</button>
                <button class="mode-btn ${this.gridSize === 6 ? 'active' : ''}" data-size="6">4×6</button>
            </div>
            <button class="btn btn-primary" style="margin-top: 12px;" id="memoryReset">New Game</button>
        `;
        
        this.controlsArea.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.mode = btn.dataset.mode;
                this.reset();
            });
        });
        
        this.controlsArea.querySelectorAll('[data-size]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.gridSize = parseInt(btn.dataset.size);
                this.reset();
            });
        });
        
        document.getElementById('memoryReset')?.addEventListener('click', () => this.reset());
        
        // Status
        this.updateStatus();
        
        // Player indicator for PvP
        let html = '';
        
        if (this.mode === 'pvp') {
            html += `
                <div class="player-indicator">
                    <div class="player-badge ${this.currentPlayer === 1 ? 'active' : ''}" style="border-color: var(--pink);">
                        <div class="player-avatar" style="background: var(--pink);">👤</div>
                        <span>P1: ${this.scores[1]}</span>
                    </div>
                    <div class="player-badge ${this.currentPlayer === 2 ? 'active' : ''}" style="border-color: var(--sky);">
                        <div class="player-avatar" style="background: var(--sky);">👤</div>
                        <span>P2: ${this.scores[2]}</span>
                    </div>
                </div>
            `;
        }
        
        // Board
        html += `<div class="memory-board" style="grid-template-columns: repeat(4, 1fr); max-width: 300px;">`;
        
        this.cards.forEach((card, index) => {
            const classes = ['memory-card'];
            if (card.flipped || card.matched) classes.push('flipped');
            if (card.matched) classes.push('matched');
            
            html += `
                <div class="${classes.join(' ')}" data-index="${index}">
                    <div class="memory-card-inner">
                        <div class="memory-card-back"></div>
                        <div class="memory-card-front">${card.emoji}</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Stats for solo mode
        if (this.mode === 'solo') {
            html += `
                <div class="memory-stats">
                    <div class="memory-stat">
                        <span class="material-icons-round">touch_app</span>
                        <span>${this.moves}</span>
                    </div>
                    <div class="memory-stat">
                        <span class="material-icons-round">timer</span>
                        <span>${this.formatTime(this.seconds)}</span>
                    </div>
                    <div class="memory-stat">
                        <span class="material-icons-round">favorite</span>
                        <span>${this.matchedPairs}/${this.cards.length / 2}</span>
                    </div>
                </div>
            `;
        }
        
        this.gameArea.innerHTML = html;
        
        this.gameArea.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.index);
                this.flipCard(index);
            });
        });
    }
    
    flipCard(index) {
        const card = this.cards[index];
        if (this.isLocked || card.flipped || card.matched) return;
        
        card.flipped = true;
        this.flippedCards.push(card);
        this.render();
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.isLocked = true;
            
            const [card1, card2] = this.flippedCards;
            
            if (card1.emoji === card2.emoji) {
                // Match!
                card1.matched = true;
                card2.matched = true;
                this.matchedPairs++;
                
                if (this.mode === 'pvp') {
                    this.scores[this.currentPlayer]++;
                }
                
                this.flippedCards = [];
                this.isLocked = false;
                this.render();
                
                if (this.matchedPairs === this.cards.length / 2) {
                    this.gameOver();
                }
            } else {
                // No match
                setTimeout(() => {
                    card1.flipped = false;
                    card2.flipped = false;
                    this.flippedCards = [];
                    this.isLocked = false;
                    
                    if (this.mode === 'pvp') {
                        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                    }
                    
                    this.render();
                }, 1000);
            }
        }
    }
    
    gameOver() {
        if (this.timer) clearInterval(this.timer);
        
        if (this.mode === 'solo') {
            const rating = this.getRating();
            this.statusArea.innerHTML = `🎉 Complete! ${rating}`;
            app.showSnackbar(`You did it! ${this.moves} moves, ${this.formatTime(this.seconds)}`);
        } else {
            const winner = this.scores[1] > this.scores[2] ? 'Player 1' : 
                          this.scores[2] > this.scores[1] ? 'Player 2' : 'Tie';
            
            if (winner === 'Tie') {
                this.statusArea.textContent = "🤝 It's a tie!";
                app.showSnackbar("It's a tie!");
            } else {
                this.statusArea.textContent = `🎉 ${winner} wins!`;
                app.showSnackbar(`${winner} wins! ${this.scores[1]} - ${this.scores[2]}`);
            }
        }
    }
    
    getRating() {
        const pairs = this.cards.length / 2;
        const ratio = this.moves / pairs;
        
        if (ratio <= 1.5) return '⭐⭐⭐';
        if (ratio <= 2) return '⭐⭐';
        if (ratio <= 3) return '⭐';
        return '';
    }
    
    formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
    
    updateStatus() {
        if (this.matchedPairs === this.cards.length / 2) return;
        
        if (this.mode === 'solo') {
            this.statusArea.textContent = 'Find all the pairs!';
        } else {
            this.statusArea.textContent = `Player ${this.currentPlayer}'s turn`;
        }
    }
    
    cleanup() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}
