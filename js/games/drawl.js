// Drawl - Drawing guessing game (like Pictionary)
class Drawl {
    constructor() {
        this.name = 'Drawl';
        this.words = {
            easy: ['cat', 'dog', 'sun', 'tree', 'house', 'car', 'fish', 'bird', 'apple', 'book', 'phone', 'chair', 'ball', 'hat', 'shoe', 'cup', 'door', 'star', 'moon', 'cake'],
            medium: ['guitar', 'bicycle', 'elephant', 'airplane', 'rainbow', 'umbrella', 'sandwich', 'computer', 'dinosaur', 'butterfly', 'mountain', 'hospital', 'football', 'penguin', 'giraffe', 'volcano', 'treasure', 'spaceship', 'snowman', 'lighthouse'],
            hard: ['electricity', 'democracy', 'jealousy', 'meditation', 'philosophy', 'imagination', 'celebration', 'frustration', 'technology', 'architecture', 'championship', 'environment', 'relationship', 'entertainment', 'communication', 'transportation', 'advertisement', 'determination', 'photography', 'anniversary']
        };
        this.difficulty = 'medium';
        this.currentWord = '';
        this.phase = 'setup'; // setup, drawing, guessing
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.color = '#000000';
        this.lineWidth = 4;
        this.timeLeft = 60;
        this.timer = null;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.render();
    }

    reset() {
        this.phase = 'setup';
        this.currentWord = '';
        this.timeLeft = 60;
        if (this.timer) clearInterval(this.timer);
        this.render();
    }

    render() {
        if (this.phase === 'drawing') {
            this.renderDrawing();
            return;
        }

        // Setup phase
        this.controlsArea.innerHTML = `
            <div class="mode-selector">
                ${['easy', 'medium', 'hard'].map(d => `
                    <button class="mode-btn ${this.difficulty === d ? 'active' : ''}" data-diff="${d}">
                        ${d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                `).join('')}
            </div>
        `;

        this.controlsArea.querySelectorAll('[data-diff]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficulty = btn.dataset.diff;
                this.render();
            });
        });

        this.statusArea.textContent = 'One person draws, others guess!';

        this.gameArea.innerHTML = `
            <div class="drawl-setup">
                <div class="drawl-icon">🎨</div>
                <h2>Drawl</h2>
                <p>Pass the phone to the artist.<br>They'll see a secret word to draw!</p>
                <div class="drawl-rules">
                    <div>✏️ Draw the word</div>
                    <div>🚫 No letters or numbers</div>
                    <div>⏱️ 60 seconds</div>
                </div>
                <button class="btn btn-primary btn-large" id="drawlStart">I'm the Artist!</button>
            </div>
            <style>
                .drawl-setup { text-align: center; padding: 20px; }
                .drawl-icon { font-size: 56px; margin-bottom: 12px; }
                .drawl-setup h2 { font-family: 'Fredoka', sans-serif; margin-bottom: 8px; }
                .drawl-setup p { color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5; }
                .drawl-rules {
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                    text-align: left;
                }
                .drawl-rules div { padding: 6px 0; }
                .btn-large { padding: 16px 48px; font-size: 18px; }
                .drawl-word-reveal {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 30px;
                    border-radius: 20px;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .drawl-word {
                    font-size: 36px;
                    font-family: 'Fredoka', sans-serif;
                    font-weight: bold;
                    margin: 16px 0;
                }
                .drawl-canvas-container {
                    background: white;
                    border-radius: 12px;
                    padding: 8px;
                    margin-bottom: 16px;
                }
                #drawlCanvas {
                    border-radius: 8px;
                    touch-action: none;
                    cursor: crosshair;
                }
                .drawl-tools {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-bottom: 12px;
                }
                .color-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 3px solid transparent;
                    cursor: pointer;
                }
                .color-btn.active { border-color: var(--text-primary); }
                .size-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 2px solid var(--bg-secondary);
                    background: var(--card-bg);
                    cursor: pointer;
                }
                .size-btn.active { border-color: var(--pink-deep); background: var(--pink); color: white; }
                .drawl-timer {
                    font-size: 48px;
                    font-weight: bold;
                    text-align: center;
                    color: var(--pink-deep);
                }
                .drawl-timer.warning { color: #ef4444; animation: pulse 0.5s infinite; }
                @keyframes pulse { 50% { opacity: 0.5; } }
            </style>
        `;

        document.getElementById('drawlStart')?.addEventListener('click', () => {
            this.startRound();
        });
    }

    startRound() {
        const wordList = this.words[this.difficulty];
        this.currentWord = wordList[Math.floor(Math.random() * wordList.length)];
        this.phase = 'drawing';
        this.timeLeft = 60;
        this.renderDrawing();
    }

    renderDrawing() {
        this.controlsArea.innerHTML = `
            <div style="display: flex; gap: 8px; justify-content: center;">
                <button class="btn" id="drawlClear">🗑️ Clear</button>
                <button class="btn btn-primary" id="drawlGuessed">✓ They Guessed It!</button>
                <button class="btn" id="drawlSkip">Skip Word</button>
            </div>
        `;

        document.getElementById('drawlClear')?.addEventListener('click', () => this.clearCanvas());
        document.getElementById('drawlGuessed')?.addEventListener('click', () => {
            app.showSnackbar('🎉 Nice drawing!');
            this.reset();
        });
        document.getElementById('drawlSkip')?.addEventListener('click', () => {
            this.startRound();
        });

        this.statusArea.textContent = `Draw: ${this.currentWord.toUpperCase()}`;

        this.gameArea.innerHTML = `
            <div class="drawl-timer ${this.timeLeft <= 10 ? 'warning' : ''}" id="drawlTimer">${this.timeLeft}</div>
            <div class="drawl-tools">
                <button class="color-btn active" style="background: #000000;" data-color="#000000"></button>
                <button class="color-btn" style="background: #ef4444;" data-color="#ef4444"></button>
                <button class="color-btn" style="background: #22c55e;" data-color="#22c55e"></button>
                <button class="color-btn" style="background: #3b82f6;" data-color="#3b82f6"></button>
                <button class="color-btn" style="background: #eab308;" data-color="#eab308"></button>
                <button class="color-btn" style="background: #a855f7;" data-color="#a855f7"></button>
                <button class="color-btn" style="background: #ffffff; border: 2px solid #ccc;" data-color="#ffffff"></button>
            </div>
            <div class="drawl-tools">
                <button class="size-btn ${this.lineWidth === 2 ? 'active' : ''}" data-size="2">Thin</button>
                <button class="size-btn ${this.lineWidth === 4 ? 'active' : ''}" data-size="4">Medium</button>
                <button class="size-btn ${this.lineWidth === 8 ? 'active' : ''}" data-size="8">Thick</button>
            </div>
            <div class="drawl-canvas-container">
                <canvas id="drawlCanvas" width="320" height="320"></canvas>
            </div>
        `;

        this.setupCanvas();
        this.startTimer();

        this.gameArea.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.gameArea.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.color = btn.dataset.color;
            });
        });

        this.gameArea.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.gameArea.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.lineWidth = parseInt(btn.dataset.size);
            });
        });
    }

    setupCanvas() {
        this.canvas = document.getElementById('drawlCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDraw());
        this.canvas.addEventListener('mouseout', () => this.stopDraw());

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDraw(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.stopDraw());
    }

    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startDraw(e) {
        this.isDrawing = true;
        const pos = this.getPos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getPos(e);
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    stopDraw() {
        this.isDrawing = false;
    }

    clearCanvas() {
        if (this.ctx) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            const timerEl = document.getElementById('drawlTimer');
            if (timerEl) {
                timerEl.textContent = this.timeLeft;
                if (this.timeLeft <= 10) {
                    timerEl.classList.add('warning');
                }
            }
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                app.showSnackbar(`Time's up! The word was: ${this.currentWord}`);
                this.reset();
            }
        }, 1000);
    }

    cleanup() {
        if (this.timer) clearInterval(this.timer);
    }
}
