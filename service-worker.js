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

// 1. INSTALACIÓN
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('🚀 [SW v25] Instalando y verificando archivos...');
      for (const url of ESSENTIAL_URLS) {
        try {
          // Usamos 'reload' para obligar a traer una copia fresca del servidor
          const response = await fetch(url, { cache: 'reload' });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          await cache.put(url, response);
          console.log(`✅ Cacheado: ${url}`);
        } catch (err) {
          console.error(`❌ Error en ${url}:`, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVACIÓN - Limpia versiones viejas para liberar espacio
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// 3. FETCH (ESTRATEGIA PARA OFFLINE)
self.addEventListener('fetch', event => {
  // Solo procesar peticiones GET a nuestro propio dominio
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(event.request.url);
    const path = url.pathname;

    try {
      // Intentar primero obtener del caché (Rápido y Offline)
      let response = await cache.match(event.request);

      // Si no hay respuesta exacta, probar con el mapeo de .html (rutas limpias)
      if (!response && !path.includes('.')) {
        const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
        const target = cleanPath === '' ? '/index.html' : cleanPath + '.html';
        response = await cache.match(target);
      }

      // Si lo encontramos en caché, lo devolvemos; si no, intentamos red
      return response || await fetch(event.request);

    } catch (error) {
      // Si falla la red (OFFLINE) y es una navegación de página, mostrar offline.html
      if (event.request.mode === 'navigate') {
        const offlinePage = await cache.match('/offline.html');
        return offlinePage || new Response('Estás offline.', { status: 503 });
      }
      return new Response('Recurso no disponible offline', { status: 503 });
    }
  })());
});