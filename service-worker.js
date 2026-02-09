// SigmaExacta Service Worker - VERSIÓN 14
const CACHE_NAME = 'sigma-exacta-v15';

const ESSENTIAL_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/about.html',
  'documentation.html',
  'validation.html',
  'header.html',
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

// 1. INSTALACIÓN con limpieza de redirecciones
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('🚀 [SW v14] Instalando con bypass de redirección...');
      for (const url of ESSENTIAL_URLS) {
        try {
          const response = await fetch(url, { redirect: 'follow' });
          if (!response.ok) throw new Error(`Status: ${response.status}`);

          // CRÍTICO: Si la respuesta es redireccionada, creamos una nueva copia "limpia"
          // Esto elimina el error "redirected response was used"
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
          console.error(`❌ Error en ${url}:`, err);
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

// 3. FETCH
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(event.request.url);
    const path = url.pathname;

    try {
      // 1. Intentar coincidencia exacta
      let response = await cache.match(event.request);

      // 2. Mapeo inteligente para rutas sin extensión
      if (!response && !path.includes('.')) {
        const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
        const target = cleanPath === '' ? '/index.html' : cleanPath + '.html';
        response = await cache.match(target);
      }

      if (response) return response;

      // 3. Si no hay en caché, ir a red
      return await fetch(event.request);

    } catch (error) {
      if (event.request.mode === 'navigate') {
        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) return offlinePage;
      }
      return new Response('Offline', { status: 503 });
    }
  })());
});