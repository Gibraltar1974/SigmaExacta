// SigmaExacta Service Worker - VERSIÓN 10 (Corrección de Extensiones)
const CACHE_NAME = 'sigma-exacta-v10';

const ESSENTIAL_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles.css',
  '/styles-index.css',
  '/dexie.min.js',
  '/db-sigma.js',
  '/manifest.json',
  // Asegúrate de que todas las herramientas tengan el .html aquí:
  '/cpk_calculator.html',
  '/fmea.html',
  '/stack_up_analysis.html',
  '/apqp-ppap.html',
  '/8d.html',
  '/ishikawa.html'
];

// 1. Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('✅ [SW] Guardando archivos en caché v10');
      return cache.addAll(ESSENTIAL_URLS);
    })
  );
  self.skipWaiting();
});

// 2. Activación (Limpieza)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// 3. LA CLAVE: El manejador de peticiones inteligente
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);

  event.respondWith(
    caches.match(event.request).then(async (response) => {
      // Si el archivo está en la caché exactamente (ej: styles.css), se entrega
      if (response) return response;

      // TRUCO PRO: Si pides "/fmea" y no está, intentamos buscar "/fmea.html" internamente
      if (event.request.mode === 'navigate' || !url.pathname.includes('.')) {
        const path = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
        const fallbackResponse = await caches.match(path + '.html');

        if (fallbackResponse) return fallbackResponse;
      }

      // Si no está en caché de ninguna forma, intentamos internet
      return fetch(event.request).catch(() => {
        // Si falla internet y es una página, mostramos el offline.html
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});