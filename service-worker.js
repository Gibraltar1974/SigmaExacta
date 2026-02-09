// SigmaExacta Service Worker - VERSIÓN 12
const CACHE_NAME = 'sigma-exacta-v12';

// Lista de archivos con extensiones REALES (.html)
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

// 1. INSTALACIÓN: Cacheo uno a uno para evitar bloqueos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('🚀 [SW v12] Iniciando instalación...');
      for (const url of ESSENTIAL_URLS) {
        try {
          await cache.add(url);
          console.log(`✅ Guardado: ${url}`);
        } catch (err) {
          console.warn(`⚠️ No se pudo guardar: ${url}. Revisa si el nombre es correcto.`);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVACIÓN: Borrado total de versiones viejas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// 3. FETCH: El motor que resuelve el problema de "This site can't be reached"
self.addEventListener('fetch', event => {
  // Ignorar peticiones que no sean nuestras
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(event.request.url);

    try {
      // A. ¿Está el archivo exacto?
      const exactMatch = await cache.match(event.request);
      if (exactMatch) return exactMatch;

      // B. ¿Es una navegación sin extensión? (Ej: /stack_up_analysis)
      // Buscamos automáticamente la versión .html en la caché
      if (event.request.mode === 'navigate' || !url.pathname.includes('.')) {
        const cleanPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
        const htmlMatch = await cache.match(cleanPath + '.html');
        if (htmlMatch) return htmlMatch;
      }

      // C. Si no está en caché, intentamos internet
      return await fetch(event.request);

    } catch (error) {
      // D. FALLBACK: Si no hay internet y falla todo lo anterior
      if (event.request.mode === 'navigate') {
        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) return offlinePage;
      }

      // Respuesta vacía controlada para que Chrome no se bloquee
      return new Response('Offline: Recurso no disponible', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain' })
      });
    }
  })());
});