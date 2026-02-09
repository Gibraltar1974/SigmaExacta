// SigmaExacta Service Worker - VERSIÓN 13
const CACHE_NAME = 'sigma-exacta-v13';

const ESSENTIAL_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles.css',
  '/styles-index.css',
  '/dexie.min.js',
  '/db-sigma.js',
  '/manifest.json',
  '/cpk_calculator.html',
  '/stack_up_analysis.html',
  '/fmea.html',
  '/8d.html',
  '/ishikawa.html',
  '/control-plan.html',
  '/weibull.html',
  '/pdca.html',
  '/qfd.html',
  '/pugh.html',
  '/vave.html',
  '/design_thinking.html',
  '/kano.html',
  '/triz.html',
  '/eisenhower.html',
  '/apqp-ppap.html',
  '/balancedcard.html',
  '/swot.html',
  '/efqm.html'
];

// 1. INSTALACIÓN: Forzamos la descarga real (no permitimos archivos de tamaño 0)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('🚀 [SW v13] Re-descargando herramientas...');
      for (const url of ESSENTIAL_URLS) {
        try {
          const response = await fetch(url, { cache: 'reload' }); // Forzar descarga fresca del servidor
          if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
          await cache.put(url, response);
          console.log(`✅ Descargado y Guardado: ${url}`);
        } catch (err) {
          console.error(`❌ Fallo crítico al descargar ${url}:`, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVACIÓN
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// 3. FETCH: El cerebro de la v13
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(event.request.url);
    let path = url.pathname;

    try {
      // 1. ¿Es la raíz?
      if (path === '/' || path === '') path = '/index.html';

      // 2. Intentar coincidencia exacta tal cual viene en la URL
      let response = await cache.match(event.request);

      // 3. Si no hay coincidencia exacta y no tiene extensión, probar con .html
      if (!response && !path.includes('.')) {
        const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
        response = await cache.match(cleanPath + '.html');
      }

      // 4. Si lo encontramos en caché, lo devolvemos
      if (response) return response;

      // 5. Si no está en caché, intentar red
      return await fetch(event.request);

    } catch (error) {
      // Si todo falla (offline) y es una página (.html o navegación)
      if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) return offlinePage;
      }

      return new Response('Error de conexión offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    }
  })());
});