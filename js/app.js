// Game Arcade - Main Controller
class GameArcade {
    constructor() {
        this.currentGame = null;
        this.games = {
            tictactoe: new TicTacToe(),
            checkers: new Checkers(),
            go: new GoGame(),
            memory: new MemoryGame()
        };
        
        this.init();
    }
    
    init() {
        // Theme
        const savedTheme = localStorage.getItem('arcade-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
        
        document.getElementById('themeBtn').addEventListener('click', () => this.toggleTheme());
        document.getElementById('backBtn').addEventListener('click', () => this.showMenu());
        
        // Game cards with staggered animation
        document.querySelectorAll('.game-card').forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + i * 80);
            
            card.addEventListener('click', () => {
                this.startGame(card.dataset.game);
            });
        });
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
        if (!game) return;
        
        this.currentGame = game;
        
        // Animate out menu
        const menu = document.getElementById('gameMenu');
        menu.style.transition = 'all 0.3s ease';
        menu.style.opacity = '0';
        menu.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            menu.style.display = 'none';
            
            document.getElementById('gameContainer').style.display = 'flex';
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
            menu.style.display = 'grid';
            menu.style.opacity = '1';
            menu.style.transform = 'scale(1)';
            
            document.getElementById('backBtn').style.display = 'none';
            document.getElementById('appTitle').textContent = 'Game Arcade';
            
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
