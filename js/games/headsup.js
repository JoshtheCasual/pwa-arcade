// Heads Up - Party guessing game (hold phone to forehead)
class HeadsUp {
    constructor() {
        this.name = 'Heads Up';
        this.categories = {
            animals: ['Dog', 'Elephant', 'Penguin', 'Giraffe', 'Dolphin', 'Kangaroo', 'Octopus', 'Butterfly', 'Crocodile', 'Peacock', 'Hamster', 'Koala', 'Zebra', 'Gorilla', 'Flamingo', 'Turtle', 'Shark', 'Rabbit', 'Parrot', 'Squirrel'],
            movies: ['Titanic', 'Avatar', 'Frozen', 'Jaws', 'Shrek', 'Batman', 'Jurassic Park', 'Harry Potter', 'Star Wars', 'Finding Nemo', 'The Lion King', 'Toy Story', 'Spider-Man', 'Iron Man', 'Inception', 'Matrix', 'Gladiator', 'Rocky', 'Terminator', 'Ghostbusters'],
            actions: ['Dancing', 'Swimming', 'Cooking', 'Sleeping', 'Running', 'Laughing', 'Crying', 'Sneezing', 'Jumping', 'Climbing', 'Surfing', 'Bowling', 'Painting', 'Singing', 'Yawning', 'Waving', 'Clapping', 'Whistling', 'Driving', 'Flying'],
            celebrities: ['Taylor Swift', 'Beyoncé', 'Tom Hanks', 'Oprah', 'Michael Jordan', 'Elvis', 'Marilyn Monroe', 'Einstein', 'Shakespeare', 'Cleopatra', 'Leonardo DiCaprio', 'Rihanna', 'Will Smith', 'Adele', 'Eminem', 'Madonna', 'Arnold', 'Jackie Chan', 'Morgan Freeman', 'Dwayne Johnson'],
            food: ['Pizza', 'Spaghetti', 'Hamburger', 'Ice Cream', 'Sushi', 'Tacos', 'Pancakes', 'Hot Dog', 'French Fries', 'Chocolate', 'Popcorn', 'Sandwich', 'Donut', 'Bacon', 'Watermelon', 'Banana', 'Avocado', 'Lobster', 'Cupcake', 'Nachos'],
            places: ['Beach', 'Hospital', 'Airport', 'Library', 'Zoo', 'Museum', 'Casino', 'Church', 'Prison', 'School', 'Restaurant', 'Gym', 'Walmart', 'Disneyland', 'Las Vegas', 'Hollywood', 'Times Square', 'Eiffel Tower', 'Grand Canyon', 'White House']
        };
        this.category = 'animals';
        this.words = [];
        this.currentIndex = 0;
        this.score = 0;
        this.skipped = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.phase = 'setup'; // setup, ready, playing, results
        this.orientation = null;
        this.lastTilt = null;
    }
    
    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.render();
    }
    
    reset() {
        this.words = this.shuffle([...this.categories[this.category]]);
        this.currentIndex = 0;
        this.score = 0;
        this.skipped = 0;
        this.timeLeft = 60;
        this.phase = 'setup';
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        this.render();
    }
    
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    render() {
        if (this.phase === 'playing') {
            this.renderPlaying();
            return;
        }
        
        if (this.phase === 'ready') {
            this.renderReady();
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
        
        this.statusArea.textContent = 'Hold phone to forehead, guess the word!';
        
        this.gameArea.innerHTML = `
            <div class="hu-setup">
                <div class="hu-icon">🎭</div>
                <h2>Heads Up!</h2>
                <p>One player holds the phone to their forehead.<br>Others give clues without saying the word!</p>
                <div class="hu-instructions">
                    <div class="hu-tilt">📱⬇️ <strong>Tilt DOWN</strong> = Correct!</div>
                    <div class="hu-tilt">📱⬆️ <strong>Tilt UP</strong> = Pass/Skip</div>
                </div>
                <button class="btn btn-primary btn-large" id="huStart">Start Game</button>
            </div>
            <style>
                .hu-setup {
                    text-align: center;
                    padding: 30px 20px;
                }
                .hu-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }
                .hu-setup h2 {
                    font-family: 'Fredoka', sans-serif;
                    font-size: 28px;
                    margin-bottom: 12px;
                }
                .hu-setup p {
                    color: var(--text-secondary);
                    margin-bottom: 20px;
                    line-height: 1.5;
                }
                .hu-instructions {
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                }
                .hu-tilt {
                    padding: 8px 0;
                    font-size: 16px;
                }
                .btn-large {
                    padding: 16px 48px;
                    font-size: 20px;
                }
                .hu-ready {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 300px;
                    text-align: center;
                }
                .hu-ready h2 {
                    font-family: 'Fredoka', sans-serif;
                    font-size: 32px;
                    margin-bottom: 20px;
                }
                .hu-playing {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 350px;
                    text-align: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    color: white;
                    padding: 20px;
                }
                .hu-word {
                    font-family: 'Fredoka', sans-serif;
                    font-size: 48px;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin-bottom: 20px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                .hu-timer {
                    font-size: 72px;
                    font-weight: bold;
                    opacity: 0.9;
                }
                .hu-score-display {
                    margin-top: 20px;
                    font-size: 18px;
                    opacity: 0.8;
                }
                .hu-correct {
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
                }
                .hu-skip {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
                }
                .hu-results {
                    text-align: center;
                    padding: 30px 20px;
                }
                .hu-results h2 {
                    font-family: 'Fredoka', sans-serif;
                    font-size: 32px;
                    margin-bottom: 8px;
                }
                .hu-final-score {
                    font-size: 64px;
                    font-weight: bold;
                    color: var(--pink-deep);
                    margin: 20px 0;
                }
                .hu-stats {
                    color: var(--text-secondary);
                    margin-bottom: 24px;
                }
                .hu-buttons {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    margin-top: 20px;
                }
            </style>
        `;
        
        document.getElementById('huStart')?.addEventListener('click', () => {
            this.phase = 'ready';
            this.words = this.shuffle([...this.categories[this.category]]);
            this.currentIndex = 0;
            this.score = 0;
            this.skipped = 0;
            this.timeLeft = 60;
            this.render();
        });
    }
    
    renderReady() {
        this.controlsArea.innerHTML = '';
        this.statusArea.textContent = 'Get ready!';
        
        this.gameArea.innerHTML = `
            <div class="hu-ready">
                <h2>📱 Hold phone to forehead!</h2>
                <p>Tilt DOWN for correct, UP to skip</p>
                <button class="btn btn-primary btn-large" id="huBegin">I'm Ready!</button>
            </div>
        `;
        
        document.getElementById('huBegin')?.addEventListener('click', () => {
            this.startPlaying();
        });
    }
    
    startPlaying() {
        this.phase = 'playing';
        this.setupMotion();
        this.startTimer();
        this.render();
    }
    
    setupMotion() {
        // Request permission for iOS 13+
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permission => {
                    if (permission === 'granted') {
                        this.addMotionListener();
                    }
                })
                .catch(console.error);
        } else {
            this.addMotionListener();
        }
    }
    
    addMotionListener() {
        this.orientationHandler = (e) => {
            if (this.phase !== 'playing') return;
            
            const beta = e.beta; // Front-back tilt (-180 to 180)
            
            // Detect tilt gestures
            // Phone held to forehead: beta around 0-30
            // Tilted down (correct): beta > 45
            // Tilted up (skip): beta < -20
            
            if (beta > 50 && this.lastTilt !== 'down') {
                this.lastTilt = 'down';
                this.markCorrect();
            } else if (beta < -30 && this.lastTilt !== 'up') {
                this.lastTilt = 'up';
                this.markSkip();
            } else if (beta > -20 && beta < 40) {
                this.lastTilt = null;
            }
        };
        
        window.addEventListener('deviceorientation', this.orientationHandler);
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                this.endGame();
            } else {
                this.updateTimerDisplay();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const timerEl = document.querySelector('.hu-timer');
        if (timerEl) timerEl.textContent = this.timeLeft;
    }
    
    renderPlaying() {
        this.controlsArea.innerHTML = `
            <div class="hu-buttons">
                <button class="btn" id="huSkip">⬆️ Skip</button>
                <button class="btn btn-primary" id="huCorrect">⬇️ Correct!</button>
            </div>
        `;
        
        document.getElementById('huSkip')?.addEventListener('click', () => this.markSkip());
        document.getElementById('huCorrect')?.addEventListener('click', () => this.markCorrect());
        
        this.statusArea.textContent = `Score: ${this.score} | Skipped: ${this.skipped}`;
        
        const word = this.words[this.currentIndex] || 'Done!';
        
        this.gameArea.innerHTML = `
            <div class="hu-playing" id="huCard">
                <div class="hu-word">${word}</div>
                <div class="hu-timer">${this.timeLeft}</div>
                <div class="hu-score-display">✓ ${this.score} correct | ✗ ${this.skipped} skipped</div>
            </div>
        `;
    }
    
    markCorrect() {
        if (this.phase !== 'playing') return;
        
        this.score++;
        this.flashCard('correct');
        this.nextWord();
    }
    
    markSkip() {
        if (this.phase !== 'playing') return;
        
        this.skipped++;
        this.flashCard('skip');
        this.nextWord();
    }
    
    flashCard(type) {
        const card = document.getElementById('huCard');
        if (card) {
            card.classList.add(type === 'correct' ? 'hu-correct' : 'hu-skip');
            setTimeout(() => {
                card.classList.remove('hu-correct', 'hu-skip');
            }, 300);
        }
    }
    
    nextWord() {
        this.currentIndex++;
        if (this.currentIndex >= this.words.length) {
            this.endGame();
        } else {
            this.renderPlaying();
        }
    }
    
    endGame() {
        this.phase = 'results';
        if (this.timer) clearInterval(this.timer);
        if (this.orientationHandler) {
            window.removeEventListener('deviceorientation', this.orientationHandler);
        }
        this.render();
        
        if (this.score >= 10) {
            app.showSnackbar(`Amazing! ${this.score} correct! 🎉`);
        } else if (this.score >= 5) {
            app.showSnackbar(`Nice job! ${this.score} correct!`);
        }
    }
    
    renderResults() {
        this.controlsArea.innerHTML = '';
        this.statusArea.textContent = 'Game Over!';
        
        const emoji = this.score >= 10 ? '🏆' : this.score >= 5 ? '⭐' : '👍';
        
        this.gameArea.innerHTML = `
            <div class="hu-results">
                <h2>${emoji} Time's Up!</h2>
                <div class="hu-final-score">${this.score}</div>
                <div class="hu-stats">
                    ✓ ${this.score} correct<br>
                    ✗ ${this.skipped} skipped
                </div>
                <div class="hu-buttons">
                    <button class="btn" id="huMenu">Change Category</button>
                    <button class="btn btn-primary" id="huAgain">Play Again</button>
                </div>
            </div>
        `;
        
        document.getElementById('huAgain')?.addEventListener('click', () => {
            this.phase = 'ready';
            this.words = this.shuffle([...this.categories[this.category]]);
            this.currentIndex = 0;
            this.score = 0;
            this.skipped = 0;
            this.timeLeft = 60;
            this.render();
        });
        
        document.getElementById('huMenu')?.addEventListener('click', () => {
            this.reset();
        });
    }
    
    cleanup() {
        if (this.timer) clearInterval(this.timer);
        if (this.orientationHandler) {
            window.removeEventListener('deviceorientation', this.orientationHandler);
        }
    }
}
