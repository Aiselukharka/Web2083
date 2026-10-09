const CACHE_VERSION = 'v1';
const CACHE_NAME = `aiselukharka-${CACHE_VERSION}`;

// Static assets to pre-cache
const APP_STATIC_RESOURCES = [
  '/Web2083/',
  '/Web2083/index.html',
  '/Web2083/HomeStyle.css',
  '/Web2083/HomeScript.js',
  '/Web2083/VideoScript.js',
  '/Web2083/SupabaseConfig.js',
  '/Web2083/NepaliCalendar.js',
  '/Web2083/SmartCalculator.js',
  '/Web2083/CustomDialog.js',
  '/Web2083/Sanskrit-2003.ttf'
];

// INSTALL: cache all static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_STATIC_RESOURCES))
  );
  self.skipWaiting(); // don't wait — activate new SW immediately
});

// ACTIVATE: delete old caches, then claim all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((n) => {
          if (n !== CACHE_NAME) return caches.delete(n);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH: cache-first for static, network-only for Supabase & POST
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return; // never cache API calls

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Refresh cache in background (stale-while-revalidate)
        fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkRes.clone());
            });
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request);
    })
  );
});