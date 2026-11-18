/**
 * Cancer Awareness — Service Worker
 * Caches core educational pages for offline use.
 * Medical guidance is marked as potentially outdated when served from cache.
 */

const CACHE_NAME = 'ca-v0.1.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/rag.js',
  '/pages/understand.html',
  '/pages/body-map.html',
  '/pages/symptoms.html',
  '/pages/risk.html',
  '/pages/screening.html',
  '/pages/ask.html',
  '/data/sources.json'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first with cache fallback
self.addEventListener('fetch', event => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache fresh response
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(cached => {
          if (cached) {
            // Add offline notice header for HTML responses
            if (event.request.headers.get('accept')?.includes('text/html')) {
              // Return cached with offline notice injected
              return cached.text().then(html => {
                const offlineHtml = html.replace(
                  '<body>',
                  `<body><div style="background:#E65100;color:white;text-align:center;padding:0.5rem 1rem;font-size:0.875rem">
                    ⚠️ You are offline. This page was cached and may not reflect the most current information.
                    | நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். இந்த பக்கம் தேக்கப்பட்டது மற்றும் மிக சமீபத்திய தகவலை பிரதிபலிக்காமல் இருக்கலாம்.
                   </div>`
                );
                return new Response(offlineHtml, {
                  headers: { 'Content-Type': 'text/html; charset=utf-8' }
                });
              });
            }
            return cached;
          }
          // Offline fallback for HTML
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return new Response('<h1>Offline</h1><p>Please reconnect to access this page. For medical emergencies, call 999.</p>', {
              headers: { 'Content-Type': 'text/html' }
            });
          }
        })
      )
  );
});
