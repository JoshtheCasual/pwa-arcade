class Crossword {
    constructor() {
        this.name = 'Mini Crossword';
        this.puzzles = [
            {size:5,grid:[['H','E','L','L','O'],['A','#','O','#','N'],['S','T','A','R','E'],['T','#','N','#','S'],['E','D','G','E','S']],across:[{num:1,row:0,col:0,clue:'Greeting'},{num:5,row:2,col:0,clue:'Gaze fixedly'},{num:7,row:4,col:0,clue:'Borders or advantages'}],down:[{num:1,row:0,col:0,clue:'Rushed'},{num:2,row:0,col:2,clue:'Bank advance'},{num:3,row:0,col:3,clue:'Solitary'},{num:4,row:0,col:4,clue:'Beginning'}]},
            {size:5,grid:[['S','H','A','R','P'],['L','#','I','#','A'],['A','D','D','E','D'],['B','#','E','#','E'],['S','T','E','P','S']],across:[{num:1,row:0,col:0,clue:'Not dull'},{num:5,row:2,col:0,clue:'Included'},{num:7,row:4,col:0,clue:'Stair units'}],down:[{num:1,row:0,col:0,clue:'Concrete pieces'},{num:2,row:0,col:2,clue:'Helped'},{num:3,row:0,col:3,clue:'Raced'},{num:4,row:0,col:4,clue:'Speed'}]},
            {size:5,grid:[['C','L','A','S','S'],['R','#','I','#','H'],['A','D','M','I','T'],['B','#','E','#','E'],['S','T','E','E','L']],across:[{num:1,row:0,col:0,clue:'School group'},{num:5,row:2,col:0,clue:'Confess'},{num:7,row:4,col:0,clue:'Strong metal'}],down:[{num:1,row:0,col:0,clue:'Grab hold of'},{num:2,row:0,col:2,clue:'Target'},{num:3,row:0,col:3,clue:'Satin or silk'},{num:4,row:0,col:4,clue:'Paper of facts'}]},
            {size:5,grid:[['B','R','A','V','E'],['L','#','N','#','A'],['A','R','G','U','E'],['S','#','L','#','L'],['T','R','E','N','D']],across:[{num:1,row:0,col:0,clue:'Courageous'},{num:5,row:2,col:0,clue:'Debate'},{num:7,row:4,col:0,clue:'Fashion direction'}],down:[{num:1,row:0,col:0,clue:'Explosion'},{num:2,row:0,col:2,clue:'Geometric measure'},{num:3,row:0,col:3,clue:'Employ'},{num:4,row:0,col:4,clue:'Worship'}]},
            {size:5,grid:[['G','R','A','I','N'],['L','#','C','#','C'],['O','U','T','E','R'],['B','#','S','#','E'],['E','D','G','E','D']],across:[{num:1,row:0,col:0,clue:'Wheat or rice'},{num:5,row:2,col:0,clue:'External'},{num:7,row:4,col:0,clue:'Bordered'}],down:[{num:1,row:0,col:0,clue:'World sphere'},{num:2,row:0,col:2,clue:'Performing'},{num:3,row:0,col:3,clue:'Typed in'},{num:4,row:0,col:4,clue:'Higher up'}]},
            {size:5,grid:[['P','L','A','N','T'],['R','#','W','#','R'],['I','N','N','E','R'],['C','#','E','#','E'],['E','D','G','E','S']],across:[{num:1,row:0,col:0,clue:'Flora'},{num:5,row:2,col:0,clue:'Interior'},{num:7,row:4,col:0,clue:'Margins'}],down:[{num:1,row:0,col:0,clue:'Cost'},{num:2,row:0,col:2,clue:'Owned'},{num:3,row:0,col:3,clue:'Close by'},{num:4,row:0,col:4,clue:'Forest plants'}]},
            {size:5,grid:[['F','L','A','M','E'],['R','#','U','#','A'],['A','D','T','O','S'],['M','#','O','#','T'],['E','N','D','E','D']],across:[{num:1,row:0,col:0,clue:'Fire tongue'},{num:5,row:2,col:0,clue:'Car brand'},{num:7,row:4,col:0,clue:'Finished'}],down:[{num:1,row:0,col:0,clue:'Structure'},{num:2,row:0,col:2,clue:'Writer'},{num:3,row:0,col:3,clue:'Above'},{num:4,row:0,col:4,clue:'Expert'}]},
            {size:5,grid:[['S','C','O','R','E'],['T','#','A','#','A'],['A','L','K','A','L'],['I','#','S','#','L'],['R','U','S','H','Y']],across:[{num:1,row:0,col:0,clue:'Points total'},{num:5,row:2,col:0,clue:'Chemical base'},{num:7,row:4,col:0,clue:'Hasty and grassy'}],down:[{num:1,row:0,col:0,clue:'Stir up'},{num:2,row:0,col:2,clue:'Inquires'},{num:3,row:0,col:3,clue:'Swift bird'},{num:4,row:0,col:4,clue:'Truly'}]},
            {size:5,grid:[['C','R','A','N','E'],['O','#','D','#','V'],['A','S','D','L','E'],['S','#','E','#','N'],['T','R','A','I','N']],across:[{num:1,row:0,col:0,clue:'Tall bird'},{num:5,row:2,col:0,clue:'Added extra'},{num:7,row:4,col:0,clue:'Rail transport'}],down:[{num:1,row:0,col:0,clue:'Shoreline'},{num:2,row:0,col:2,clue:'Extra'},{num:3,row:0,col:3,clue:'Connect'},{num:4,row:0,col:4,clue:'Happening'}]},
            {size:5,grid:[['S','T','O','N','E'],['H','#','P','#','V'],['A','L','E','R','T'],['R','#','N','#','E'],['P','I','N','C','H']],across:[{num:1,row:0,col:0,clue:'Rock'},{num:5,row:2,col:0,clue:'Watchful'},{num:7,row:4,col:0,clue:'Small amount'}],down:[{num:1,row:0,col:0,clue:'Keen'},{num:2,row:0,col:2,clue:'Unlock'},{num:3,row:0,col:3,clue:'Existed'},{num:4,row:0,col:4,clue:'Skill'}]},
            {size:5,grid:[['D','R','I','V','E'],['U','#','R','#','V'],['S','T','A','R','E'],['T','#','T','#','N'],['S','H','E','L','L']],across:[{num:1,row:0,col:0,clue:'Operate a car'},{num:5,row:2,col:0,clue:'Look fixedly'},{num:7,row:4,col:0,clue:'Sea casing'}],down:[{num:1,row:0,col:0,clue:'Particles'},{num:2,row:0,col:2,clue:'Angry'},{num:3,row:0,col:3,clue:'Principle'},{num:4,row:0,col:4,clue:'Level'}]},
            {size:5,grid:[['L','I','G','H','T'],['E','#','R','#','R'],['A','S','I','L','L'],['F','#','N','#','E'],['S','P','E','N','D']],across:[{num:1,row:0,col:0,clue:'Not heavy'},{num:5,row:2,col:0,clue:'Window part'},{num:7,row:4,col:0,clue:'Use money'}],down:[{num:1,row:0,col:0,clue:'Single page'},{num:2,row:0,col:2,clue:'Smile widely'},{num:3,row:0,col:3,clue:'Small mountain'},{num:4,row:0,col:4,clue:'Forest path'}]},
            {size:5,grid:[['W','A','T','E','R'],['O','#','H','#','U'],['R','I','I','N','G'],['S','#','N','#','B'],['E','A','G','L','E']],across:[{num:1,row:0,col:0,clue:'H2O'},{num:5,row:2,col:0,clue:'Circle band'},{num:7,row:4,col:0,clue:'Large bird'}],down:[{num:1,row:0,col:0,clue:'More bad'},{num:2,row:0,col:2,clue:'Object'},{num:3,row:0,col:3,clue:'Fused'},{num:4,row:0,col:4,clue:'Sport'}]},
            {size:5,grid:[['C','H','A','R','M'],['L','#','N','#','O'],['E','M','I','S','S'],['A','#','M','#','S'],['N','A','E','L','Y']],across:[{num:1,row:0,col:0,clue:'Appeal'},{num:5,row:2,col:0,clue:'Release'},{num:7,row:4,col:0,clue:'Almost'}],down:[{num:1,row:0,col:0,clue:'Tidy'},{num:2,row:0,col:2,clue:'Cartoon'},{num:3,row:0,col:3,clue:'Red planet'},{num:4,row:0,col:4,clue:'Covered with plants'}]},
            {size:5,grid:[['Q','U','I','L','T'],['U','#','N','#','R'],['E','X','I','S','T'],['S','#','T','#','E'],['T','A','S','T','E']],across:[{num:1,row:0,col:0,clue:'Bed cover'},{num:5,row:2,col:0,clue:'Be real'},{num:7,row:4,col:0,clue:'Flavor'}],down:[{num:1,row:0,col:0,clue:'Line up'},{num:2,row:0,col:2,clue:'Start'},{num:3,row:0,col:3,clue:'Least amount'},{num:4,row:0,col:4,clue:'Handle'}]},
            {size:5,grid:[['B','L','O','C','K'],['R','#','A','#','N'],['I','D','L','E','R'],['N','#','S','#','E'],['G','R','A','S','P']],across:[{num:1,row:0,col:0,clue:'Obstruct'},{num:5,row:2,col:0,clue:'Lazy person'},{num:7,row:4,col:0,clue:'Understand'}],down:[{num:1,row:0,col:0,clue:'Edge of cliff'},{num:2,row:0,col:2,clue:'Targets'},{num:3,row:0,col:3,clue:'Comfort'},{num:4,row:0,col:4,clue:'Sharp'}]},
            {size:5,grid:[['T','R','A','C','E'],['H','#','N','#','X'],['I','N','G','O','T'],['R','#','E','#','R'],['D','R','A','I','N']],across:[{num:1,row:0,col:0,clue:'Find'},{num:5,row:2,col:0,clue:'Metal bar'},{num:7,row:4,col:0,clue:'Empty water'}],down:[{num:1,row:0,col:0,clue:'The third'},{num:2,row:0,col:2,clue:'Fury'},{num:3,row:0,col:3,clue:'Gold coin'},{num:4,row:0,col:4,clue:'Addition'}]},
            {size:5,grid:[['S','P','A','R','K'],['L','#','R','#','N'],['I','D','E','A','L'],['D','#','N','#','E'],['E','V','A','D','E']],across:[{num:1,row:0,col:0,clue:'Flash'},{num:5,row:2,col:0,clue:'Perfect'},{num:7,row:4,col:0,clue:'Escape'}],down:[{num:1,row:0,col:0,clue:'Glide on ice'},{num:2,row:0,col:2,clue:'Field'},{num:3,row:0,col:3,clue:'Grew older'},{num:4,row:0,col:4,clue:'Bend down'}]},
            {size:5,grid:[['F','R','O','N','T'],['L','#','P','#','O'],['A','T','E','A','M'],['S','#','N','#','B'],['H','O','S','T','S']],across:[{num:1,row:0,col:0,clue:'Forward part'},{num:5,row:2,col:0,clue:'Group'},{num:7,row:4,col:0,clue:'Party givers'}],down:[{num:1,row:0,col:0,clue:'Quick light'},{num:2,row:0,col:2,clue:'Unlock'},{num:3,row:0,col:3,clue:'Tidy'},{num:4,row:0,col:4,clue:'Grave marker'}]},
            {size:5,grid:[['P','R','I','Z','E'],['L','#','V','#','A'],['A','S','I','D','E'],['N','#','D','#','L'],['E','D','G','E','S']],across:[{num:1,row:0,col:0,clue:'Award'},{num:5,row:2,col:0,clue:'To one side'},{num:7,row:4,col:0,clue:'Borders'}],down:[{num:1,row:0,col:0,clue:'Airplane'},{num:2,row:0,col:2,clue:'Bright'},{num:3,row:0,col:3,clue:'Arid'},{num:4,row:0,col:4,clue:'Weasel kin'}]}
        ];
        this.puzzleIndex = 0;
        this.currentPuzzle = null;
        this.grid = [];
        this.clues = { across: [], down: [] };
        this.selectedCell = null;
        this.direction = 'across';
        this.solved = new Set(JSON.parse(localStorage.getItem('crossword-solved') || '[]'));
        this.won = false;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        // Pick an unsolved puzzle or random
        const unsolved = this.puzzles.findIndex((_, i) => !this.solved.has(i));
        this.puzzleIndex = unsolved >= 0 ? unsolved : Math.floor(Math.random() * this.puzzles.length);
        this.reset();
    }

    reset() {
        this.won = false;
        this.currentPuzzle = this.puzzles[this.puzzleIndex];
        this.clues = { across: this.currentPuzzle.across, down: this.currentPuzzle.down };
        this.grid = [];
        for (let r = 0; r < 5; r++) {
            const row = [];
            for (let c = 0; c < 5; c++) {
                const letter = this.currentPuzzle.grid[r][c];
                row.push({
                    letter: letter,
                    isBlack: letter === '#',
                    userLetter: '',
                    given: false
                });
            }
            this.grid.push(row);
        }
        this.selectedCell = this.findFirstWhite();
        this.direction = 'across';
        this.setupInput();
        this.render();
    }

    findFirstWhite() {
        for (let r = 0; r < 5; r++)
            for (let c = 0; c < 5; c++)
                if (!this.grid[r][c].isBlack) return [r, c];
        return [0, 0];
    }

    setupInput() {
        if (this._onKey) document.removeEventListener('keydown', this._onKey);
        this._onKey = (e) => {
            if (this.won) return;
            if (!this.selectedCell) return;
            const [r, c] = this.selectedCell;

            if (e.key === 'ArrowUp') { this.moveSelection(-1, 0); e.preventDefault(); }
            else if (e.key === 'ArrowDown') { this.moveSelection(1, 0); e.preventDefault(); }
            else if (e.key === 'ArrowLeft') { this.moveSelection(0, -1); e.preventDefault(); }
            else if (e.key === 'ArrowRight') { this.moveSelection(0, 1); e.preventDefault(); }
            else if (e.key === 'Tab') { this.direction = this.direction === 'across' ? 'down' : 'across'; e.preventDefault(); this.render(); }
            else if (e.key === 'Backspace') {
                this.grid[r][c].userLetter = '';
                this.advanceCursor(-1);
                e.preventDefault();
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                this.grid[r][c].userLetter = e.key.toUpperCase();
                this.advanceCursor(1);
                this.checkWin();
            }
        };
        document.addEventListener('keydown', this._onKey);
    }

    moveSelection(dr, dc) {
        if (!this.selectedCell) return;
        let [r, c] = this.selectedCell;
        r += dr; c += dc;
        while (r >= 0 && r < 5 && c >= 0 && c < 5) {
            if (!this.grid[r][c].isBlack) { this.selectedCell = [r, c]; this.render(); return; }
            r += dr; c += dc;
        }
    }

    advanceCursor(dir) {
        if (!this.selectedCell) return;
        let [r, c] = this.selectedCell;
        if (this.direction === 'across') c += dir; else r += dir;
        if (r >= 0 && r < 5 && c >= 0 && c < 5 && !this.grid[r][c].isBlack) {
            this.selectedCell = [r, c];
        }
        this.render();
    }

    getCurrentWord() {
        if (!this.selectedCell) return [];
        const [r, c] = this.selectedCell;
        const cells = [];
        if (this.direction === 'across') {
            let start = c;
            while (start > 0 && !this.grid[r][start - 1].isBlack) start--;
            for (let cc = start; cc < 5 && !this.grid[r][cc].isBlack; cc++) cells.push([r, cc]);
        } else {
            let start = r;
            while (start > 0 && !this.grid[start - 1][c].isBlack) start--;
            for (let rr = start; rr < 5 && !this.grid[rr][c].isBlack; rr++) cells.push([rr, c]);
        }
        return cells;
    }

    getCellNumber(r, c) {
        // Check if this cell starts an across or down word
        const isAcrossStart = (c === 0 || this.grid[r][c - 1].isBlack) && c < 4 && !this.grid[r][c + 1]?.isBlack;
        const isDownStart = (r === 0 || this.grid[r - 1][c].isBlack) && r < 4 && !this.grid[r + 1]?.[c]?.isBlack;
        if (!isAcrossStart && !isDownStart) return null;

        let num = 1;
        for (let rr = 0; rr < 5; rr++) {
            for (let cc = 0; cc < 5; cc++) {
                if (this.grid[rr][cc].isBlack) continue;
                const as = (cc === 0 || this.grid[rr][cc - 1].isBlack) && cc < 4 && !this.grid[rr][cc + 1]?.isBlack;
                const ds = (rr === 0 || this.grid[rr - 1]?.[cc]?.isBlack) && rr < 4 && !this.grid[rr + 1]?.[cc]?.isBlack;
                if (as || ds) {
                    if (rr === r && cc === c) return num;
                    num++;
                }
            }
        }
        return null;
    }

    checkWin() {
        for (let r = 0; r < 5; r++)
            for (let c = 0; c < 5; c++)
                if (!this.grid[r][c].isBlack && this.grid[r][c].userLetter !== this.grid[r][c].letter)
                    return;
        this.won = true;
        this.solved.add(this.puzzleIndex);
        localStorage.setItem('crossword-solved', JSON.stringify([...this.solved]));
        app.showSnackbar('Crossword solved!');
        this.render();
    }

    render() {
        const cellSize = 52;
        const wordCells = this.getCurrentWord();
        const wordSet = new Set(wordCells.map(([r, c]) => `${r},${c}`));

        let html = '<div style="margin:0 auto;width:fit-content;font-family:\'Fredoka\',sans-serif;">';

        // Grid
        html += `<div style="display:grid;grid-template-columns:repeat(5,${cellSize}px);gap:2px;margin-bottom:12px;">`;
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const cell = this.grid[r][c];
                if (cell.isBlack) {
                    html += `<div style="width:${cellSize}px;height:${cellSize}px;background:var(--text);border-radius:4px;"></div>`;
                    continue;
                }
                const isSel = this.selectedCell && this.selectedCell[0] === r && this.selectedCell[1] === c;
                const inWord = wordSet.has(`${r},${c}`);
                const num = this.getCellNumber(r, c);

                let bg = 'var(--cream)';
                if (isSel) bg = '#fbbf24';
                else if (inWord) bg = '#fef3c7';

                html += `<div data-r="${r}" data-c="${c}" style="
                    width:${cellSize}px;height:${cellSize}px;background:${bg};
                    border-radius:4px;position:relative;cursor:pointer;
                    display:flex;align-items:center;justify-content:center;
                    font-size:22px;font-weight:600;color:var(--text);
                    box-shadow:0 1px 3px var(--shadow-soft);
                ">`;
                if (num) html += `<span style="position:absolute;top:2px;left:4px;font-size:9px;font-weight:700;color:var(--text-light);">${num}</span>`;
                html += cell.userLetter || '';
                html += '</div>';
            }
        }
        html += '</div>';

        // Clues
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px;max-width:320px;margin:0 auto;">';
        html += '<div><strong>Across</strong>';
        for (const clue of this.clues.across) {
            html += `<div style="margin:2px 0;color:var(--text-light);">${clue.num}. ${clue.clue}</div>`;
        }
        html += '</div><div><strong>Down</strong>';
        for (const clue of this.clues.down) {
            html += `<div style="margin:2px 0;color:var(--text-light);">${clue.num}. ${clue.clue}</div>`;
        }
        html += '</div></div>';

        if (this.won) {
            html += '<div style="text-align:center;margin-top:12px;font-size:18px;color:var(--mint-deep);">Solved! 🎉</div>';
        }

        html += '</div>';

        this.statusArea.innerHTML = `<div style="font-family:'Fredoka',sans-serif;text-align:center;">Puzzle ${this.puzzleIndex + 1}/${this.puzzles.length} | ${this.direction === 'across' ? '→ Across' : '↓ Down'}</div>`;
        this.gameArea.innerHTML = html;

        this.gameArea.querySelectorAll('[data-r]').forEach(el => {
            el.addEventListener('click', () => {
                const r = parseInt(el.dataset.r), c = parseInt(el.dataset.c);
                if (this.selectedCell && this.selectedCell[0] === r && this.selectedCell[1] === c) {
                    this.direction = this.direction === 'across' ? 'down' : 'across';
                }
                this.selectedCell = [r, c];
                this.render();
            });
        });

        this.controlsArea.innerHTML = `
            <button class="btn btn-outline" id="cw-reveal">Reveal Word</button>
            <button class="btn btn-primary" id="cw-next">Next Puzzle</button>
        `;
        document.getElementById('cw-reveal').addEventListener('click', () => {
            const word = this.getCurrentWord();
            for (const [r, c] of word) {
                this.grid[r][c].userLetter = this.grid[r][c].letter;
            }
            this.checkWin();
            this.render();
        });
        document.getElementById('cw-next').addEventListener('click', () => {
            this.puzzleIndex = (this.puzzleIndex + 1) % this.puzzles.length;
            this.reset();
        });
    }

    cleanup() {
        if (this._onKey) { document.removeEventListener('keydown', this._onKey); this._onKey = null; }
        this.gameArea.innerHTML = '';
        this.statusArea.innerHTML = '';
        this.controlsArea.innerHTML = '';
    }
}
