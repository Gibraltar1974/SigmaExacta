// SigmaExacta Service Worker - VERSIÓN 11
const CACHE_NAME = 'sigma-exacta-v11';

// Lista de archivos con la extensión REAL que tienen en tu servidor (.html)
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
  '/fmea.html',
  '/stack_up_analysis.html',
  '/apqp-ppap.html',
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
  '/balancedcard.html',
  '/swot.html',
  '/efqm.html'
];

// 1. INSTALACIÓN: Cacheo individual para que si uno falla, los demás sigan
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('📦 [SW] Instalando v11...');
      for (const url of ESSENTIAL_URLS) {
        try {
          await cache.add(url);
          console.log(`✅ Cacheado: ${url}`);
        } catch (err) {
          console.warn(`⚠️ No se pudo guardar: ${url}. Verifica si existe en el servidor.`);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVACIÓN: Limpieza de versiones antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// 3. FETCH: El motor que resuelve el problema de las extensiones
self.addEventListener('fetch', event => {
  // Solo procesar peticiones GET de nuestra web
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(event.request.url);

    try {
      // A. Intento 1: Buscar coincidencia exacta (ej: styles.css)
      const exactMatch = await cache.match(event.request);
      if (exactMatch) return exactMatch;

      // B. Intento 2: Mapeo de extensión (.html fantasma)
      // Si pides /fmea y no está, buscamos /fmea.html en la caché
      if (event.request.mode === 'navigate' || !url.pathname.includes('.')) {
        const path = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
        const htmlMatch = await cache.match(path + '.html');
        if (htmlMatch) return htmlMatch;
      }

      // C. Intento 3: Intentar Internet
      return await fetch(event.request);

    } catch (error) {
      // D. Fallback: Si no hay red y es una página, mostrar offline.html
      if (event.request.mode === 'navigate') {
        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) return offlinePage;
      }

      // Respuesta de seguridad final para evitar el error ERR_FAILED
      return new Response('Offline: Recurso no disponible', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  })());
});