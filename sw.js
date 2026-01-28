const CACHE_NAME = 'game-arcade-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/games/tictactoe.js',
  '/js/games/checkers.js',
  '/js/games/go.js',
  '/js/games/memory.js',
  '/manifest.json',
  '/icons/icon.svg',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons+Round'
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
