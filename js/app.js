// PWA Arcade - Main Controller
class GameArcade {
    constructor() {
        this.currentGame = null;
        this.games = {};
        
        // Register games as they load
        this.registerGames();
        this.init();
    }
    
    registerGames() {
        // Strategy
        if (typeof Checkers !== 'undefined') this.games.checkers = new Checkers();
        if (typeof GoGame !== 'undefined') this.games.go = new GoGame();
        if (typeof Chess !== 'undefined') this.games.chess = new Chess();
        if (typeof ConnectFour !== 'undefined') this.games.connectfour = new ConnectFour();
        if (typeof Reversi !== 'undefined') this.games.reversi = new Reversi();
        if (typeof Battleship !== 'undefined') this.games.battleship = new Battleship();
        
        // Puzzle
        if (typeof MemoryGame !== 'undefined') this.games.memory = new MemoryGame();
        if (typeof Puzzle2048 !== 'undefined') this.games.puzzle2048 = new Puzzle2048();
        if (typeof Minesweeper !== 'undefined') this.games.minesweeper = new Minesweeper();
        
        // Word
        if (typeof Wordle !== 'undefined') this.games.wordle = new Wordle();
        if (typeof Hangman !== 'undefined') this.games.hangman = new Hangman();
        
        // Arcade
        if (typeof Snake !== 'undefined') this.games.snake = new Snake();
        if (typeof Breakout !== 'undefined') this.games.breakout = new Breakout();
        if (typeof Tetris !== 'undefined') this.games.tetris = new Tetris();
        
        // Card
        if (typeof Solitaire !== 'undefined') this.games.solitaire = new Solitaire();
        if (typeof Blackjack !== 'undefined') this.games.blackjack = new Blackjack();
        
        // Classic
        if (typeof TicTacToe !== 'undefined') this.games.tictactoe = new TicTacToe();
        if (typeof Simon !== 'undefined') this.games.simon = new Simon();
        
        // Party
        if (typeof HeadsUp !== 'undefined') this.games.headsup = new HeadsUp();
    }
    
    init() {
        // Theme
        const savedTheme = localStorage.getItem('arcade-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
        
        // Load collapsed state - default all collapsed on first visit
        const defaultCollapsed = ['strategy', 'puzzle', 'word', 'arcade', 'card', 'classic', 'party'];
        const collapsedCategories = JSON.parse(localStorage.getItem('arcade-collapsed') || JSON.stringify(defaultCollapsed));
        
        document.getElementById('themeBtn').addEventListener('click', () => this.toggleTheme());
        document.getElementById('backBtn').addEventListener('click', () => this.showMenu());
        
        // Category headers - toggle collapse
        document.querySelectorAll('.category-header').forEach(header => {
            const category = header.dataset.category;
            if (collapsedCategories.includes(category)) {
                header.classList.add('collapsed');
            }
            
            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
                this.saveCollapsedState();
            });
        });
        
        // Game cards with staggered animation
        document.querySelectorAll('.game-card-mini').forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50 + i * 40);
            
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startGame(card.dataset.game);
            });
        });
    }
    
    saveCollapsedState() {
        const collapsed = [];
        document.querySelectorAll('.category-header.collapsed').forEach(h => {
            collapsed.push(h.dataset.category);
        });
        localStorage.setItem('arcade-collapsed', JSON.stringify(collapsed));
    }
    
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('arcade-theme', next);
        this.updateThemeIcon(next);
    }
    
    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeBtn .material-icons-round');
        icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
    
    startGame(gameId) {
        const game = this.games[gameId];
        if (!game) {
            this.showSnackbar('Game coming soon! 🎮');
            return;
        }
        
        this.currentGame = game;
        
        // Animate out menu
        const menu = document.getElementById('gameMenu');
        menu.style.transition = 'all 0.3s ease';
        menu.style.opacity = '0';
        menu.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            menu.style.display = 'none';
            
            const container = document.getElementById('gameContainer');
            container.style.display = 'flex';
            container.style.opacity = '1';
            
            document.getElementById('backBtn').style.display = 'flex';
            document.getElementById('appTitle').textContent = game.name;
            
            game.init(
                document.getElementById('gameArea'),
                document.getElementById('gameStatus'),
                document.getElementById('gameControls')
            );
        }, 300);
    }
    
    showMenu() {
        if (this.currentGame) {
            this.currentGame.cleanup();
            this.currentGame = null;
        }
        
        const container = document.getElementById('gameContainer');
        container.style.opacity = '0';
        
        setTimeout(() => {
            container.style.display = 'none';
            
            const menu = document.getElementById('gameMenu');
            menu.style.display = 'block';
            menu.style.opacity = '1';
            menu.style.transform = 'scale(1)';
            
            document.getElementById('backBtn').style.display = 'none';
            document.getElementById('appTitle').textContent = 'PWA Arcade';
            
            document.getElementById('gameArea').innerHTML = '';
            document.getElementById('gameStatus').innerHTML = '';
            document.getElementById('gameControls').innerHTML = '';
        }, 200);
    }
    
    showSnackbar(message, duration = 3000) {
        const snackbar = document.getElementById('snackbar');
        snackbar.textContent = message;
        snackbar.classList.add('show');
        
        setTimeout(() => snackbar.classList.remove('show'), duration);
    }
}

// Initialize
const app = new GameArcade();
