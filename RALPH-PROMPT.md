```
--max-iterations 30
```

**Prompt:**

You are implementing 12 new games for the PWA Arcade project. Each iteration, check PROGRESS.md for what's done and pick up the next incomplete game. Work on ONE game per iteration fully, then update PROGRESS.md and stop.

## FIRST: Check Progress

Read `PROGRESS.md` in the project root. If it doesn't exist, create it with this template:

```markdown
# PWA Arcade — Game Implementation Progress

## Games
- [ ] 1. Lights Out
- [ ] 2. Sliding Puzzle
- [ ] 3. Pong
- [ ] 4. Flappy Bird
- [ ] 5. Dots and Boxes
- [ ] 6. Mancala
- [ ] 7. Space Invaders
- [ ] 8. Asteroids
- [ ] 9. Freecell
- [ ] 10. Sudoku
- [ ] 11. Boggle
- [ ] 12. Nonogram
- [ ] 13. Mini Crossword

## Integration
- [ ] sw.js cache version bumped and all 13 entries added
- [ ] Category counts updated in index.html
- [ ] All CSS icon gradients added to css/style.css
```

If ALL game checkboxes AND integration items show `[x]`, output `<promise>ALL_GAMES_COMPLETE</promise>` and stop.

Otherwise, find the first unchecked `[ ]` game and implement it using the specs below.

## PER-GAME WORKFLOW

For each game, do these steps in order:

### Step 1: Create the game JS file
Create `js/games/{gameid}.js` with the full class implementation per the spec below.

### Step 2: Add HTML card to index.html
Add the game card HTML inside the correct category section in `index.html`. The card format is:
```html
<div class="game-card-mini" data-game="{gameid}">
    <div class="game-icon {gameid}"><span class="material-icons-round">{icon}</span></div>
    <h3>{Game Name}</h3>
</div>
```

### Step 3: Add script tag to index.html
Add `<script src="js/games/{gameid}.js"></script>` BEFORE the `app.js` script tag.

### Step 4: Register in app.js
Add `if (typeof {ClassName} !== 'undefined') this.games.{gameid} = new {ClassName}();` in the `registerGames()` method under the appropriate category comment.

### Step 5: Add to sw.js cache
Add `'/js/games/{gameid}.js',` to the files array in `sw.js`.

### Step 6: Add CSS icon gradient
Add `.game-icon.{gameid} { background: linear-gradient(135deg, {color1}, {color2}); }` to `css/style.css`.

### Step 7: Verify
- Confirm the JS file exists and defines the class
- Confirm the HTML card is in index.html
- Confirm the script tag is in index.html
- Confirm the registration line is in app.js
- Confirm the sw.js cache entry exists
- Confirm the CSS gradient exists

### Step 8: Update PROGRESS.md
Mark the game as `[x]` in PROGRESS.md.

### Step 9: After the LAST game (Mini Crossword)
Do the integration tasks:
- Bump `CACHE_NAME` in sw.js from current version to next version (e.g. `'pwa-arcade-v4'` → `'pwa-arcade-v5'`)
- Update category counts in index.html:
  - Strategy: 6 → 8 games
  - Puzzle: 3 → 7 games
  - Word: 2 → 4 games
  - Arcade: 3 → 7 games
  - Card: 2 → 3 games
- Verify all 13 CSS icon gradients are in style.css
- Mark all integration items as `[x]` in PROGRESS.md
- Output `<promise>ALL_GAMES_COMPLETE</promise>`

---

## FULL GAME SPECS

### Game 1: Lights Out
- **File:** `js/games/lightsout.js` | **Class:** `LightsOut` | **Category:** Puzzle
- **Icon:** `lightbulb` | **Gradient:** `#FBBF24, #F59E0B`
- **app.js:** `if (typeof LightsOut !== 'undefined') this.games.lightsout = new LightsOut();` (under Puzzle, after minesweeper)
- **State:** `name='Lights Out'`, `size=5` (5×5 grid), `grid=[]` (2D booleans, true=on), `moves=0`, `level=1`, `won=false`
- **Methods:** `constructor()`, `init(gameArea, statusArea, controlsArea)`, `reset()`, `generatePuzzle()`, `toggleCell(row, col)`, `checkWin()`, `render()`, `cleanup()`
- **Algorithm:** `generatePuzzle()`: start all-off, apply `level+4` random toggles (ensures solvability). `toggleCell(r,c)`: flip cell + 4 orthogonal neighbors (if in bounds). `checkWin()`: `grid.every(row => row.every(cell => !cell))`. Render as 5×5 buttons with class `light-on`/`light-off`, glow via `box-shadow: 0 0 15px #fbbf24`.

### Game 2: Sliding Puzzle
- **File:** `js/games/slidingpuzzle.js` | **Class:** `SlidingPuzzle` | **Category:** Puzzle
- **Icon:** `view_module` | **Gradient:** `#14b8a6, #0d9488`
- **app.js:** `if (typeof SlidingPuzzle !== 'undefined') this.games.slidingpuzzle = new SlidingPuzzle();` (under Puzzle)
- **State:** `name='Sliding Puzzle'`, `size=4`, `tiles=[]` (1D, 0=empty), `moves=0`, `timer=null`, `seconds=0`, `won=false`
- **Algorithm:** `shuffle()`: Fisher-Yates on `[1..N²,0]`, check `isSolvable()` (count inversions; odd grid: even inversions=solvable; even grid: inversions+empty-row-from-bottom must be odd). If not solvable, swap first two non-zero. `moveTile(index)`: if adjacent to empty, swap. `isAdjacent(i,j)`: same row `|col diff|===1` or same col `|row diff|===1`. Mode selector for 3×3/4×4/5×5. CSS `transition: transform 0.15s ease`.

### Game 3: Pong
- **File:** `js/games/pong.js` | **Class:** `Pong` | **Category:** Arcade
- **Icon:** `sports_esports` | **Gradient:** `#64748b, #475569`
- **app.js:** `if (typeof Pong !== 'undefined') this.games.pong = new Pong();` (under Arcade, after tetris)
- **State:** `name='Pong'`, canvas 400×300, paddle 10×60, ball size 8, playerY/aiY, ballX/Y/VX/VY, playerScore/aiScore, difficulty='medium', gameLoop, gameOver, paused, keysDown
- **Algorithm:** AI moves toward ball Y at speed easy=2/medium=3.5/hard=5 + slight randomness. Ball bounces off top/bottom (invert VY), paddles (invert VX + spin from hit position). Ball past edge = opponent scores. Ball speed +0.5 per paddle hit, cap 10. Win at 11 points. Touch: track Y on canvas. Mode selector for difficulty.

### Game 4: Flappy Bird
- **File:** `js/games/flappy.js` | **Class:** `FlappyBird` | **Category:** Arcade
- **Icon:** `flutter_dash` | **Gradient:** `#facc15, #84cc16`
- **app.js:** `if (typeof FlappyBird !== 'undefined') this.games.flappy = new FlappyBird();` (under Arcade)
- **State:** `name='Flappy Bird'`, canvas 320×480, birdX=80, birdY/birdVY, gravity=0.4, flapStrength=-7, pipes=[{x,gapY,passed}], pipeWidth=50, pipeGap=140, pipeSpeed=2, score, highScore (localStorage 'flappy-high'), gameOver, started, gameLoop
- **Algorithm:** Gravity: `birdVY += gravity; birdY += birdVY`. Flap: `birdVY = flapStrength`. Pipe spawn every ~90 frames, gapY random 80..height-gap-80. Collision: circle ~15px vs pipe rects, Y bounds. Score when pipe passes bird. Speed: `pipeSpeed += 0.001/frame`, cap 4. Green pipes, yellow bird circle, sky blue bg. "Tap to Start" overlay.

### Game 5: Dots and Boxes
- **File:** `js/games/dotsandboxes.js` | **Class:** `DotsAndBoxes` | **Category:** Strategy
- **Icon:** `grid_4x4` | **Gradient:** `#f472b6, #db2777`
- **app.js:** `if (typeof DotsAndBoxes !== 'undefined') this.games.dotsandboxes = new DotsAndBoxes();` (under Strategy, after battleship)
- **State:** `name='Dots and Boxes'`, gridSize=4 (4×4 dots = 3×3 boxes), edges={} ('r,c,dir' → playerNum), boxes={} ('r,c' → playerNum), currentPlayer=1, scores={1:0,2:0}, mode='ai', gameOver
- **Algorithm:** Edges: horizontal 'r,c,h' (below dot), vertical 'r,c,v' (right of dot). `checkBoxes(edge)`: check 1-2 bordered boxes, complete when all 4 edges exist → claim + extra turn. AI: (1) complete box, (2) avoid 3rd edge, (3) random. Render with DOM: dots as circles, edges as clickable areas, boxes as colored squares.

### Game 6: Mancala
- **File:** `js/games/mancala.js` | **Class:** `Mancala` | **Category:** Strategy
- **Icon:** `egg` | **Gradient:** `#a78bfa, #7c3aed`
- **app.js:** `if (typeof Mancala !== 'undefined') this.games.mancala = new Mancala();` (under Strategy)
- **State:** `name='Mancala'`, pits=[14] (0-5=P1 pits, 6=P1 store, 7-12=P2 pits, 13=P2 store), each pit starts 4 stones, currentPlayer=1, mode='ai', gameOver, lastMove
- **Algorithm:** `sowStones(pit)`: pick up all stones, distribute counter-clockwise skipping opponent store. Last stone in own store → extra turn. Last stone in own empty pit → capture + opposite stones. Opposite: `12-i`. Game ends when one side empty → collect remaining. AI: (1) end in store, (2) capture, (3) most stones. Oval board layout, two rows of 6 pits + stores on sides.

### Game 7: Space Invaders
- **File:** `js/games/spaceinvaders.js` | **Class:** `SpaceInvaders` | **Category:** Arcade
- **Icon:** `rocket_launch` | **Gradient:** `#6366f1, #4f46e5`
- **app.js:** `if (typeof SpaceInvaders !== 'undefined') this.games.spaceinvaders = new SpaceInvaders();` (under Arcade)
- **State:** `name='Space Invaders'`, canvas 400×500, player={x:200,y:460,w:30,h:16}, aliens=[] (5×8, {x,y,type,alive}), playerBullets/alienBullets, shields=[4, {x,y,health}], alienDir=1, alienSpeed=1, score, highScore ('spaceinvaders-high'), lives=3, wave=1, gameOver, gameLoop, keysDown
- **Algorithm:** Alien grid 5×8, row points: 30/20/20/10/10. Move all by speed×dir; edge hit → down 10px + reverse. Speed = `1+(40-aliveCount)*0.05`. Alien shoots every ~60 frames from bottom of column. 4 shields with 3×5 sub-cells with health. Wave: all dead → wave++, speed+=0.3. Geometric shapes per row.

### Game 8: Asteroids
- **File:** `js/games/asteroids.js` | **Class:** `Asteroids` | **Category:** Arcade
- **Icon:** `auto_awesome` | **Gradient:** `#1e293b, #0f172a`
- **app.js:** `if (typeof Asteroids !== 'undefined') this.games.asteroids = new Asteroids();` (under Arcade)
- **State:** `name='Asteroids'`, canvas 400×400, ship={x:200,y:200,angle:0,vx:0,vy:0,invincible,invincibleTimer}, asteroids=[{x,y,vx,vy,size,vertices}], bullets=[{x,y,vx,vy,life}], score, highScore ('asteroids-high'), lives=3, wave=1, gameOver, gameLoop, keysDown
- **Algorithm:** Ship thrust: `vx += cos(angle)*power; vy += sin(angle)*power`, friction `*=0.99`. Screen wrap. Asteroid vertices: 8-12 random radii around base (large=40, medium=20, small=10). Split: large→2 medium (20pts), medium→2 small (50pts), small→destroy (100pts). Circle collision. Line-art style: white on dark. Respawn with brief invincibility.

### Game 9: Freecell
- **File:** `js/games/freecell.js` | **Class:** `Freecell` | **Category:** Card
- **Icon:** `table_rows` | **Gradient:** `#0ea5e9, #0284c7`
- **app.js:** `if (typeof Freecell !== 'undefined') this.games.freecell = new Freecell();` (under Card, after blackjack)
- **State:** `name='Freecell'`, tableau=8 columns, freeCells=[4 nulls], foundations={hearts/diamonds/clubs/spades:[]}, selected=null, history=[], gameNumber=1, won
- **Algorithm:** Deal with seeded PRNG (LCG: `seed = (seed*214013+2531011) & 0x7fffffff`), 52 cards into 8 cols (first 4 get 7, last 4 get 6). Supermove: `(emptyFree+1)*2^(emptyCols)` max stack size. Auto-foundation: move card if value ≤ min opposite color foundation + 1. Tableau: descending, alternating color. Foundation: ascending from Ace. Reuse solitaire card styling (suit symbols, red/black, stacked offset). Undo support.

### Game 10: Sudoku
- **File:** `js/games/sudoku.js` | **Class:** `Sudoku` | **Category:** Puzzle
- **Icon:** `grid_on` | **Gradient:** `#2563eb, #1d4ed8`
- **app.js:** `if (typeof Sudoku !== 'undefined') this.games.sudoku = new Sudoku();` (under Puzzle)
- **State:** `name='Sudoku'`, grid=9×9 of {value,given,notes}, solution=9×9, selectedCell, difficulty='medium', timer, seconds, noteMode, won
- **Algorithm:** `generateSolvedGrid()`: backtracking, try 1-9 random order per cell. `removeClues(difficulty)`: easy=38-42, medium=30-34, hard=24-28 givens. Remove one cell at a time, verify unique solution (count solutions, stop at 2), if not unique put back. `hasConflict(r,c,num)`: check row/col/3×3 box. Note mode: pencil marks as small corner numbers. Render: 9×9 grid, 3×3 borders thicker, conflicts in red, number picker 1-9 + erase.

### Game 11: Boggle
- **File:** `js/games/boggle.js` | **Class:** `Boggle` | **Category:** Word
- **Icon:** `text_rotation_none` | **Gradient:** `#f97316, #dc2626`
- **app.js:** `if (typeof Boggle !== 'undefined') this.games.boggle = new Boggle();` (under Word, after hangman)
- **State:** `name='Boggle'`, grid=4×4 letters, foundWords=[], allWords=[], currentInput='', score=0, timeLeft=180 (3min), timer, roundOver, dictionary (Set of ~5000 words), dice=[16 standard Boggle dice: 'AAEEGN','ABBJOO','ACHOPS','AFFKPS','AOOTTW','CIMOTU','DEILRX','DELRVY','DISTTY','EEGHNW','EEINSU','EHRTVW','EIOSST','ELRTTY','HIMNQU','HLNNRZ']
- **Algorithm:** `rollDice()`: shuffle dice, pick random face each. QU as single tile "Qu". `findAllWords()`: DFS from each cell, check prefix in sorted word list via binary search, collect valid ≥3 letters. `isValidPath(word)`: verify adjacent (8-dir) path without cell reuse. Scoring: 3-4=1pt, 5=2pt, 6=3pt, 7=5pt, 8+=11pt. Embed ~5000 common 3-8 letter words as sorted array. End screen shows missed words.

### Game 12: Nonogram
- **File:** `js/games/nonogram.js` | **Class:** `Nonogram` | **Category:** Puzzle
- **Icon:** `apps` | **Gradient:** `#ec4899, #be185d`
- **app.js:** `if (typeof Nonogram !== 'undefined') this.games.nonogram = new Nonogram();` (under Puzzle)
- **State:** `name='Nonogram'`, size=5 (option 10×10), pattern=[] (2D bool solution), grid=[] (2D 'empty'/'filled'/'marked'), rowClues=[], colClues=[], timer, seconds, won
- **Algorithm:** `generatePattern(size)`: ~45% chance per cell filled, ensure each row/col has ≥1 filled. `deriveClues(pattern)`: scan rows/cols counting consecutive filled → clue arrays, empty=[0]. `checkWin()`: filled cells match pattern exactly. Right-click/long-press marks X (contextmenu prevention + touchstart/touchend timer). Render: grid with clue headers top+left, completed rows/cols dim clues, cells toggle empty/filled/marked.

### Game 13: Mini Crossword
- **File:** `js/games/crossword.js` | **Class:** `Crossword` | **Category:** Word
- **Icon:** `newspaper` | **Gradient:** `#0d9488, #0f766e`
- **app.js:** `if (typeof Crossword !== 'undefined') this.games.crossword = new Crossword();` (under Word)
- **State:** `name='Mini Crossword'`, puzzles=[20-30 embedded 5×5 puzzle objects], currentPuzzle, grid=2D of {letter,given,userLetter,isBlack}, clues={across:[],down:[]}, selectedCell, direction='across', puzzleIndex, solved=Set (localStorage 'crossword-solved'), won
- **Puzzle format:** `{size:5, grid:[['H','E','L','L','O'],['A','#','I','#','N'],...], across:[{num,row,col,clue},...], down:[...]}`  ('#'=black square). Embed 20-30 puzzles with real clues.
- **Algorithm:** Arrow keys move cursor, Tab switches direction, typing fills+advances, Backspace clears+moves back. `getCurrentWord()`: extend from selected in direction until black/edge. `checkWord()`: highlight incorrect. `revealWord()`: fill current word. Render: numbered cells (superscript), black squares solid, selected cell + current word highlighted, clues panel below.

## SHARED PATTERNS
- Every game class uses: `constructor()`, `init(gameArea, statusArea, controlsArea)`, `reset()`, `render()`, `cleanup()`
- `cleanup()` must clear any intervals/timeouts and remove event listeners
- Use `app.showSnackbar(msg)` for toast notifications
- High scores: `localStorage.getItem('{gameid}-high')` / `setItem`
- Timer pattern: `setInterval` in `reset()`, `clearInterval` in both `cleanup()` and `reset()`
- Canvas games: use `requestAnimationFrame` or `setInterval` with update→render cycle
- Mode selectors: `<div class="mode-selector"><button class="mode-btn active" data-X="Y">Label</button>...</div>`

## IMPORTANT NOTES
- Do NOT create a base class. Each game is standalone.
- Use `cleanup()` not `destroy()` — that's what `app.js` calls.
- One game per iteration. Fully complete it before stopping.
- Always read existing files before editing them.
- After marking a game done in PROGRESS.md, STOP. The next iteration will pick up the next game.

