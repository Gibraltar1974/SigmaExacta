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

        // Si es una navegación (HTML), mostrar una página simple
        if (event.request.mode === 'navigate') {
          return new Response(
            `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>SigmaExacta - Offline</title>
              <style>
                body {
                  font-family: 'Nunito', sans-serif;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                  padding: 20px;
                }
                .container {
                  max-width: 500px;
                  background: rgba(255,255,255,0.1);
                  backdrop-filter: blur(10px);
                  padding: 40px;
                  border-radius: 20px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                h1 { font-size: 2.5em; margin-bottom: 20px; }
                p { font-size: 1.2em; margin-bottom: 30px; opacity: 0.9; }
                .btn {
                  display: inline-block;
                  padding: 12px 30px;
                  background: white;
                  color: #764ba2;
                  text-decoration: none;
                  border-radius: 50px;
                  font-weight: bold;
                  margin: 10px;
                  transition: transform 0.3s;
                }
                .btn:hover {
                  transform: translateY(-2px);
                }
                .icon {
                  font-size: 60px;
                  margin-bottom: 20px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">⚡</div>
                <h1>Modo Offline</h1>
                <p>Todas las herramientas de SigmaExacta están disponibles offline. Revisa tu conexión o intenta nuevamente.</p>
                <a href="/" class="btn">Ir al Inicio</a>
                <button onclick="window.history.back()" class="btn">Volver Atrás</button>
              </div>
            </body>
            </html>
            `,
            {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
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