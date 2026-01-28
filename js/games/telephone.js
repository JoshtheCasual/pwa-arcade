// Telephone - Pass the phone sentence game
class Telephone {
    constructor() {
        this.name = 'Telephone';
        this.prompts = [
            "A penguin wearing a top hat riding a skateboard",
            "An astronaut eating spaghetti on the moon",
            "A cat teaching yoga to a group of dogs",
            "A robot falling in love with a toaster",
            "A wizard trying to use a smartphone",
            "A dinosaur working as a dentist",
            "A pirate afraid of water",
            "A ghost trying to make friends at a party",
            "An alien learning to drive a car",
            "A superhero who is afraid of heights",
            "A dragon roasting marshmallows with its breath",
            "A mermaid at a job interview",
            "A vampire at the beach during daytime",
            "A zombie doing ballet",
            "Santa Claus on summer vacation"
        ];
        this.chain = [];
        this.currentPlayer = 0;
        this.totalPlayers = 4;
        this.phase = 'setup'; // setup, write, draw, reveal
        this.currentType = 'write'; // alternates write/draw
        this.originalPrompt = '';
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.render();
    }

    reset() {
        this.chain = [];
        this.currentPlayer = 0;
        this.phase = 'setup';
        this.currentType = 'write';
        this.render();
    }

    render() {
        if (this.phase === 'write') {
            this.renderWrite();
            return;
        }
        if (this.phase === 'draw') {
            this.renderDraw();
            return;
        }
        if (this.phase === 'reveal') {
            this.renderReveal();
            return;
        }

        // Setup
        this.controlsArea.innerHTML = '';
        this.statusArea.textContent = 'Pass the phone in a circle!';

        this.gameArea.innerHTML = `
            <div class="phone-setup">
                <div class="phone-icon">📞</div>
                <h2>Telephone</h2>
                <p>Write → Draw → Write → Draw...<br>See how the message changes!</p>
                
                <div class="phone-players">
                    <label>Number of players:</label>
                    <div class="phone-player-select">
                        ${[3,4,5,6,7,8].map(n => `
                            <button class="mode-btn ${this.totalPlayers === n ? 'active' : ''}" data-num="${n}">${n}</button>
                        `).join('')}
                    </div>
                </div>

                <div class="phone-mode">
                    <button class="btn btn-primary btn-large" id="phoneRandom">🎲 Random Prompt</button>
                    <button class="btn btn-large" id="phoneCustom">✏️ Custom Start</button>
                </div>
            </div>
            <style>
                .phone-setup { text-align: center; padding: 20px; }
                .phone-icon { font-size: 56px; margin-bottom: 12px; }
                .phone-setup h2 { font-family: 'Fredoka', sans-serif; margin-bottom: 8px; }
                .phone-setup p { color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5; }
                .phone-players { margin-bottom: 24px; }
                .phone-players label { display: block; margin-bottom: 8px; color: var(--text-secondary); }
                .phone-player-select { display: flex; gap: 8px; justify-content: center; }
                .phone-mode { display: flex; flex-direction: column; gap: 12px; }
                .btn-large { padding: 16px 32px; font-size: 16px; }
                .phone-turn {
                    background: linear-gradient(135deg, #f472b6, #c026d3);
                    color: white;
                    padding: 20px;
                    border-radius: 16px;
                    text-align: center;
                    margin-bottom: 16px;
                }
                .phone-turn h3 { margin-bottom: 8px; opacity: 0.9; }
                .phone-prompt {
                    background: rgba(255,255,255,0.2);
                    padding: 16px;
                    border-radius: 12px;
                    font-size: 18px;
                    line-height: 1.4;
                }
                .phone-input {
                    width: 100%;
                    padding: 16px;
                    border: 2px solid var(--bg-secondary);
                    border-radius: 12px;
                    font-size: 16px;
                    background: var(--card-bg);
                    color: var(--text-primary);
                    resize: none;
                    min-height: 100px;
                }
                .phone-canvas-container {
                    background: white;
                    border-radius: 12px;
                    padding: 8px;
                    margin: 16px 0;
                }
                #phoneCanvas {
                    border-radius: 8px;
                    touch-action: none;
                }
                .phone-reveal {
                    text-align: center;
                    padding: 20px;
                }
                .phone-chain {
                    text-align: left;
                    margin: 20px 0;
                }
                .chain-item {
                    background: var(--card-bg);
                    border-radius: 12px;
                    padding: 16px;
                    margin: 12px 0;
                }
                .chain-item.write { border-left: 4px solid #3b82f6; }
                .chain-item.draw { border-left: 4px solid #22c55e; }
                .chain-label {
                    font-size: 12px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                }
                .chain-content { font-size: 16px; }
                .chain-content img {
                    max-width: 100%;
                    border-radius: 8px;
                }
            </style>
        `;

        this.gameArea.querySelectorAll('[data-num]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.totalPlayers = parseInt(btn.dataset.num);
                this.render();
            });
        });

        document.getElementById('phoneRandom')?.addEventListener('click', () => {
            this.originalPrompt = this.prompts[Math.floor(Math.random() * this.prompts.length)];
            this.chain.push({type: 'write', content: this.originalPrompt, player: 0});
            this.currentPlayer = 1;
            this.currentType = 'draw';
            this.phase = 'draw';
            this.render();
        });

        document.getElementById('phoneCustom')?.addEventListener('click', () => {
            this.phase = 'write';
            this.currentPlayer = 0;
            this.render();
        });
    }

    renderWrite() {
        const isFirst = this.currentPlayer === 0;
        const lastItem = this.chain[this.chain.length - 1];

        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="phoneSubmitWrite">Done - Pass Phone →</button>
        `;

        this.statusArea.textContent = `Player ${this.currentPlayer + 1}'s turn`;

        this.gameArea.innerHTML = `
            <div class="phone-turn">
                <h3>Player ${this.currentPlayer + 1}</h3>
                ${isFirst ? 
                    '<p>Write a funny sentence to start!</p>' :
                    `<p>Describe this drawing:</p>
                     <img src="${lastItem.content}" style="max-width:100%;border-radius:8px;margin-top:12px;">`
                }
            </div>
            <textarea class="phone-input" id="phoneText" placeholder="${isFirst ? 'Write something funny...' : 'What do you see?'}"></textarea>
        `;

        document.getElementById('phoneSubmitWrite')?.addEventListener('click', () => {
            const text = document.getElementById('phoneText')?.value.trim();
            if (!text) {
                app.showSnackbar('Write something first!');
                return;
            }
            
            this.chain.push({type: 'write', content: text, player: this.currentPlayer});
            this.nextTurn();
        });
    }

    renderDraw() {
        const lastItem = this.chain[this.chain.length - 1];

        this.controlsArea.innerHTML = `
            <div style="display: flex; gap: 8px; justify-content: center;">
                <button class="btn" id="phoneClear">🗑️ Clear</button>
                <button class="btn btn-primary" id="phoneSubmitDraw">Done - Pass Phone →</button>
            </div>
        `;

        this.statusArea.textContent = `Player ${this.currentPlayer + 1}'s turn`;

        this.gameArea.innerHTML = `
            <div class="phone-turn">
                <h3>Player ${this.currentPlayer + 1}</h3>
                <p>Draw this:</p>
                <div class="phone-prompt">"${lastItem.content}"</div>
            </div>
            <div class="phone-canvas-container">
                <canvas id="phoneCanvas" width="300" height="300"></canvas>
            </div>
        `;

        this.setupCanvas();

        document.getElementById('phoneClear')?.addEventListener('click', () => {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        });

        document.getElementById('phoneSubmitDraw')?.addEventListener('click', () => {
            const dataUrl = this.canvas.toDataURL();
            this.chain.push({type: 'draw', content: dataUrl, player: this.currentPlayer});
            this.nextTurn();
        });
    }

    setupCanvas() {
        this.canvas = document.getElementById('phoneCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.isDrawing = false);
        this.canvas.addEventListener('mouseout', () => this.isDrawing = false);

        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.startDraw(e.touches[0]); });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.draw(e.touches[0]); });
        this.canvas.addEventListener('touchend', () => this.isDrawing = false);
    }

    startDraw(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }

    draw(e) {
        if (!this.isDrawing) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        this.lastX = x;
        this.lastY = y;
    }

    nextTurn() {
        this.currentPlayer++;
        
        if (this.currentPlayer >= this.totalPlayers) {
            this.phase = 'reveal';
            this.render();
            return;
        }
        
        this.currentType = this.currentType === 'write' ? 'draw' : 'write';
        this.phase = this.currentType;
        this.render();
    }

    renderReveal() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="phoneAgain">Play Again</button>
        `;

        this.statusArea.textContent = 'The Big Reveal!';

        this.gameArea.innerHTML = `
            <div class="phone-reveal">
                <h2>📞 The Chain!</h2>
                <div class="phone-chain">
                    ${this.chain.map((item, i) => `
                        <div class="chain-item ${item.type}">
                            <div class="chain-label">Player ${item.player + 1} ${item.type === 'write' ? 'wrote' : 'drew'}:</div>
                            <div class="chain-content">
                                ${item.type === 'write' ? 
                                    `"${item.content}"` : 
                                    `<img src="${item.content}">`
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('phoneAgain')?.addEventListener('click', () => this.reset());
        
        app.showSnackbar('Look how the message changed! 😂');
    }

    cleanup() {}
}
