// SigmaExacta Service Worker - VERSIÓN CORREGIDA
const CACHE_NAME = 'sigmaexacta-completo-v3';

// TODAS las páginas con las rutas EXACTAS que aparecen en index.html
const ESSENTIAL_URLS = [
  // Páginas principales - RUTAS EXACTAS
  '/',
  '/index.html',
  '/offline.html',
  '/about.html',
  '/validation.html',
  '/documentation.html',

  // Herramientas - ¡RUTAS CORRECTAS!
  '/cpk_calculator.html',     // OK
  '/control-plan.html',       // OK
  '/weibull.html',            // OK
  '/pdca.html',               // OK
  '/stack_up_analysis.html',  // OK
  '/taguchi_doe.html',        // ❌ CORREGIDO: era taguchi-doe.html
  '/fmea.html',               // OK
  '/qfd.html',                // OK
  '/pugh.html',               // OK
  '/vave.html',               // OK
  '/design_thinking.html',    // OK
  '/kano.html',               // OK
  '/8d.html',                 // OK
  '/ishikawa.html',           // OK
  '/triz.html',               // OK
  '/eisenhower.html',         // OK
  '/apqp-ppap.html',          // OK
  '/balancedcard.html',       // ❌ CORREGIDO: era balancedcards.html
  '/swot.html',               // OK
  '/efqm.html',               // OK

  // Estilos
  '/styles.css',
  '/styles-index.css',

  // Recursos estáticos
  '/manifest.json',
  '/favicon.ico',
  '/sigma-exacta-icon.jpg',

  // Iconos
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',

  // Logos
  '/OIN_member_horizontal.jpg',
  '/256px-AGPLv3_Logo.svg.png'
];

// Instalación: Cachear TODO con las rutas correctas
self.addEventListener('install', event => {
  console.log('[SW] Instalando con todas las rutas corregidas...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando', ESSENTIAL_URLS.length, 'recursos');

        // Intentar cachear todo, pero no fallar si alguna falla
        const cachePromises = ESSENTIAL_URLS.map(url => {
          return cache.add(url).catch(error => {
            console.warn('[SW] No se pudo cachear:', url, error);
            return Promise.resolve(); // Continuar con los demás
          });
        });

        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('[SW] Instalación completada');
        return self.skipWaiting();
      })
  );
});

// Activación: Limpiar viejas cachés
self.addEventListener('activate', event => {
  console.log('[SW] Activado - limpiando cachés antiguas');
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
    }).then(() => {
      console.log('[SW] Tomando control de todos los clients');
      return self.clients.claim();
    })
  );
});

// Fetch: Estrategia SIMPLE y efectiva
self.addEventListener('fetch', event => {
  // Solo manejar HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;

  // Ignorar analytics y tracking
  if (event.request.url.includes('googletagmanager') ||
    event.request.url.includes('google-analytics') ||
    event.request.url.includes('clarity.ms')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // 1. Intentar cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. Si no está en cache, ir a la red
        const networkResponse = await fetch(event.request);

        // 3. Si la respuesta es exitosa, cachearla
        if (networkResponse.ok && event.request.method === 'GET') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;

      } catch (error) {
        console.log('[SW] Offline - no se pudo obtener:', event.request.url);

        // Si es una navegación (HTML), redirigir a offline.html
        if (event.request.mode === 'navigate') {
          // Intentar obtener offline.html de la caché
          const offlineResponse = await caches.match('/offline.html');
          if (offlineResponse) {
            return offlineResponse;
          }

          // Si no está en caché, crear una respuesta simple
          return new Response(
            `<html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - SigmaExacta</title>
              </head>
              <body>
                <p>You're offline. <a href="/offline.html">Go to offline page</a></p>
              </body>
            </html>`,
            {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
              status: 302
            }
          );
        }

        // Para otros recursos, devolver un fallback genérico
        if (event.request.url.match(/\.css$/i)) {
          return new Response('/* Estilos offline */', {
            headers: { 'Content-Type': 'text/css' }
          });
        }

        // Devolver error genérico
        return new Response('Recurso no disponible offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    })()
  );
});

// Manejar mensajes
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Forzar recache de un recurso
  if (event.data && event.data.type === 'CACHE_URL' && event.data.url) {
    caches.open(CACHE_NAME).then(cache => {
      fetch(event.data.url).then(response => {
        if (response.ok) cache.put(event.data.url, response);
      });
    });
  }
});