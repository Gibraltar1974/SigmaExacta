// SigmaExacta Service Worker - VERSIÓN 23
const CACHE_NAME = 'sigma-exacta-v23';

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
  '/taguchi_calculator.js', // CORREGIDO: de 'tagucho' a 'taguchi'
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
  // He quitado los 2 archivos que daban 404 (logo agpl y 76principles) para limpiar el log
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('🚀 [SW v23] Instalando y verificando integridad...');
      for (const url of ESSENTIAL_URLS) {
        try {
          const response = await fetch(url, { redirect: 'follow', cache: 'reload' });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          // PROTECCIÓN: Si el archivo es .js pero el contenido es HTML, hay un error de redirección
          const contentType = response.headers.get('content-type');
          if (url.endsWith('.js') && contentType && contentType.includes('text/html')) {
            throw new Error(`Integridad fallida: ${url} devolvió HTML en vez de JS`);
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
          console.log(`✅ Cacheado: ${url}`);
        } catch (err) {
          console.error(`❌ Error Crítico en ${url}:`, err.message);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVACIÓN (Igual que antes)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// 3. FETCH (Igual que antes)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(event.request.url);
    const path = url.pathname;

    try {
      let response = await cache.match(event.request);
      if (!response && !path.includes('.')) {
        const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
        const target = cleanPath === '' ? '/index.html' : cleanPath + '.html';
        response = await cache.match(target);
      }
      return response || await fetch(event.request);
    } catch (error) {
      if (event.request.mode === 'navigate') return await cache.match('/offline.html');
      return new Response('Offline', { status: 503 });
    }
  })());
});