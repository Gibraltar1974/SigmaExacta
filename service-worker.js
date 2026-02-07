// SigmaExacta Service Worker - Versión con página offline
const CACHE_NAME = 'sigmaexacta-offline-v1';

// Solo lo ABSOLUTAMENTE esencial
const ESSENTIAL_URLS = [
  '/',                        // Home page
  '/index.html',              // HTML principal
  '/offline.html',           // Página offline (¡IMPORTANTE!)
  '/styles.css',              // Estilos principales
  '/styles-index.css',        // Estilos de index
  '/manifest.json',           // Manifest PWA
  '/icons/icon-192x192.png',  // Icono pequeño
  '/icons/icon-512x512.png',  // Icono grande
  '/favicon.ico',             // Favicon
  '/sigma-exacta-icon.jpg',   // Logo principal

  // Las 6 herramientas más importantes 
  '/cpk_calculator.html',     // Ejemplo: Cpk Calculator
  '/fmea.html',               // Ejemplo: FMEA
  '/taguchi-DOE.html',        // Ejemplo: Taguchi DOE
  '/stack_up_analysis.html',  // Ejemplo: Stack-Up-Analysis 
  '/weibull.html',            // Ejemplo: Weibull
  '/triz.html'                // Ejemplo: TRIZ
];

// Instalación: Cachear solo lo esencial
self.addEventListener('install', event => {
  console.log('[SW] Instalando versión con página offline...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando recursos esenciales');
        return cache.addAll(ESSENTIAL_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación: Limpiar viejas cachés
self.addEventListener('activate', event => {
  console.log('[SW] Activado!');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Estrategia con página offline personalizada
self.addEventListener('fetch', event => {
  // Solo manejar solicitudes HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, devolverlo
        if (response) {
          return response;
        }

        // Si no está en caché, intentar red
        return fetch(event.request)
          .then(response => {
            // No cachear errores
            if (!response.ok) return response;

            // Solo cachear respuestas exitosas del mismo origen
            if (response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(error => {
            console.log('[SW] Offline, serving offline page for:', event.request.url);

            // Si es una página HTML, servir offline.html
            if (event.request.headers.get('Accept') &&
              event.request.headers.get('Accept').includes('text/html')) {
              return caches.match('/offline.html');
            }

            // Para otros recursos, dejar que falle
            throw error;
          });
      })
  );
});

// Escuchar mensajes (para futuras expansiones)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});