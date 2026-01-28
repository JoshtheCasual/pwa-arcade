// Simon - Memory pattern game
class Simon {
    constructor() {
        this.name = 'Simon';
        this.sequence = [];
        this.playerIndex = 0;
        this.isPlaying = false;
        this.isShowingSequence = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('simon-highscore') || '0');
        this.colors = ['green', 'red', 'yellow', 'blue'];
        this.sounds = {};
    }
    
    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.initSounds();
        this.reset();
    }
    
    initSounds() {
        // Create audio context for tones
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.frequencies = {
            green: 392,   // G4
            red: 329.63,  // E4
            yellow: 261.63, // C4
            blue: 220     // A3
        };
    }
    
    playTone(color, duration = 300) {
        if (!this.audioCtx) return;
        
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
        this.isPlaying = false;
        this.isShowingSequence = false;
        this.score = 0;
        this.render();
    }
    
    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="simonStart" ${this.isPlaying ? 'disabled' : ''}>
                ${this.isPlaying ? 'Playing...' : 'Start Game'}
            </button>
            <div style="margin-top: 12px; text-align: center;">
                <div style="font-size: 14px; color: var(--text-secondary);">High Score: ${this.highScore}</div>
            </div>
        `;
        
        document.getElementById('simonStart')?.addEventListener('click', () => this.startGame());
        
        this.statusArea.textContent = this.isPlaying ? 
            (this.isShowingSequence ? 'Watch carefully...' : 'Your turn!') : 
            `Score: ${this.score}`;
        
        let html = `
            <div class="simon-container">
                <div class="simon-board">
                    <div class="simon-btn green" data-color="green"></div>
                    <div class="simon-btn red" data-color="red"></div>
                    <div class="simon-btn yellow" data-color="yellow"></div>
                    <div class="simon-btn blue" data-color="blue"></div>
                    <div class="simon-center">
                        <span>${this.score}</span>
                    </div>
                </div>
            </div>
            <style>
                .simon-container {
                    display: flex;
                    justify-content: center;
                    padding: 20px;
                }
                .simon-board {
                    position: relative;
                    width: 280px;
                    height: 280px;
                    border-radius: 50%;
                    background: #333;
                    padding: 10px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr 1fr;
                    gap: 8px;
                }
                .simon-btn {
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.1s ease;
                    opacity: 0.6;
                }
                .simon-btn:active, .simon-btn.lit {
                    opacity: 1;
                    transform: scale(0.98);
                }
                .simon-btn.green {
                    background: linear-gradient(145deg, #4ade80, #22c55e);
                    border-top-left-radius: 140px;
                }
                .simon-btn.red {
                    background: linear-gradient(145deg, #f87171, #ef4444);
                    border-top-right-radius: 140px;
                }
                .simon-btn.yellow {
                    background: linear-gradient(145deg, #fde047, #eab308);
                    border-bottom-left-radius: 140px;
                }
                .simon-btn.blue {
                    background: linear-gradient(145deg, #60a5fa, #3b82f6);
                    border-bottom-right-radius: 140px;
                }
                .simon-btn.disabled {
                    pointer-events: none;
                }
                .simon-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: #222;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: bold;
                    color: white;
                    font-family: 'Fredoka', sans-serif;
                }
            </style>
        `;
        
        this.gameArea.innerHTML = html;
        
        this.gameArea.querySelectorAll('.simon-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isShowingSequence || !this.isPlaying) return;
                const color = btn.dataset.color;
                this.handlePlayerInput(color);
            });
        });
    }
    
    startGame() {
        if (this.audioCtx?.state === 'suspended') {
            this.audioCtx.resume();
        }
        
        this.sequence = [];
        this.score = 0;
        this.isPlaying = true;
        this.render();
        this.addToSequence();
    }
    
    addToSequence() {
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.sequence.push(randomColor);
        this.playerIndex = 0;
        this.showSequence();
    }
    
    showSequence() {
        this.isShowingSequence = true;
        this.render();
        
        let i = 0;
        const interval = setInterval(() => {
            if (i >= this.sequence.length) {
                clearInterval(interval);
                this.isShowingSequence = false;
                this.render();
                return;
            }
            
            this.lightUp(this.sequence[i]);
            i++;
        }, 600);
    }
    
    lightUp(color) {
        const btn = this.gameArea.querySelector(`.simon-btn.${color}`);
        if (!btn) return;
        
        btn.classList.add('lit');
        this.playTone(color);
        
        setTimeout(() => {
            btn.classList.remove('lit');
        }, 300);
    }
    
    handlePlayerInput(color) {
        this.lightUp(color);
        
        if (color !== this.sequence[this.playerIndex]) {
            this.gameOver();
            return;
        }
        
        this.playerIndex++;
        
        if (this.playerIndex === this.sequence.length) {
            this.score = this.sequence.length;
            
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('simon-highscore', this.highScore.toString());
            }
            
            this.render();
            
            setTimeout(() => {
                this.addToSequence();
            }, 1000);
        }
    }
    
    gameOver() {
        this.isPlaying = false;
        this.statusArea.textContent = `Game Over! Score: ${this.score}`;
        app.showSnackbar(`Game Over! Score: ${this.score}`);
        
        // Flash all buttons red
        const btns = this.gameArea.querySelectorAll('.simon-btn');
        btns.forEach(btn => btn.style.background = '#ef4444');
        
        setTimeout(() => {
            this.render();
        }, 500);
    }
    
    cleanup() {
        if (this.audioCtx) {
            this.audioCtx.close();
        }
    }
}
