// SigmaExacta Service Worker - VERSIÓN 26
const CACHE_NAME = 'sigma-exacta-v26';

const ESSENTIAL_URLS = [
  '/',
  '/dexie.min.js',
  '/db-sigma.js',
  '/manifest.json',
  '/styles.css',
  '/styles-index.css',
  '/sigma-exacta-icon.jpg',
  '/github.svg',
  '/SigmaExacta.svg',
  '/oin_member_horizontal.jpg',
  '/header.html',
  '/index.html',
  '/offline.html',
  '/taguchi_calculator.js',
  '/taguchi_doe.html',
  '/cpk_calculator.js',
  '/cpk_calculator.html',
  '/stack_up_analysis.css',
  '/stack_up_analysis.js',
  '/stack_up_analysis.html',
  '/weibull.html',
  '/fmea.html',
  '/8d.html',
  '/apqp-ppap.html',
  '/ishikawa.html',
  '/control-plan.html',
  '/qfd.html',
  '/pugh.html',
  '/vave.html',
  '/kano.html',
  '/trizconstants.js',
  '/trizcontradiction.js',
  '/trizcontradiction2003.js',
  '/physicalcontradictionprinciples1993.js',
  '/sufield-diagrams.js',
  '/ldst.js',
  '/triz.html',
  '/eisenhower.html',
  '/balancedcard.html',
  '/design_thinking.html',
  '/swot.html',
  '/efqm.html',
  '/pdca.html',
  '/about.html',
  '/documentation.html',
  '/validation.html'
];

// 1. INSTALACIÓN - Aquí forzamos la limpieza y carga inicial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('🚀 [SW v26] Reparando integridad de librerías...');
      for (const url of ESSENTIAL_URLS) {
        try {
          // 'cache: reload' obliga al navegador a saltarse su caché local y pedir el archivo al servidor
          const response = await fetch(url, { cache: 'reload', redirect: 'follow' });

          if (!response.ok) throw new Error(`Status: ${response.status}`);

          // Verificación de seguridad para JS
          const contentType = response.headers.get('content-type');
          if (url.endsWith('.js') && contentType && contentType.includes('text/html')) {
            throw new Error(`El servidor devolvió HTML en lugar de JS para ${url}`);
          }

          if (response.redirected) {
            const cleanResponse = new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
            await cache.put(url, cleanResponse);
          } else {
            await cache.put(url, response);
          }
          console.log(`✅ Cacheado correctamente: ${url}`);
        } catch (err) {
          console.error(`❌ Error crítico en ${url}:`, err.message);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVACIÓN - Borra cualquier rastro de versiones anteriores
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// 3. FETCH - Estrategia Híbrida: Network First (HTML) + Stale-While-Revalidate (Assets)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const path = url.pathname;
  // Detectamos si es una petición de navegación (HTML o rutas limpias sin extensión)
  const isNavigation = event.request.mode === 'navigate' || !path.includes('.');

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    if (isNavigation) {
      // --- ESTRATEGIA 1: NETWORK FIRST (Para HTML) ---
      // Siempre intenta buscar el HTML más reciente del servidor primero.
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          await cache.put(event.request, networkResponse.clone()); // Actualizamos la caché
        }
        return networkResponse;
      } catch (error) {
        // Si falla la red (offline), tiramos de la caché con tu lógica de rutas limpias
        let response = await cache.match(event.request);
        if (!response) {
          const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
          const target = cleanPath === '' ? '/index.html' : cleanPath + '.html';
          response = await cache.match(target);
        }
        return response || await cache.match('/offline.html') || new Response('Offline', { status: 503 });
      }
    } else {
      // --- ESTRATEGIA 2: STALE-WHILE-REVALIDATE (Para JS, CSS, Imágenes) ---
      // Devuelve la caché al instante, pero descarga la nueva versión por detrás.
      const cachedResponse = await cache.match(event.request);

      const networkPromise = fetch(event.request).then(async (networkResponse) => {
        if (networkResponse.ok) {
          // Actualizamos la caché de fondo con el archivo nuevo para la próxima vez
          await cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        // Si no hay red mientras bajamos los assets de fondo, no pasa nada, ya dimos la caché
      });

      // Si tenemos caché la devolvemos ya, si no, esperamos a que termine la descarga de red
      return cachedResponse || await networkPromise;
    }
  })());
});