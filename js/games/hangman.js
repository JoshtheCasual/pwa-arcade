// Hangman - Word guessing game
class Hangman {
    constructor() {
        this.name = 'Hangman';
        this.categories = {
            animals: ['elephant', 'giraffe', 'penguin', 'dolphin', 'butterfly', 'kangaroo', 'octopus', 'squirrel'],
            countries: ['australia', 'brazil', 'canada', 'germany', 'japan', 'mexico', 'norway', 'thailand'],
            food: ['pizza', 'hamburger', 'spaghetti', 'chocolate', 'avocado', 'strawberry', 'pancakes', 'sandwich'],
            movies: ['avatar', 'titanic', 'inception', 'gladiator', 'frozen', 'jaws', 'matrix', 'shrek'],
            sports: ['basketball', 'football', 'swimming', 'tennis', 'volleyball', 'baseball', 'hockey', 'golf']
        };
        this.category = 'animals';
        this.word = '';
        this.guessed = new Set();
        this.wrongGuesses = 0;
        this.maxWrong = 6;
        this.gameOver = false;
        this.won = false;
    }
    
    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.reset();
    }
    
    reset() {
        const words = this.categories[this.category];
        this.word = words[Math.floor(Math.random() * words.length)].toUpperCase();
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
            <button class="btn btn-primary" style="margin-top: 12px;" id="hmReset">New Word</button>
        `;
        
        this.controlsArea.querySelectorAll('[data-cat]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.category = btn.dataset.cat;
                this.reset();
            });
        });
        
        document.getElementById('hmReset')?.addEventListener('click', () => this.reset());
        
        this.statusArea.textContent = this.gameOver ? 
            (this.won ? '🎉 You won!' : `The word was: ${this.word}`) :
            `Category: ${this.category.charAt(0).toUpperCase() + this.category.slice(1)}`;
        
        const displayWord = this.word.split('').map(letter => 
            this.guessed.has(letter) ? letter : '_'
        ).join(' ');
        
        let html = `
            <div class="hm-container">
                <div class="hm-drawing">
                    <svg viewBox="0 0 200 200" class="hangman-svg">
                        <!-- Gallows -->
                        <line x1="40" y1="180" x2="160" y2="180" stroke="var(--text-primary)" stroke-width="4"/>
                        <line x1="60" y1="180" x2="60" y2="20" stroke="var(--text-primary)" stroke-width="4"/>
                        <line x1="60" y1="20" x2="130" y2="20" stroke="var(--text-primary)" stroke-width="4"/>
                        <line x1="130" y1="20" x2="130" y2="40" stroke="var(--text-primary)" stroke-width="4"/>
                        
                        <!-- Body parts -->
                        ${this.wrongGuesses >= 1 ? '<circle cx="130" cy="55" r="15" stroke="var(--text-primary)" stroke-width="3" fill="none"/>' : ''}
                        ${this.wrongGuesses >= 2 ? '<line x1="130" y1="70" x2="130" y2="120" stroke="var(--text-primary)" stroke-width="3"/>' : ''}
                        ${this.wrongGuesses >= 3 ? '<line x1="130" y1="85" x2="105" y2="105" stroke="var(--text-primary)" stroke-width="3"/>' : ''}
                        ${this.wrongGuesses >= 4 ? '<line x1="130" y1="85" x2="155" y2="105" stroke="var(--text-primary)" stroke-width="3"/>' : ''}
                        ${this.wrongGuesses >= 5 ? '<line x1="130" y1="120" x2="110" y2="155" stroke="var(--text-primary)" stroke-width="3"/>' : ''}
                        ${this.wrongGuesses >= 6 ? '<line x1="130" y1="120" x2="150" y2="155" stroke="var(--text-primary)" stroke-width="3"/>' : ''}
                    </svg>
                </div>
                
                <div class="hm-word">${displayWord}</div>
                
                <div class="hm-keyboard">
                    ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
                        const used = this.guessed.has(letter);
                        const correct = this.word.includes(letter);
                        let btnClass = 'hm-key';
                        if (used) btnClass += correct ? ' correct' : ' wrong';
                        if (this.gameOver) btnClass += ' disabled';
                        return `<button class="${btnClass}" data-letter="${letter}" ${used || this.gameOver ? 'disabled' : ''}>${letter}</button>`;
                    }).join('')}
                </div>
                
                <div class="hm-lives">
                    ${'❤️'.repeat(this.maxWrong - this.wrongGuesses)}${'🖤'.repeat(this.wrongGuesses)}
                </div>
            </div>
            <style>
                .hm-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    padding: 10px;
                }
                .hm-drawing {
                    width: 180px;
                    height: 180px;
                }
                .hangman-svg {
                    width: 100%;
                    height: 100%;
                }
                .hm-word {
                    font-family: 'Fredoka', monospace;
                    font-size: 28px;
                    letter-spacing: 4px;
                    color: var(--text-primary);
                }
                .hm-keyboard {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 6px;
                    max-width: 340px;
                }
                .hm-key {
                    width: 36px;
                    height: 40px;
                    border: none;
                    border-radius: 8px;
                    background: var(--card-bg);
                    color: var(--text-primary);
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    box-shadow: var(--shadow);
                }
                .hm-key:hover:not(:disabled) {
                    transform: translateY(-2px);
                    background: var(--bg-secondary);
                }
                .hm-key.correct {
                    background: #22c55e;
                    color: white;
                }
                .hm-key.wrong {
                    background: #ef4444;
                    color: white;
                }
                .hm-key.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .hm-lives {
                    font-size: 24px;
                }
            </style>
        `;
        
        this.gameArea.innerHTML = html;
        
        this.gameArea.querySelectorAll('.hm-key').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.gameOver) {
                    this.guess(btn.dataset.letter);
                }
            });
        });
    }
    
    guess(letter) {
        if (this.guessed.has(letter) || this.gameOver) return;
        
        this.guessed.add(letter);
        
        if (!this.word.includes(letter)) {
            this.wrongGuesses++;
            if (this.wrongGuesses >= this.maxWrong) {
                this.gameOver = true;
                app.showSnackbar(`Game Over! The word was: ${this.word}`);
            }
        } else {
            // Check win
            const allGuessed = this.word.split('').every(l => this.guessed.has(l));
            if (allGuessed) {
                this.gameOver = true;
                this.won = true;
                app.showSnackbar('🎉 You won!');
            }
        }
        
        this.render();
    }
    
    cleanup() {}
}
