// Wordle - Word guessing game
class Wordle {
    constructor() {
        this.name = 'Wordle';
        this.wordLength = 5;
        this.maxGuesses = 6;
        this.guesses = [];
        this.currentGuess = '';
        this.targetWord = '';
        this.gameOver = false;
        this.won = false;
        this.usedLetters = {};
        
        // Small embedded word list
        this.words = [
            'apple', 'beach', 'brain', 'bread', 'brick', 'brush', 'chain', 'chair', 'chalk',
            'charm', 'chase', 'cheap', 'chess', 'chest', 'chief', 'child', 'chill', 'china',
            'chips', 'chord', 'clamp', 'clash', 'class', 'clean', 'clear', 'climb', 'clock',
            'close', 'cloth', 'cloud', 'coach', 'coast', 'coral', 'couch', 'count', 'cover',
            'craft', 'crane', 'crash', 'crawl', 'crazy', 'cream', 'creek', 'creep', 'crest',
            'crime', 'crisp', 'cross', 'crowd', 'crown', 'crush', 'crust', 'curve', 'cycle',
            'dance', 'death', 'delta', 'depth', 'dirty', 'ditch', 'doubt', 'draft', 'drain',
            'drama', 'drank', 'drawn', 'dream', 'dress', 'dried', 'drift', 'drill', 'drink',
            'drive', 'drown', 'drunk', 'earth', 'email', 'empty', 'enjoy', 'enter', 'equal',
            'error', 'event', 'every', 'exact', 'extra', 'faint', 'faith', 'false', 'fancy',
            'fault', 'feast', 'fiber', 'field', 'fifth', 'fight', 'final', 'flame', 'flash',
            'fleet', 'flesh', 'float', 'flock', 'flood', 'floor', 'fluid', 'flush', 'focus',
            'force', 'forge', 'forth', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh',
            'front', 'frost', 'fruit', 'funny', 'ghost', 'giant', 'given', 'glass', 'gleam',
            'glide', 'globe', 'glory', 'glove', 'graft', 'grain', 'grand', 'grant', 'grape',
            'graph', 'grasp', 'grass', 'grave', 'great', 'greed', 'green', 'greet', 'grief',
            'grill', 'grind', 'groan', 'groom', 'gross', 'group', 'grove', 'growl', 'grown',
            'guard', 'guess', 'guest', 'guide', 'guild', 'guilt', 'habit', 'happy', 'harsh',
            'haste', 'hasn', 'haven', 'heart', 'heavy', 'hello', 'hence', 'honey', 'honor',
            'horse', 'hotel', 'house', 'human', 'humor', 'ideal', 'image', 'imply', 'index',
            'inner', 'input', 'issue', 'ivory', 'japan', 'jewel', 'joint', 'joker', 'jolly',
            'judge', 'juice', 'jumbo', 'kayak', 'knife', 'knock', 'known', 'label', 'labor',
            'large', 'laser', 'later', 'laugh', 'layer', 'learn', 'lease', 'least', 'leave',
            'legal', 'lemon', 'level', 'lever', 'light', 'limit', 'linen', 'liver', 'local',
            'lodge', 'logic', 'loose', 'loser', 'lover', 'lower', 'loyal', 'lucky', 'lunch',
            'magic', 'major', 'maker', 'march', 'marry', 'match', 'maybe', 'mayor', 'meant',
            'medal', 'media', 'melon', 'mercy', 'merge', 'merit', 'merry', 'metal', 'meter',
            'midst', 'might', 'minor', 'minus', 'mixed', 'model', 'money', 'month', 'moral',
            'motor', 'mount', 'mouse', 'mouth', 'movie', 'muddy', 'music', 'nasty', 'naval',
            'nerve', 'never', 'night', 'ninth', 'noble', 'noise', 'north', 'notch', 'noted',
            'novel', 'nurse', 'occur', 'ocean', 'offer', 'often', 'olive', 'onion', 'opera',
            'orbit', 'order', 'organ', 'other', 'ought', 'outer', 'owner', 'oxide', 'ozone',
            'paint', 'panel', 'panic', 'paper', 'party', 'pasta', 'patch', 'pause', 'peace',
            'peach', 'pearl', 'penny', 'perch', 'phase', 'phone', 'photo', 'piano', 'piece',
            'pilot', 'pinch', 'pitch', 'pizza', 'place', 'plain', 'plane', 'plant', 'plate',
            'plaza', 'plead', 'pluck', 'plumb', 'plus', 'point', 'polar', 'porch', 'pound',
            'power', 'press', 'price', 'pride', 'prime', 'print', 'prior', 'prize', 'probe',
            'proof', 'proud', 'prove', 'proxy', 'pulse', 'punch', 'pupil', 'purse', 'queen',
            'query', 'quest', 'quick', 'quiet', 'quite', 'quota', 'quote', 'radar', 'radio',
            'raise', 'rally', 'ranch', 'range', 'rapid', 'ratio', 'reach', 'react', 'ready',
            'realm', 'rebel', 'refer', 'relax', 'relay', 'reply', 'rider', 'ridge', 'rifle',
            'right', 'rigid', 'risky', 'rival', 'river', 'roast', 'robot', 'rocky', 'roman',
            'roost', 'rough', 'round', 'route', 'royal', 'rural', 'sadly', 'saint', 'salad',
            'salon', 'sandy', 'sauce', 'scale', 'scare', 'scene', 'scent', 'scope', 'score',
            'scout', 'scrap', 'sense', 'serve', 'seven', 'shade', 'shake', 'shall', 'shame',
            'shape', 'share', 'shark', 'sharp', 'sheep', 'sheer', 'sheet', 'shelf', 'shell',
            'shift', 'shine', 'shirt', 'shock', 'shoot', 'shore', 'short', 'shout', 'shown',
            'sight', 'sigma', 'silly', 'since', 'sixty', 'sized', 'skill', 'skull', 'slave',
            'sleep', 'slice', 'slide', 'slope', 'slump', 'small', 'smart', 'smell', 'smile',
            'smoke', 'snake', 'sneak', 'solar', 'solid', 'solve', 'sorry', 'sound', 'south',
            'space', 'spare', 'spark', 'speak', 'speed', 'spell', 'spend', 'spice', 'spill',
            'spine', 'spite', 'split', 'spoke', 'spoon', 'sport', 'spray', 'squad', 'stack',
            'staff', 'stage', 'stain', 'stake', 'stall', 'stamp', 'stand', 'stare', 'start',
            'state', 'steam', 'steel', 'steep', 'steer', 'stern', 'stick', 'stiff', 'still',
            'stock', 'stone', 'stood', 'stool', 'store', 'storm', 'story', 'stove', 'strap',
            'straw', 'strip', 'stuck', 'study', 'stuff', 'style', 'sugar', 'suite', 'sunny',
            'super', 'surge', 'swamp', 'swear', 'sweat', 'sweep', 'sweet', 'swift', 'swing',
            'sword', 'table', 'taken', 'taste', 'teach', 'teeth', 'tempo', 'thank', 'theme',
            'there', 'thick', 'thief', 'thing', 'think', 'third', 'thorn', 'those', 'three',
            'threw', 'throw', 'thumb', 'tiger', 'tight', 'timer', 'tired', 'title', 'toast',
            'today', 'token', 'tooth', 'topic', 'torch', 'total', 'touch', 'tough', 'tower',
            'track', 'trade', 'trail', 'train', 'trait', 'trash', 'treat', 'trend', 'trial',
            'tribe', 'trick', 'tried', 'troop', 'truck', 'truly', 'trunk', 'trust', 'truth',
            'twice', 'twist', 'ultra', 'uncle', 'under', 'union', 'unity', 'until', 'upper',
            'upset', 'urban', 'usage', 'usual', 'valid', 'value', 'vapor', 'vault', 'venue',
            'verse', 'video', 'vigor', 'viral', 'virus', 'visit', 'vital', 'vivid', 'vocal',
            'voice', 'voter', 'wagon', 'waist', 'watch', 'water', 'weary', 'weave', 'wedge',
            'weird', 'whale', 'wheat', 'wheel', 'where', 'which', 'while', 'white', 'whole',
            'whose', 'widow', 'width', 'wired', 'witch', 'woman', 'works', 'world', 'worry',
            'worse', 'worst', 'worth', 'would', 'wound', 'woven', 'wreck', 'wrist', 'write',
            'wrong', 'wrote', 'yacht', 'yield', 'young', 'yours', 'youth', 'zebra', 'zesty'
        ];
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
            if (e.key === 'Enter') {
                this.submitGuess();
            } else if (e.key === 'Backspace') {
                this.currentGuess = this.currentGuess.slice(0, -1);
                this.render();
            } else if (/^[a-zA-Z]$/.test(e.key) && this.currentGuess.length < this.wordLength) {
                this.currentGuess += e.key.toLowerCase();
                this.render();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    reset() {
        this.guesses = [];
        this.currentGuess = '';
        this.gameOver = false;
        this.won = false;
        this.usedLetters = {};
        this.targetWord = this.words[Math.floor(Math.random() * this.words.length)];
        this.render();
    }

    render() {
        this.controlsArea.innerHTML = `
            <button class="btn btn-primary" id="wordleReset">New Game</button>
        `;
        document.getElementById('wordleReset')?.addEventListener('click', () => this.reset());

        this.statusArea.textContent = this.gameOver ? 
            (this.won ? '🎉 You won!' : `The word was: ${this.targetWord.toUpperCase()}`) :
            `Guess ${this.guesses.length + 1}/${this.maxGuesses}`;

        let html = '<div class="wordle-board">';
        
        // Previous guesses
        for (const guess of this.guesses) {
            html += '<div class="wordle-row">';
            for (let i = 0; i < this.wordLength; i++) {
                const letter = guess.word[i];
                const status = guess.result[i];
                html += `<div class="wordle-cell ${status}">${letter}</div>`;
            }
            html += '</div>';
        }

        // Current guess
        if (!this.gameOver && this.guesses.length < this.maxGuesses) {
            html += '<div class="wordle-row current">';
            for (let i = 0; i < this.wordLength; i++) {
                const letter = this.currentGuess[i] || '';
                html += `<div class="wordle-cell">${letter}</div>`;
            }
            html += '</div>';
        }

        // Empty rows
        const remaining = this.maxGuesses - this.guesses.length - (this.gameOver ? 0 : 1);
        for (let r = 0; r < remaining; r++) {
            html += '<div class="wordle-row">';
            for (let i = 0; i < this.wordLength; i++) {
                html += '<div class="wordle-cell empty"></div>';
            }
            html += '</div>';
        }

        html += '</div>';

        // Keyboard
        html += '<div class="wordle-keyboard">';
        const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
        for (const row of rows) {
            html += '<div class="keyboard-row">';
            if (row === 'zxcvbnm') {
                html += '<button class="key-btn wide" data-key="Enter">↵</button>';
            }
            for (const letter of row) {
                const status = this.usedLetters[letter] || '';
                html += `<button class="key-btn ${status}" data-key="${letter}">${letter}</button>`;
            }
            if (row === 'zxcvbnm') {
                html += '<button class="key-btn wide" data-key="Backspace">⌫</button>';
            }
            html += '</div>';
        }
        html += '</div>';

        this.gameArea.innerHTML = html;

        if (!document.getElementById('wordle-styles')) {
            const style = document.createElement('style');
            style.id = 'wordle-styles';
            style.textContent = `
                .wordle-board { display: flex; flex-direction: column; gap: 6px; align-items: center; margin-bottom: 16px; }
                .wordle-row { display: flex; gap: 6px; }
                .wordle-cell {
                    width: 48px; height: 48px;
                    border: 2px solid #3a3a3c;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 24px; font-weight: bold; text-transform: uppercase;
                    transition: all 0.2s;
                }
                .wordle-cell.empty { border-color: #3a3a3c; }
                .wordle-cell.correct { background: #538d4e; border-color: #538d4e; color: white; }
                .wordle-cell.present { background: #b59f3b; border-color: #b59f3b; color: white; }
                .wordle-cell.absent { background: #3a3a3c; border-color: #3a3a3c; color: white; }
                .wordle-row.current .wordle-cell { border-color: #565758; }
                .wordle-keyboard { display: flex; flex-direction: column; gap: 6px; align-items: center; }
                .keyboard-row { display: flex; gap: 4px; }
                .key-btn {
                    min-width: 28px; height: 42px; padding: 0 6px;
                    border: none; border-radius: 4px;
                    background: #818384; color: white;
                    font-size: 14px; font-weight: bold; text-transform: uppercase;
                    cursor: pointer;
                }
                .key-btn.wide { min-width: 50px; font-size: 18px; }
                .key-btn.correct { background: #538d4e; }
                .key-btn.present { background: #b59f3b; }
                .key-btn.absent { background: #3a3a3c; }
            `;
            document.head.appendChild(style);
        }

        this.gameArea.querySelectorAll('.key-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                if (key === 'Enter') {
                    this.submitGuess();
                } else if (key === 'Backspace') {
                    this.currentGuess = this.currentGuess.slice(0, -1);
                    this.render();
                } else if (this.currentGuess.length < this.wordLength) {
                    this.currentGuess += key;
                    this.render();
                }
            });
        });
    }

    submitGuess() {
        if (this.gameOver) return;
        if (this.currentGuess.length !== this.wordLength) {
            app.showSnackbar('Not enough letters');
            return;
        }

        const result = [];
        const targetChars = [...this.targetWord];
        const guessChars = [...this.currentGuess];

        // First pass: mark correct
        for (let i = 0; i < this.wordLength; i++) {
            if (guessChars[i] === targetChars[i]) {
                result[i] = 'correct';
                targetChars[i] = null;
            }
        }

        // Second pass: mark present/absent
        for (let i = 0; i < this.wordLength; i++) {
            if (result[i]) continue;
            const idx = targetChars.indexOf(guessChars[i]);
            if (idx !== -1) {
                result[i] = 'present';
                targetChars[idx] = null;
            } else {
                result[i] = 'absent';
            }
        }

        // Update used letters
        for (let i = 0; i < this.wordLength; i++) {
            const letter = guessChars[i];
            const current = this.usedLetters[letter];
            if (result[i] === 'correct') {
                this.usedLetters[letter] = 'correct';
            } else if (result[i] === 'present' && current !== 'correct') {
                this.usedLetters[letter] = 'present';
            } else if (!current) {
                this.usedLetters[letter] = 'absent';
            }
        }

        this.guesses.push({ word: this.currentGuess, result });

        if (this.currentGuess === this.targetWord) {
            this.gameOver = true;
            this.won = true;
            app.showSnackbar(`🎉 You got it in ${this.guesses.length}!`);
        } else if (this.guesses.length >= this.maxGuesses) {
            this.gameOver = true;
            app.showSnackbar(`The word was ${this.targetWord.toUpperCase()}`);
        }

        this.currentGuess = '';
        this.render();
    }

    cleanup() {
        document.removeEventListener('keydown', this.keyHandler);
    }
}
