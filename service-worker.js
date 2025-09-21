const CACHE_NAME = 'rp-tracker-cache-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './js/google-auth.js',
  './js/renderer.js',
  './manifest.json',
  './offline.html',
  './assets/icons/plume-192.png',
  './assets/icons/plume-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Stratégie network-first pour HTML
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
          return res;
        })
        .catch(() =>
          caches.match(req).then(r => r || caches.match('./offline.html'))
        )
    );
    return;
  }

  // Cache-first pour le reste
  e.respondWith(
    caches.match(req).then(cached =>
      cached ||
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone));
        return res;
      }).catch(() => cached)
    )
  );
});
