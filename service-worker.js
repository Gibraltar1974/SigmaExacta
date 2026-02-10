// SigmaExacta Service Worker - VERSIÓN 25
const CACHE_NAME = 'sigma-exacta-v24';

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

// 1. INSTALACIÓN - Aquí forzamos la limpieza
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('🚀 [SW v25] Reparando integridad de librerías...');
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

// 2. ACTIVACIÓN - Borra cualquier rastro de la v23/v24
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// 3. FETCH - Intercepta las peticiones y da la versión buena de la caché
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(event.request.url);
    const path = url.pathname;

    try {
      // Intentamos dar el archivo de nuestra caché (que ya hemos verificado que es JS real)
      let response = await cache.match(event.request);

      // Soporte para rutas limpias (.html)
      if (!response && !path.includes('.')) {
        const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
        const target = cleanPath === '' ? '/index.html' : cleanPath + '.html';
        response = await cache.match(target);
      }

      return response || await fetch(event.request);

    } catch (error) {
      if (event.request.mode === 'navigate') {
        const offlinePage = await cache.match('/offline.html');
        return offlinePage || new Response('Offline', { status: 503 });
      }
      return new Response('Offline', { status: 503 });
    }
  })());
});