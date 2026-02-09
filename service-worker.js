// SigmaExacta SW - v9 (Optimizado para navegación sin extensión)
const CACHE_NAME = 'sigma-exacta-v9';

const ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles.css',
  '/styles-index.css',
  '/dexie.min.js',
  '/db-sigma.js',
  '/cpk_calculator.html',
  '/fmea.html',
  '/stack_up_analysis.html',
  '/apqp-ppap.html',
  '/manifest.json'
];

// Instalación: Guardamos todo
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('✅ [SW] Guardando archivos en la mochila');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: Limpiamos basura
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// FETCH: La lógica inteligente
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  event.respondWith(
    caches.match(event.request).then(response => {
      // 1. Si el archivo está exacto en caché (ej: styles.css), se entrega
      if (response) return response;

      // 2. Si pides "/fmea", intentamos buscar "/fmea.html" en caché
      if (!url.pathname.endsWith('.html') && url.origin === self.location.origin) {
        const fallbackUrl = url.pathname + '.html';
        return caches.match(fallbackUrl).then(htmlRes => {
          if (htmlRes) return htmlRes;
          // Si no está en caché, intentamos red
          return fetch(event.request).catch(() => caches.match('/offline.html'));
        });
      }

      // 3. Intento normal por red
      return fetch(event.request).catch(() => {
        // Si falla la red y es una página (navigate), mostramos offline.html
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});