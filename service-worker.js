// SigmaExacta Service Worker - VERSIÓN 26
const CACHE_NAME = 'sigma-exacta-v25';

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

// 1. INSTALACIÓN CON VERIFICACIÓN ANTICORRUPCIÓN
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('🚀 [SW v26] FORZANDO LIMPIEZA DE LIBRERÍAS...');

      for (const url of ESSENTIAL_URLS) {
        try {
          // 'cache: reload' ignora la caché del navegador y pide una copia nueva al servidor
          const response = await fetch(url, { cache: 'reload', redirect: 'follow' });

          if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

          // VALIDACIÓN ESPECIAL: Si es un archivo .js, verificamos su contenido real
          if (url.endsWith('.js')) {
            const blob = await response.clone().blob();
            const text = await blob.text();

            // Si el texto empieza con "<", es un HTML de error disfrazado de JS
            if (text.trim().startsWith('<')) {
              console.error(`❌ El archivo ${url} está corrupto (es HTML). No se cacheará.`);
              continue;
            }
          }

          await cache.put(url, response);
          console.log(`✅ Verificado y Cacheado: ${url}`);
        } catch (err) {
          console.error(`❌ Error en ${url}:`, err.message);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVACIÓN - Limpieza de cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// 3. FETCH - Estrategia: Cache First (prioriza la versión limpia verificada)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(event.request.url);
    const path = url.pathname;

    try {
      // Intentar servir desde la caché verificada
      let response = await cache.match(event.request);

      // Manejo de rutas amigables (.html)
      if (!response && !path.includes('.')) {
        const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
        const target = cleanPath === '' ? '/index.html' : cleanPath + '.html';
        response = await cache.match(target);
      }

      // Si no está en caché, ir a la red
      return response || await fetch(event.request);

    } catch (error) {
      if (event.request.mode === 'navigate') {
        return await cache.match('/offline.html');
      }
      return new Response('Offline', { status: 503 });
    }
  })());
});