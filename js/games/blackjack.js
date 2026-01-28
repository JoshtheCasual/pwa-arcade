// Blackjack - Card game vs dealer
class Blackjack {
    constructor() {
        this.name = 'Blackjack';
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.playerChips = parseInt(localStorage.getItem('blackjack-chips') || '1000');
        this.bet = 0;
        this.phase = 'betting'; // betting, playing, dealer, ended
        this.result = '';
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
        
        // Use 6 decks like casinos
        for (let d = 0; d < 6; d++) {
            for (const suit of suits) {
                for (let i = 0; i < values.length; i++) {
                    this.deck.push({
                        suit,
                        value: values[i],
                        numValue: i === 0 ? 11 : Math.min(i + 1, 10),
                        color: suit === '♥' || suit === '♦' ? 'red' : 'black'
                    });
                }
            }
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    reset() {
        if (this.deck.length < 52) {
            this.createDeck();
        }
        this.playerHand = [];
        this.dealerHand = [];
        this.bet = 0;
        this.phase = 'betting';
        this.result = '';
        this.render();
    }

    placeBet(amount) {
        if (this.phase !== 'betting') return;
        if (amount > this.playerChips) {
            app.showSnackbar('Not enough chips!');
            return;
        }
        this.bet = amount;
        this.deal();
    }

    deal() {
        this.playerHand = [this.drawCard(), this.drawCard()];
        this.dealerHand = [this.drawCard(), this.drawCard()];
        this.dealerHand[1].hidden = true;
        this.phase = 'playing';

        // Check for blackjack
        if (this.calculateHand(this.playerHand) === 21) {
            this.stand();
        } else {
            this.render();
        }
    }

    drawCard() {
        if (this.deck.length === 0) this.createDeck();
        return this.deck.pop();
    }

    calculateHand(hand) {
        let total = 0;
        let aces = 0;
        
        for (const card of hand) {
            if (card.hidden) continue;
            total += card.numValue;
            if (card.value === 'A') aces++;
        }
        
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        
        return total;
    }

    hit() {
        if (this.phase !== 'playing') return;
        
        this.playerHand.push(this.drawCard());
        const total = this.calculateHand(this.playerHand);
        
        if (total > 21) {
            this.endGame('bust');
        } else if (total === 21) {
            this.stand();
        } else {
            this.render();
        }
    }

    stand() {
        if (this.phase !== 'playing') return;
        
        this.phase = 'dealer';
        this.dealerHand[1].hidden = false;
        this.render();
        
        setTimeout(() => this.dealerPlay(), 500);
    }

    dealerPlay() {
        const dealerTotal = this.calculateHand(this.dealerHand);
        
        if (dealerTotal < 17) {
            this.dealerHand.push(this.drawCard());
            this.render();
            setTimeout(() => this.dealerPlay(), 500);
        } else {
            this.determineWinner();
        }
    }

    doubleDown() {
        if (this.phase !== 'playing' || this.playerHand.length !== 2) return;
        if (this.bet > this.playerChips - this.bet) {
            app.showSnackbar('Not enough chips to double!');
            return;
        }
        
        this.bet *= 2;
        this.playerHand.push(this.drawCard());
        
        if (this.calculateHand(this.playerHand) > 21) {
            this.endGame('bust');
        } else {
            this.stand();
        }
    }

    determineWinner() {
        const playerTotal = this.calculateHand(this.playerHand);
        const dealerTotal = this.calculateHand(this.dealerHand);
        const playerBJ = playerTotal === 21 && this.playerHand.length === 2;
        const dealerBJ = dealerTotal === 21 && this.dealerHand.length === 2;
        
        if (dealerTotal > 21) {
            this.endGame('dealer_bust');
        } else if (playerBJ && !dealerBJ) {
            this.endGame('blackjack');
        } else if (dealerBJ && !playerBJ) {
            this.endGame('dealer_blackjack');
        } else if (playerTotal > dealerTotal) {
            this.endGame('win');
        } else if (dealerTotal > playerTotal) {
            this.endGame('lose');
        } else {
            this.endGame('push');
        }
    }

    endGame(result) {
        this.phase = 'ended';
        this.dealerHand.forEach(c => c.hidden = false);
        
        switch (result) {
            case 'blackjack':
                this.result = '🎰 Blackjack! You win!';
                this.playerChips += Math.floor(this.bet * 1.5);
                break;
            case 'win':
            case 'dealer_bust':
                this.result = '🎉 You win!';
                this.playerChips += this.bet;
                break;
            case 'lose':
            case 'dealer_blackjack':
            case 'bust':
                this.result = result === 'bust' ? '💥 Bust! You lose.' : '😢 Dealer wins.';
                this.playerChips -= this.bet;
                break;
            case 'push':
                this.result = '🤝 Push - bet returned.';
                break;
        }
        
        localStorage.setItem('blackjack-chips', this.playerChips.toString());
        this.render();
    }

    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-secondary" id="bjResetChips">Reset Chips</button>
        `;
        
        document.getElementById('bjResetChips')?.addEventListener('click', () => {
            this.playerChips = 1000;
            localStorage.setItem('blackjack-chips', '1000');
            this.reset();
        });

        this.statusArea.textContent = `Chips: $${this.playerChips}`;

        let html = '<div class="blackjack-table">';

        // Dealer area
        html += '<div class="bj-area dealer-area">';
        html += '<div class="bj-label">Dealer';
        if (this.phase !== 'betting') {
            const dealerTotal = this.calculateHand(this.dealerHand);
            html += this.dealerHand.some(c => c.hidden) ? '' : ` (${dealerTotal})`;
        }
        html += '</div>';
        html += '<div class="bj-hand">';
        this.dealerHand.forEach(card => {
            html += this.renderCard(card);
        });
        html += '</div></div>';

        // Result
        if (this.result) {
            html += `<div class="bj-result">${this.result}</div>`;
        }

        // Player area
        html += '<div class="bj-area player-area">';
        html += '<div class="bj-hand">';
        this.playerHand.forEach(card => {
            html += this.renderCard(card);
        });
        html += '</div>';
        html += '<div class="bj-label">You';
        if (this.phase !== 'betting') {
            html += ` (${this.calculateHand(this.playerHand)})`;
        }
        html += '</div></div>';

        // Controls
        html += '<div class="bj-controls">';
        if (this.phase === 'betting') {
            html += `
                <div class="bj-bet-buttons">
                    <button class="bj-chip" data-bet="10">$10</button>
                    <button class="bj-chip" data-bet="25">$25</button>
                    <button class="bj-chip" data-bet="50">$50</button>
                    <button class="bj-chip" data-bet="100">$100</button>
                </div>
            `;
        } else if (this.phase === 'playing') {
            html += `
                <button class="bj-btn" id="bjHit">Hit</button>
                <button class="bj-btn" id="bjStand">Stand</button>
                <button class="bj-btn" id="bjDouble">Double</button>
            `;
        } else if (this.phase === 'ended') {
            html += `<button class="bj-btn" id="bjNewHand">New Hand</button>`;
        }
        html += '</div>';

        if (this.bet > 0) {
            html += `<div class="bj-bet">Bet: $${this.bet}</div>`;
        }

        html += '</div>';
        this.gameArea.innerHTML = html;

        if (!document.getElementById('blackjack-styles')) {
            const style = document.createElement('style');
            style.id = 'blackjack-styles';
            style.textContent = `
                .blackjack-table {
                    background: linear-gradient(135deg, #1a472a, #0d2818);
                    border-radius: 20px;
                    padding: 20px;
                    min-height: 400px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }
                .bj-area { text-align: center; }
                .bj-label { color: #90EE90; font-size: 14px; margin: 8px 0; }
                .bj-hand { display: flex; gap: 8px; justify-content: center; min-height: 100px; }
                .bj-card {
                    width: 60px; height: 85px;
                    border-radius: 6px; border: 1px solid #333;
                    display: flex; flex-direction: column;
                    justify-content: space-between; padding: 4px;
                    font-weight: bold; background: white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }
                .bj-card.red { color: #dc2626; }
                .bj-card.black { color: #1f2937; }
                .bj-card.hidden {
                    background: linear-gradient(135deg, #1e3a5f, #0d253f);
                    color: #4a90d9;
                    justify-content: center;
                    font-size: 40px;
                }
                .bj-card-top, .bj-card-bottom { font-size: 12px; }
                .bj-card-bottom { text-align: right; transform: rotate(180deg); }
                .bj-card-center { font-size: 24px; text-align: center; }
                .bj-result {
                    font-size: 24px; font-weight: bold;
                    color: gold; text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    padding: 10px 20px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                }
                .bj-controls { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
                .bj-bet-buttons { display: flex; gap: 10px; }
                .bj-chip {
                    width: 55px; height: 55px; border-radius: 50%;
                    border: 3px dashed rgba(255,255,255,0.5);
                    background: linear-gradient(145deg, #c41e3a, #8b0000);
                    color: white; font-weight: bold; font-size: 12px;
                    cursor: pointer; transition: transform 0.2s;
                }
                .bj-chip:hover { transform: scale(1.1); }
                .bj-btn {
                    padding: 12px 24px; border: none; border-radius: 8px;
                    background: linear-gradient(145deg, #ffd700, #daa520);
                    color: #1a1a1a; font-weight: bold; font-size: 16px;
                    cursor: pointer; transition: transform 0.2s;
                }
                .bj-btn:hover { transform: scale(1.05); }
                .bj-bet { color: gold; font-size: 18px; font-weight: bold; }
            `;
            document.head.appendChild(style);
        }

        // Bind events
        this.gameArea.querySelectorAll('.bj-chip').forEach(btn => {
            btn.addEventListener('click', () => this.placeBet(parseInt(btn.dataset.bet)));
        });
        document.getElementById('bjHit')?.addEventListener('click', () => this.hit());
        document.getElementById('bjStand')?.addEventListener('click', () => this.stand());
        document.getElementById('bjDouble')?.addEventListener('click', () => this.doubleDown());
        document.getElementById('bjNewHand')?.addEventListener('click', () => this.reset());
    }

    renderCard(card) {
        if (card.hidden) {
            return '<div class="bj-card hidden">🂠</div>';
        }
        return `
            <div class="bj-card ${card.color}">
                <div class="bj-card-top">${card.value}${card.suit}</div>
                <div class="bj-card-center">${card.suit}</div>
                <div class="bj-card-bottom">${card.value}${card.suit}</div>
            </div>
        `;
    }

    cleanup() {}
}
