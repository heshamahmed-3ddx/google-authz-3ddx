// Basic service worker for caching static assets and API responses
const CACHE_NAME = 'insighthub-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.png',
  '/lamp.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
        return null;
      }),
    )),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // For API calls, try network first then cache fallback
  if (request.url.includes('/api/') || request.url.includes('/auth/')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Optionally cache API responses
          return res;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // For navigation and static assets, use cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      // Cache the new resource
      if (request.method === 'GET' && res && res.status === 200) {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
      }
      return res;
    })).catch(() => caches.match('/')),
  );
});
