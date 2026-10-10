const CACHE_VERSION = 'v2';   // ← bumped, forces old cache to clear
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
  '/Web2083/icon-192.png',
  '/Web2083/icon-512.png'
  // NOTE: Sanskrit-2003.ttf removed — it was 404ing and breaking install.
  // Re-add it once you confirm it loads at https://aiselukharka.github.io/Web2083/Sanskrit-2003.ttf
];

// INSTALL — cache each file independently so one 404 doesn't kill the SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        APP_STATIC_RESOURCES.map((url) =>
          cache.add(url).catch((err) => console.warn('[SW] Skipped:', url, err))
        )
      )
    )
  );
  self.skipWaiting();
});

// ACTIVATE — delete old caches, claim clients, notify pages
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) =>
        client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION })
      );
    })()
  );
});

// FETCH — cache-first with safe fallbacks; never let respondWith reject
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Background refresh
        fetch(event.request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkRes.clone());
              });
            }
          })
          .catch(() => {});
        return cached;
      }
      // Not cached: try network, fall back to a synthetic response
      return fetch(event.request).catch(
        () =>
          new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          })
      );
    })
  );
});

// MESSAGE — allow page to trigger update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});