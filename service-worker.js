// SigmaExacta Service Worker - VERSIÓN CORREGIDA V6
const CACHE_NAME = 'sigmaexacta-completo-v7';

const ESSENTIAL_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/about.html',
  '/validation.html',
  '/documentation.html',
  '/dexie.min.js',
  '/db-sigma.js',

  // Herramientas con su extensión real
  '/cpk_calculator.html',
  '/control-plan.html',
  '/weibull.html',
  '/pdca.html',
  '/stack_up_analysis.html',
  '/taguchi_doe.html',
  '/fmea.html',
  '/qfd.html',
  '/pugh.html',
  '/vave.html',
  '/design_thinking.html',
  '/kano.html',
  '/8d.html',
  '/ishikawa.html',
  '/triz.html',
  '/eisenhower.html',
  '/apqp-ppap.html',
  '/balancedcard.html',
  '/swot.html',
  '/efqm.html',

  // Estilos y recursos
  '/styles.css',
  '/styles-index.css',
  '/manifest.json',
  '/favicon.ico',
  '/sigma-exacta-icon.jpg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/OIN_member_horizontal.jpg',
  '/256px-AGPLv3_Logo.svg.png'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ESSENTIAL_URLS.map(url => {
          return cache.add(url).catch(err => console.warn(`Error cacheando ${url}:`, err));
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => self.clients.claim())
  );
});

// Fetch - Estrategia: Cache First, Network Fallback
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;

  // Ignorar rastreadores externos para que no ensucien la consola
  if (event.request.url.includes('google-analytics') || event.request.url.includes('clarity.ms')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        // Solo cacheamos respuestas válidas de nuestro propio dominio
        if (networkResponse.ok && event.request.url.includes(location.hostname)) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // SI ESTÁ OFFLINE
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }

        // Si es una fuente de Google o FontAwesome y falla, devolvemos respuesta vacía
        if (event.request.url.includes('fonts.googleapis') || event.request.url.includes('cdnjs')) {
          return new Response('', { status: 200 });
        }
      });
    })
  );
});