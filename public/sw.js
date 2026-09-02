const CACHE_NAME = 'sonachandi-v2-cache';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/favicon.png',
  '/manifest.json'
];

// Install Event - Pre-cache critical assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Static asset pre-caching partial notice:', err);
      });
    })
  );
});

// Activate Event - Clean old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First with Cache Fallback for API, Stale-While-Revalidate for Assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API requests (e.g. /api/rates)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline / network failure, return last known cached API response
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // If not in cache, fallback to generic offline JSON response
          return new Response(
            JSON.stringify({
              success: true,
              isOfflineFallback: true,
              message: 'Offline cached rate fallback'
            }),
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Handle Static Assets & HTML navigation
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            event.request.method === 'GET' &&
            !url.pathname.startsWith('/@') // Ignore vite dev modules if any
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If completely offline and navigating to a page, return index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
