// Trivia - Multiplayer quiz game (3+ players, one host)
class Trivia {
    constructor() {
        this.name = 'Trivia';
        this.categories = {
            general: [
                {q: "What planet is known as the Red Planet?", a: "Mars"},
                {q: "What is the largest ocean on Earth?", a: "Pacific Ocean"},
                {q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci"},
                {q: "What year did the Titanic sink?", a: "1912"},
                {q: "What is the capital of Australia?", a: "Canberra"},
                {q: "How many bones are in the human body?", a: "206"},
                {q: "What is the smallest country in the world?", a: "Vatican City"},
                {q: "What element has the chemical symbol 'O'?", a: "Oxygen"},
                {q: "Who wrote Romeo and Juliet?", a: "Shakespeare"},
                {q: "What is the largest mammal?", a: "Blue Whale"},
            ],
            movies: [
                {q: "What movie features the quote 'I'll be back'?", a: "The Terminator"},
                {q: "Who directed Jurassic Park?", a: "Steven Spielberg"},
                {q: "What is the highest-grossing film of all time?", a: "Avatar"},
                {q: "In The Matrix, what color pill does Neo take?", a: "Red"},
                {q: "What year was the first Harry Potter movie released?", a: "2001"},
                {q: "Who plays Iron Man in the MCU?", a: "Robert Downey Jr."},
                {q: "What fictional country is Black Panther from?", a: "Wakanda"},
                {q: "Who directed Titanic?", a: "James Cameron"},
                {q: "What is the name of the lion in The Lion King?", a: "Simba"},
                {q: "In Frozen, what is the snowman's name?", a: "Olaf"},
            ],
            science: [
                {q: "What is the speed of light in km/s (approx)?", a: "300,000"},
                {q: "What gas do plants absorb from the atmosphere?", a: "Carbon Dioxide"},
                {q: "What is the hardest natural substance?", a: "Diamond"},
                {q: "How many planets are in our solar system?", a: "8"},
                {q: "What is the chemical formula for water?", a: "H2O"},
                {q: "What organ pumps blood through the body?", a: "Heart"},
                {q: "What is the closest star to Earth?", a: "The Sun"},
                {q: "What force keeps us on the ground?", a: "Gravity"},
                {q: "What is the largest organ in the human body?", a: "Skin"},
                {q: "What planet has the most moons?", a: "Saturn"},
            ],
            sports: [
                {q: "How many players are on a basketball team on court?", a: "5"},
                {q: "What sport is played at Wimbledon?", a: "Tennis"},
                {q: "Which country hosted the 2016 Olympics?", a: "Brazil"},
                {q: "How many holes are on a standard golf course?", a: "18"},
                {q: "What sport does Tom Brady play?", a: "Football"},
                {q: "How long is a marathon in miles (approx)?", a: "26.2"},
                {q: "What country invented soccer/football?", a: "England"},
                {q: "How many rings are on the Olympic flag?", a: "5"},
                {q: "What sport uses a puck?", a: "Hockey"},
                {q: "Who has won the most Grand Slam tennis titles (men)?", a: "Novak Djokovic"},
            ]
        };
        this.category = 'general';
        this.questions = [];
        this.currentIndex = 0;
        this.showingAnswer = false;
        this.scores = {};
        this.players = [];
        this.phase = 'setup'; // setup, playing, results
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.render();
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    reset() {
        this.questions = this.shuffle([...this.categories[this.category]]);
        this.currentIndex = 0;
        this.showingAnswer = false;
        this.phase = 'setup';
        this.scores = {};
        this.players.forEach(p => this.scores[p] = 0);
        this.render();
    }

    render() {
        if (this.phase === 'playing') {
            this.renderPlaying();
            return;
        }
        if (this.phase === 'results') {
            this.renderResults();
            return;
        }

        // Setup phase
        this.controlsArea.innerHTML = `
            <div class="mode-selector" style="flex-wrap: wrap; gap: 8px;">
                ${Object.keys(this.categories).map(cat => `
                    <button class="mode-btn ${this.category === cat ? 'active' : ''}" data-cat="${cat}">
                        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                `).join('')}
            </div>
        `;

        this.controlsArea.querySelectorAll('[data-cat]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.category = btn.dataset.cat;
                this.render();
            });
        });

        this.statusArea.textContent = 'One person hosts, reads questions aloud!';

        this.gameArea.innerHTML = `
            <div class="trivia-setup">
                <div class="trivia-icon">🎯</div>
                <h2>Trivia Night!</h2>
                <p>Enter player names (one hosts & reads questions)</p>
                
                <div class="trivia-players">
                    <div class="player-inputs" id="playerInputs">
                        <input type="text" class="trivia-input" placeholder="Player 1" data-idx="0">
                        <input type="text" class="trivia-input" placeholder="Player 2" data-idx="1">
                        <input type="text" class="trivia-input" placeholder="Player 3" data-idx="2">
                    </div>
                    <button class="btn btn-small" id="addPlayer">+ Add Player</button>
                </div>
                
                <button class="btn btn-primary btn-large" id="triviaStart">Start Game</button>
            </div>
            <style>
                .trivia-setup { text-align: center; padding: 20px; }
                .trivia-icon { font-size: 56px; margin-bottom: 12px; }
                .trivia-setup h2 { font-family: 'Fredoka', sans-serif; margin-bottom: 8px; }
                .trivia-setup p { color: var(--text-secondary); margin-bottom: 20px; }
                .trivia-players { margin-bottom: 24px; }
                .player-inputs { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
                .trivia-input {
                    padding: 12px 16px;
                    border: 2px solid var(--bg-secondary);
                    border-radius: 12px;
                    font-size: 16px;
                    background: var(--card-bg);
                    color: var(--text-primary);
                }
                .btn-small { padding: 8px 16px; font-size: 14px; }
                .btn-large { padding: 16px 48px; font-size: 18px; }
                .trivia-question {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 30px 20px;
                    border-radius: 20px;
                    text-align: center;
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .trivia-q-text {
                    font-size: 24px;
                    font-family: 'Fredoka', sans-serif;
                    line-height: 1.4;
                }
                .trivia-answer {
                    margin-top: 20px;
                    padding: 16px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 12px;
                    font-size: 28px;
                    font-weight: bold;
                }
                .trivia-progress {
                    text-align: center;
                    margin-bottom: 16px;
                    color: var(--text-secondary);
                }
                .trivia-scores {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    justify-content: center;
                    margin-top: 16px;
                }
                .trivia-score-chip {
                    background: var(--card-bg);
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                }
                .trivia-score-chip.active { background: var(--pink); color: white; }
                .trivia-results { text-align: center; padding: 30px 20px; }
                .trivia-winner { font-size: 64px; margin: 20px 0; }
                .trivia-final-scores { margin: 20px 0; }
                .trivia-final-score {
                    padding: 12px;
                    margin: 8px 0;
                    background: var(--card-bg);
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                }
            </style>
        `;

        document.getElementById('addPlayer')?.addEventListener('click', () => {
            const inputs = document.getElementById('playerInputs');
            const count = inputs.children.length;
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'trivia-input';
            input.placeholder = `Player ${count + 1}`;
            input.dataset.idx = count;
            inputs.appendChild(input);
        });

        document.getElementById('triviaStart')?.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.trivia-input');
            this.players = [];
            inputs.forEach(input => {
                const name = input.value.trim() || input.placeholder;
                this.players.push(name);
                this.scores[name] = 0;
            });
            this.questions = this.shuffle([...this.categories[this.category]]);
            this.currentIndex = 0;
            this.phase = 'playing';
            this.render();
        });
    }

    renderPlaying() {
        const q = this.questions[this.currentIndex];
        const remaining = this.questions.length - this.currentIndex;

        this.controlsArea.innerHTML = `
            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                ${this.players.map(p => `
                    <button class="btn btn-small score-btn" data-player="${p}" ${this.showingAnswer ? '' : 'disabled'}>
                        +1 ${p}
                    </button>
                `).join('')}
            </div>
        `;

        this.controlsArea.querySelectorAll('.score-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.scores[btn.dataset.player]++;
                this.nextQuestion();
            });
        });

        this.statusArea.textContent = `Question ${this.currentIndex + 1} of ${this.questions.length}`;

        this.gameArea.innerHTML = `
            <div class="trivia-progress">
                ${remaining} questions remaining
            </div>
            <div class="trivia-question">
                <div class="trivia-q-text">${q.q}</div>
                ${this.showingAnswer ? `<div class="trivia-answer">${q.a}</div>` : ''}
            </div>
            <div class="trivia-scores">
                ${this.players.map(p => `
                    <div class="trivia-score-chip">${p}: ${this.scores[p]}</div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 20px;">
                ${this.showingAnswer ? `
                    <button class="btn" id="noPoint">No one got it</button>
                ` : `
                    <button class="btn btn-primary" id="showAnswer">Show Answer</button>
                `}
            </div>
        `;

        document.getElementById('showAnswer')?.addEventListener('click', () => {
            this.showingAnswer = true;
            this.render();
        });

        document.getElementById('noPoint')?.addEventListener('click', () => {
            this.nextQuestion();
        });
    }

    nextQuestion() {
        this.currentIndex++;
        this.showingAnswer = false;
        
        if (this.currentIndex >= this.questions.length) {
            this.phase = 'results';
        }
        this.render();
    }

    renderResults() {
        const sorted = Object.entries(this.scores).sort((a, b) => b[1] - a[1]);
        const winner = sorted[0];

        this.controlsArea.innerHTML = '';
        this.statusArea.textContent = 'Game Over!';

        this.gameArea.innerHTML = `
            <div class="trivia-results">
                <h2>🏆 Winner!</h2>
                <div class="trivia-winner">${winner[0]}</div>
                <div style="font-size: 24px; color: var(--pink-deep);">${winner[1]} points</div>
                
                <div class="trivia-final-scores">
                    ${sorted.map(([name, score], i) => `
                        <div class="trivia-final-score">
                            <span>${i === 0 ? '👑' : ''} ${name}</span>
                            <strong>${score}</strong>
                        </div>
                    `).join('')}
                </div>
                
                <button class="btn btn-primary" id="triviaAgain">Play Again</button>
            </div>
        `;

        document.getElementById('triviaAgain')?.addEventListener('click', () => {
            this.reset();
        });

        app.showSnackbar(`${winner[0]} wins with ${winner[1]} points! 🎉`);
    }

    cleanup() {}
}
