const CACHE_NAME = 'pwa-arcade-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  // Existing games
  '/js/games/tictactoe.js',
  '/js/games/checkers.js',
  '/js/games/go.js',
  '/js/games/memory.js',
  // Strategy games
  '/js/games/chess.js',
  '/js/games/connectfour.js',
  '/js/games/reversi.js',
  '/js/games/battleship.js',
  // Puzzle games
  '/js/games/minesweeper.js',
  '/js/games/puzzle2048.js',
  // Word games
  '/js/games/wordle.js',
  '/js/games/hangman.js',
  // Arcade games
  '/js/games/snake.js',
  '/js/games/breakout.js',
  '/js/games/tetris.js',
  // Card games
  '/js/games/solitaire.js',
  '/js/games/blackjack.js',
  // Classic games
  '/js/games/simon.js',
  // Assets
  '/manifest.json',
  '/icons/icon.svg',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons+Round',
  // External libraries
  'https://unpkg.com/js-chess-engine/lib/js-chess-engine.js'
];

// Install - cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        
        return fetch(event.request).then(response => {
          // Cache successful responses
          if (response.ok && event.request.method === 'GET') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
      .catch(() => {
        // Offline fallback for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
