// Blackjack - Card game
class Blackjack {
    constructor() {
        this.name = 'Blackjack';
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.playerScore = 0;
        this.dealerScore = 0;
        this.chips = parseInt(localStorage.getItem('blackjack-chips') || '1000');
        this.bet = 50;
        this.gamePhase = 'betting'; // betting, playing, dealerTurn, ended
        this.suits = ['♠', '♥', '♦', '♣'];
        this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    }
    
    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.render();
    }
    
    createDeck() {
        this.deck = [];
        for (const suit of this.suits) {
            for (const value of this.values) {
                this.deck.push({suit, value});
            }
        }
        // Shuffle
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    drawCard() {
        return this.deck.pop();
    }
    
    calculateScore(hand) {
        let score = 0;
        let aces = 0;
        
        for (const card of hand) {
            if (card.value === 'A') {
                aces++;
                score += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                score += 10;
            } else {
                score += parseInt(card.value);
            }
        }
        
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        
        return score;
    }
    
    deal() {
        if (this.chips < this.bet) {
            app.showSnackbar('Not enough chips!');
            return;
        }
        
        this.chips -= this.bet;
        this.createDeck();
        this.playerHand = [this.drawCard(), this.drawCard()];
        this.dealerHand = [this.drawCard(), this.drawCard()];
        this.playerScore = this.calculateScore(this.playerHand);
        this.dealerScore = this.calculateScore(this.dealerHand);
        this.gamePhase = 'playing';
        
        // Check for blackjack
        if (this.playerScore === 21) {
            this.dealerTurn();
        } else {
            this.render();
        }
    }
    
    hit() {
        this.playerHand.push(this.drawCard());
        this.playerScore = this.calculateScore(this.playerHand);
        
        if (this.playerScore > 21) {
            this.endGame('bust');
        } else if (this.playerScore === 21) {
            this.dealerTurn();
        } else {
            this.render();
        }
    }
    
    stand() {
        this.dealerTurn();
    }
    
    dealerTurn() {
        this.gamePhase = 'dealerTurn';
        
        const dealerPlay = () => {
            this.dealerScore = this.calculateScore(this.dealerHand);
            
            if (this.dealerScore < 17) {
                this.dealerHand.push(this.drawCard());
                this.render();
                setTimeout(dealerPlay, 700);
            } else {
                this.determineWinner();
            }
        };
        
        this.render();
        setTimeout(dealerPlay, 700);
    }
    
    determineWinner() {
        this.dealerScore = this.calculateScore(this.dealerHand);
        
        if (this.dealerScore > 21) {
            this.endGame('dealerBust');
        } else if (this.playerScore > this.dealerScore) {
            this.endGame('win');
        } else if (this.playerScore < this.dealerScore) {
            this.endGame('lose');
        } else {
            this.endGame('push');
        }
    }
    
    endGame(result) {
        this.gamePhase = 'ended';
        
        let message = '';
        switch (result) {
            case 'bust':
                message = '💥 Bust! You lose.';
                break;
            case 'dealerBust':
                message = '🎉 Dealer busts! You win!';
                this.chips += this.bet * 2;
                break;
            case 'win':
                if (this.playerScore === 21 && this.playerHand.length === 2) {
                    message = '🃏 Blackjack! You win 1.5x!';
                    this.chips += Math.floor(this.bet * 2.5);
                } else {
                    message = '🎉 You win!';
                    this.chips += this.bet * 2;
                }
                break;
            case 'lose':
                message = '😢 Dealer wins.';
                break;
            case 'push':
                message = '🤝 Push! Bet returned.';
                this.chips += this.bet;
                break;
        }
        
        localStorage.setItem('blackjack-chips', this.chips.toString());
        app.showSnackbar(message);
        this.render();
    }
    
    renderCard(card, hidden = false) {
        if (hidden) {
            return `<div class="bj-card hidden">🂠</div>`;
        }
        const isRed = card.suit === '♥' || card.suit === '♦';
        return `<div class="bj-card ${isRed ? 'red' : 'black'}">
            <span class="card-value">${card.value}</span>
            <span class="card-suit">${card.suit}</span>
        </div>`;
    }
    
    render() {
        const showDealerSecond = this.gamePhase === 'dealerTurn' || this.gamePhase === 'ended';
        
        this.controlsArea.innerHTML = `
            <div style="text-align: center; margin-bottom: 12px;">
                <span style="font-size: 20px;">💰 ${this.chips}</span>
            </div>
            ${this.gamePhase === 'betting' ? `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
                    <button class="btn" id="bjBetDown">-</button>
                    <span style="font-size: 18px; min-width: 60px; text-align: center;">$${this.bet}</span>
                    <button class="btn" id="bjBetUp">+</button>
                </div>
                <button class="btn btn-primary" id="bjDeal">Deal</button>
            ` : this.gamePhase === 'playing' ? `
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="btn btn-primary" id="bjHit">Hit</button>
                    <button class="btn" id="bjStand">Stand</button>
                </div>
            ` : this.gamePhase === 'ended' ? `
                <button class="btn btn-primary" id="bjNewGame">New Hand</button>
                ${this.chips === 0 ? `<button class="btn" id="bjReset" style="margin-left: 8px;">Reset Chips</button>` : ''}
            ` : ''}
        `;
        
        if (this.gamePhase === 'betting') {
            document.getElementById('bjBetDown')?.addEventListener('click', () => {
                if (this.bet > 10) { this.bet -= 10; this.render(); }
            });
            document.getElementById('bjBetUp')?.addEventListener('click', () => {
                if (this.bet < Math.min(500, this.chips)) { this.bet += 10; this.render(); }
            });
            document.getElementById('bjDeal')?.addEventListener('click', () => this.deal());
        } else if (this.gamePhase === 'playing') {
            document.getElementById('bjHit')?.addEventListener('click', () => this.hit());
            document.getElementById('bjStand')?.addEventListener('click', () => this.stand());
        } else if (this.gamePhase === 'ended') {
            document.getElementById('bjNewGame')?.addEventListener('click', () => {
                this.gamePhase = 'betting';
                this.render();
            });
            document.getElementById('bjReset')?.addEventListener('click', () => {
                this.chips = 1000;
                localStorage.setItem('blackjack-chips', '1000');
                this.gamePhase = 'betting';
                this.render();
            });
        }
        
        this.statusArea.textContent = this.gamePhase === 'betting' ? 'Place your bet!' :
            this.gamePhase === 'playing' ? `Your score: ${this.playerScore}` :
            this.gamePhase === 'dealerTurn' ? 'Dealer\'s turn...' :
            `You: ${this.playerScore} | Dealer: ${this.dealerScore}`;
        
        let html = `<div class="bj-table">
            <div class="bj-hand">
                <div class="hand-label">Dealer ${showDealerSecond ? `(${this.dealerScore})` : ''}</div>
                <div class="cards">
                    ${this.dealerHand.map((card, i) => 
                        this.renderCard(card, i === 1 && !showDealerSecond)
                    ).join('')}
                </div>
            </div>
            <div class="bj-hand player">
                <div class="hand-label">You (${this.playerScore})</div>
                <div class="cards">
                    ${this.playerHand.map(card => this.renderCard(card)).join('')}
                </div>
            </div>
        </div>
        <style>
            .bj-table {
                display: flex;
                flex-direction: column;
                gap: 30px;
                padding: 20px;
                background: linear-gradient(145deg, #0d5c2e, #0a4423);
                border-radius: 16px;
                max-width: 350px;
                margin: 0 auto;
            }
            .bj-hand {
                text-align: center;
            }
            .hand-label {
                color: white;
                font-size: 14px;
                margin-bottom: 8px;
                opacity: 0.8;
            }
            .cards {
                display: flex;
                justify-content: center;
                gap: -20px;
            }
            .bj-card {
                width: 60px;
                height: 84px;
                background: white;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: bold;
                box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
                margin-left: -15px;
            }
            .bj-card:first-child { margin-left: 0; }
            .bj-card.red { color: #dc2626; }
            .bj-card.black { color: #1f2937; }
            .bj-card.hidden {
                background: linear-gradient(145deg, #1e3a8a, #1e40af);
                color: white;
                font-size: 40px;
            }
            .card-value { font-size: 20px; }
            .card-suit { font-size: 24px; margin-top: -4px; }
        </style>`;
        
        this.gameArea.innerHTML = html;
    }
    
    cleanup() {}
}
