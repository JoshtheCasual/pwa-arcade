// Hangman - Word guessing with categories
class Hangman {
    constructor() {
        this.name = 'Hangman';
        this.word = '';
        this.guessed = new Set();
        this.wrongGuesses = 0;
        this.maxWrong = 6;
        this.gameOver = false;
        this.won = false;
        this.category = 'animals';
        
        this.categories = {
            animals: ['elephant', 'giraffe', 'penguin', 'kangaroo', 'dolphin', 'butterfly', 'cheetah', 'crocodile', 'flamingo', 'hedgehog', 'jellyfish', 'leopard', 'mongoose', 'octopus', 'panther', 'squirrel', 'tortoise', 'vulture', 'walrus', 'zebra'],
            countries: ['australia', 'brazil', 'canada', 'denmark', 'egypt', 'france', 'germany', 'hungary', 'ireland', 'japan', 'kenya', 'malaysia', 'norway', 'portugal', 'singapore', 'thailand', 'ukraine', 'vietnam', 'zimbabwe', 'argentina'],
            movies: ['inception', 'avatar', 'titanic', 'gladiator', 'interstellar', 'braveheart', 'casablanca', 'jaws', 'psycho', 'goodfellas', 'chinatown', 'vertigo', 'amadeus', 'platoon', 'rocky'],
            food: ['pizza', 'spaghetti', 'hamburger', 'chocolate', 'sandwich', 'pancakes', 'sausage', 'burrito', 'lasagna', 'pretzel', 'croissant', 'dumpling', 'omelette', 'avocado', 'broccoli', 'mushroom', 'pineapple', 'strawberry', 'blueberry', 'watermelon'],
            sports: ['basketball', 'football', 'tennis', 'swimming', 'volleyball', 'baseball', 'cricket', 'hockey', 'gymnastics', 'wrestling', 'archery', 'badminton', 'cycling', 'fencing', 'golf', 'rowing', 'sailing', 'skiing', 'surfing', 'triathlon']
        };
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.setupInput();
        this.reset();
    }

    setupInput() {
        this.keyHandler = (e) => {
            if (this.gameOver) return;
            if (/^[a-zA-Z]$/.test(e.key)) {
                this.guessLetter(e.key.toLowerCase());
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    reset() {
        const words = this.categories[this.category];
        this.word = words[Math.floor(Math.random() * words.length)];
        this.guessed = new Set();
        this.wrongGuesses = 0;
        this.gameOver = false;
        this.won = false;
        this.render();
    }

    render() {
        this.controlsArea.innerHTML = `
            <div class="mode-selector" style="flex-wrap: wrap;">
                ${Object.keys(this.categories).map(cat => `
                    <button class="mode-btn ${this.category === cat ? 'active' : ''}" data-cat="${cat}">
                        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                `).join('')}
            </div>
            <button class="btn btn-primary" style="margin-top: 12px;" id="hangmanReset">New Word</button>
        `;

        this.controlsArea.querySelectorAll('[data-cat]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.category = btn.dataset.cat;
                this.reset();
            });
        });

        document.getElementById('hangmanReset')?.addEventListener('click', () => this.reset());

        this.statusArea.textContent = `Category: ${this.category.charAt(0).toUpperCase() + this.category.slice(1)} | Wrong: ${this.wrongGuesses}/${this.maxWrong}`;

        let html = '<div class="hangman-container">';
        
        // Hangman drawing
        html += '<div class="hangman-drawing">' + this.getHangmanSVG() + '</div>';

        // Word display
        html += '<div class="hangman-word">';
        for (const letter of this.word) {
            if (this.guessed.has(letter)) {
                html += `<span class="letter revealed">${letter}</span>`;
            } else {
                html += '<span class="letter">_</span>';
            }
        }
        html += '</div>';

        // Keyboard
        html += '<div class="hangman-keyboard">';
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        for (const letter of alphabet) {
            const used = this.guessed.has(letter);
            const inWord = this.word.includes(letter);
            let status = '';
            if (used) status = inWord ? 'correct' : 'wrong';
            html += `<button class="hm-key ${status}" data-letter="${letter}" ${used ? 'disabled' : ''}>${letter}</button>`;
        }
        html += '</div>';

        if (this.gameOver) {
            html += `<div class="hangman-result ${this.won ? 'win' : 'lose'}">
                ${this.won ? '🎉 You Won!' : `💀 Game Over! The word was: ${this.word.toUpperCase()}`}
            </div>`;
        }

        html += '</div>';
        this.gameArea.innerHTML = html;

        if (!document.getElementById('hangman-styles')) {
            const style = document.createElement('style');
            style.id = 'hangman-styles';
            style.textContent = `
                .hangman-container { text-align: center; }
                .hangman-drawing { margin: 20px auto; }
                .hangman-drawing svg { max-width: 200px; height: auto; }
                .hangman-word { 
                    display: flex; gap: 8px; justify-content: center; 
                    margin: 20px 0; flex-wrap: wrap; 
                }
                .hangman-word .letter {
                    font-size: 28px; font-weight: bold;
                    min-width: 30px; text-transform: uppercase;
                    border-bottom: 3px solid currentColor;
                }
                .hangman-word .letter.revealed { color: #4CAF50; }
                .hangman-keyboard {
                    display: flex; flex-wrap: wrap; gap: 4px;
                    justify-content: center; max-width: 350px; margin: 0 auto;
                }
                .hm-key {
                    width: 32px; height: 38px;
                    border: none; border-radius: 4px;
                    background: #4a4a4a; color: white;
                    font-size: 16px; font-weight: bold; text-transform: uppercase;
                    cursor: pointer; transition: all 0.2s;
                }
                .hm-key:hover:not(:disabled) { background: #666; }
                .hm-key.correct { background: #4CAF50; }
                .hm-key.wrong { background: #f44336; opacity: 0.5; }
                .hm-key:disabled { cursor: not-allowed; }
                .hangman-result {
                    margin-top: 20px; padding: 15px;
                    border-radius: 8px; font-size: 18px; font-weight: bold;
                }
                .hangman-result.win { background: #4CAF50; color: white; }
                .hangman-result.lose { background: #f44336; color: white; }
            `;
            document.head.appendChild(style);
        }

        this.gameArea.querySelectorAll('.hm-key').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.disabled) {
                    this.guessLetter(btn.dataset.letter);
                }
            });
        });
    }

    getHangmanSVG() {
        const parts = [
            '<circle cx="100" cy="35" r="20" stroke="currentColor" stroke-width="3" fill="none"/>', // head
            '<line x1="100" y1="55" x2="100" y2="110" stroke="currentColor" stroke-width="3"/>', // body
            '<line x1="100" y1="70" x2="70" y2="95" stroke="currentColor" stroke-width="3"/>', // left arm
            '<line x1="100" y1="70" x2="130" y2="95" stroke="currentColor" stroke-width="3"/>', // right arm
            '<line x1="100" y1="110" x2="75" y2="150" stroke="currentColor" stroke-width="3"/>', // left leg
            '<line x1="100" y1="110" x2="125" y2="150" stroke="currentColor" stroke-width="3"/>' // right leg
        ];

        let svg = `<svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
            <!-- Gallows -->
            <line x1="20" y1="170" x2="80" y2="170" stroke="currentColor" stroke-width="3"/>
            <line x1="50" y1="170" x2="50" y2="10" stroke="currentColor" stroke-width="3"/>
            <line x1="50" y1="10" x2="100" y2="10" stroke="currentColor" stroke-width="3"/>
            <line x1="100" y1="10" x2="100" y2="15" stroke="currentColor" stroke-width="3"/>
        `;

        for (let i = 0; i < this.wrongGuesses && i < parts.length; i++) {
            svg += parts[i];
        }

        svg += '</svg>';
        return svg;
    }

    guessLetter(letter) {
        if (this.gameOver || this.guessed.has(letter)) return;

        this.guessed.add(letter);

        if (!this.word.includes(letter)) {
            this.wrongGuesses++;
            if (this.wrongGuesses >= this.maxWrong) {
                this.gameOver = true;
                app.showSnackbar(`Game Over! The word was ${this.word.toUpperCase()}`);
            }
        } else {
            // Check if won
            const allRevealed = [...this.word].every(l => this.guessed.has(l));
            if (allRevealed) {
                this.gameOver = true;
                this.won = true;
                app.showSnackbar('🎉 You guessed the word!');
            }
        }

        this.render();
    }

    cleanup() {
        document.removeEventListener('keydown', this.keyHandler);
    }
}
