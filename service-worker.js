var CACHE_VERSION = '2.9';
var CACHE_NAME = 'RTD' + CACHE_VERSION;

// List of files to cache
var REQUIRED_FILES = [
  'index.html',
  // 'dashboard.html',
  // 'portfolio.html',
  // 'trading.html',
  // 'quickview.html'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(REQUIRED_FILES)
        .catch(function (error) {
          console.error('Failed to cache:', error);
        });
    })
    .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response; // Return from cache
      }
      return fetch(event.request).catch(() => {
        console.warn('Network request failed:', event.request.url);
      });
    })
  );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName); // Delete old cache
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});
