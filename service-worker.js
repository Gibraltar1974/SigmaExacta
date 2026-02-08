// SigmaExacta Service Worker - VERSIÓN ACTUALIZADA
const CACHE_NAME = 'sigmaexacta-completo-v5'; // CAMBIAR VERSIÓN

// TODAS las páginas con las rutas EXACTAS que aparecen en index.html
const ESSENTIAL_URLS = [
  // Páginas principales - RUTAS EXACTAS
  '/',
  '/index.html',
  '/offline.html',
  '/about.html',
  '/validation.html',
  '/documentation.html',
  '/dexie.min.js',
  '/db-sigma.js',

  // Herramientas - ¡RUTAS CORRECTAS!
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

// Activación: Limpiar viejas cachés y actualizar offline.html
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
      // Actualizar offline.html específicamente
      return caches.open(CACHE_NAME).then(cache => {
        return fetch('/offline.html?update=' + Date.now())
          .then(response => {
            if (response.ok) {
              return cache.put('/offline.html', response).then(() => {
                console.log('[SW] offline.html actualizado en caché');
              });
            }
          })
          .catch(error => {
            console.warn('[SW] No se pudo actualizar offline.html:', error);
          });
      });
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

  // Para offline.html, priorizar red para mantener actualizado
  if (event.request.url.includes('/offline.html')) {
    event.respondWith(
      (async () => {
        try {
          // Intentar red primero
          const networkResponse = await fetch(event.request);
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          // Si falla la red, usar caché
          const cachedResponse = await caches.match('/offline.html');
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback por si acaso
          return new Response('<h1>SigmaExacta Offline</h1><p>Herramientas disponibles offline</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      })()
    );
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

        // Si es una navegación (HTML), mostrar offline.html
        if (event.request.mode === 'navigate') {
          const offlineResponse = await caches.match('/offline.html');
          if (offlineResponse) {
            return offlineResponse;
          }

          // Fallback simple
          return new Response(
            '<html><body><h1>Offline</h1><p>SigmaExacta tools are available offline.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
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
      fetch(event.data.url + '?update=' + Date.now()).then(response => {
        if (response.ok) cache.put(event.data.url, response);
      });
    });
  }
});