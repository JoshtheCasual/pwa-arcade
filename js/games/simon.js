// Simon - Memory pattern game
class Simon {
    constructor() {
        this.name = 'Simon';
        this.sequence = [];
        this.playerIndex = 0;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('simon-high') || '0');
        this.isPlaying = false;
        this.isShowingSequence = false;
        this.gameOver = false;
        this.speed = 600;
        this.colors = ['green', 'red', 'yellow', 'blue'];
        this.sounds = {};
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.createSounds();
        this.render();
    }

    createSounds() {
        // Create audio context on first interaction
        this.audioCtx = null;
        const frequencies = {
            green: 329.63,  // E4
            red: 261.63,    // C4
            yellow: 220.00, // A3
            blue: 164.81    // E3
        };
        
        this.frequencies = frequencies;
    }

    playTone(color, duration = 300) {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        oscillator.frequency.value = this.frequencies[color];
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration / 1000);
        
        oscillator.start(this.audioCtx.currentTime);
        oscillator.stop(this.audioCtx.currentTime + duration / 1000);
    }

    reset() {
        this.sequence = [];
        this.playerIndex = 0;
        this.score = 0;
        this.isPlaying = true;
        this.isShowingSequence = false;
        this.gameOver = false;
        this.speed = 600;
        this.addToSequence();
    }

    addToSequence() {
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.sequence.push(randomColor);
        this.playerIndex = 0;
        this.showSequence();
    }

    async showSequence() {
        this.isShowingSequence = true;
        this.render();

        await this.delay(500);

        for (let i = 0; i < this.sequence.length; i++) {
            const color = this.sequence[i];
            this.highlightButton(color);
            this.playTone(color);
            await this.delay(this.speed);
            this.unhighlightButton(color);
            await this.delay(100);
        }

        this.isShowingSequence = false;
        this.render();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    highlightButton(color) {
        const btn = this.gameArea.querySelector(`[data-color="${color}"]`);
        if (btn) btn.classList.add('active');
    }

    unhighlightButton(color) {
        const btn = this.gameArea.querySelector(`[data-color="${color}"]`);
        if (btn) btn.classList.remove('active');
    }

    async handleInput(color) {
        if (this.isShowingSequence || this.gameOver || !this.isPlaying) return;

        this.highlightButton(color);
        this.playTone(color, 200);
        
        setTimeout(() => this.unhighlightButton(color), 200);

        if (this.sequence[this.playerIndex] === color) {
            this.playerIndex++;
            
            if (this.playerIndex === this.sequence.length) {
                this.score = this.sequence.length;
                
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('simon-high', this.highScore.toString());
                }
                
                // Speed up as sequence gets longer
                if (this.sequence.length > 5) this.speed = 500;
                if (this.sequence.length > 10) this.speed = 400;
                if (this.sequence.length > 15) this.speed = 300;
                
                this.render();
                await this.delay(1000);
                this.addToSequence();
            }
        } else {
            this.endGame();
        }
    }

    async endGame() {
        this.gameOver = true;
        this.isPlaying = false;
        
        // Play error sound
        if (this.audioCtx) {
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            oscillator.frequency.value = 100;
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(this.audioCtx.currentTime + 0.5);
        }
        
        // Flash all buttons
        this.colors.forEach(c => this.highlightButton(c));
        await this.delay(200);
        this.colors.forEach(c => this.unhighlightButton(c));
        await this.delay(200);
        this.colors.forEach(c => this.highlightButton(c));
        await this.delay(200);
        this.colors.forEach(c => this.unhighlightButton(c));
        
        app.showSnackbar(`Game Over! Score: ${this.score}`);
        this.render();
    }

    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="simonStart">${this.isPlaying ? 'Restart' : 'Start Game'}</button>
        `;

        document.getElementById('simonStart')?.addEventListener('click', () => this.reset());

        let status = `Score: ${this.score} | High: ${this.highScore}`;
        if (this.isShowingSequence) {
            status = '👀 Watch the pattern...';
        } else if (this.isPlaying && !this.gameOver) {
            status = '🎯 Your turn!';
        } else if (this.gameOver) {
            status = `💥 Game Over! Score: ${this.score}`;
        }
        this.statusArea.textContent = status;

        let html = `
            <div class="simon-container">
                <div class="simon-board">
                    <button class="simon-btn green" data-color="green"></button>
                    <button class="simon-btn red" data-color="red"></button>
                    <button class="simon-btn yellow" data-color="yellow"></button>
                    <button class="simon-btn blue" data-color="blue"></button>
                    <div class="simon-center">
                        <div class="simon-score">${this.score}</div>
                    </div>
                </div>
            </div>
        `;

        this.gameArea.innerHTML = html;

        if (!document.getElementById('simon-styles')) {
            const style = document.createElement('style');
            style.id = 'simon-styles';
            style.textContent = `
                .simon-container { display: flex; justify-content: center; padding: 20px; }
                .simon-board {
                    width: 300px; height: 300px;
                    border-radius: 50%;
                    background: #1a1a2e;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr 1fr;
                    gap: 8px;
                    padding: 8px;
                    position: relative;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .simon-btn {
                    border: none;
                    cursor: pointer;
                    transition: all 0.1s;
                    opacity: 0.6;
                }
                .simon-btn:active, .simon-btn.active { opacity: 1; transform: scale(0.98); }
                .simon-btn.green {
                    background: radial-gradient(circle at 30% 30%, #4ade80, #22c55e, #16a34a);
                    border-radius: 100% 10% 10% 10%;
                }
                .simon-btn.red {
                    background: radial-gradient(circle at 70% 30%, #f87171, #ef4444, #dc2626);
                    border-radius: 10% 100% 10% 10%;
                }
                .simon-btn.yellow {
                    background: radial-gradient(circle at 30% 70%, #fde047, #facc15, #eab308);
                    border-radius: 10% 10% 10% 100%;
                }
                .simon-btn.blue {
                    background: radial-gradient(circle at 70% 70%, #60a5fa, #3b82f6, #2563eb);
                    border-radius: 10% 10% 100% 10%;
                }
                .simon-btn.active.green { box-shadow: 0 0 40px #4ade80, inset 0 0 30px rgba(255,255,255,0.3); }
                .simon-btn.active.red { box-shadow: 0 0 40px #ef4444, inset 0 0 30px rgba(255,255,255,0.3); }
                .simon-btn.active.yellow { box-shadow: 0 0 40px #facc15, inset 0 0 30px rgba(255,255,255,0.3); }
                .simon-btn.active.blue { box-shadow: 0 0 40px #3b82f6, inset 0 0 30px rgba(255,255,255,0.3); }
                .simon-center {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80px; height: 80px;
                    border-radius: 50%;
                    background: #1a1a2e;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
                }
                .simon-score {
                    font-size: 32px;
                    font-weight: bold;
                    color: #666;
                }
            `;
            document.head.appendChild(style);
        }

        // Bind events
        this.gameArea.querySelectorAll('.simon-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleInput(btn.dataset.color);
            });
            // Touch events for mobile
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleInput(btn.dataset.color);
            });
        });
    }

    cleanup() {
        if (this.audioCtx) {
            this.audioCtx.close();
        }
    }
}
