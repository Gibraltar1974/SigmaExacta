// SigmaExacta Service Worker - Cache V2
const CACHE_NAME = 'sigmaexacta-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './header.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  // Añade aquí tus CSS y JS principales si tienes
  // './css/style.css', 
  // './js/app.js' 
];

// 1. Instalación: Cachear recursos estáticos críticos
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Cacheando archivos core');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activación: Limpiar cachés antiguas
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Borrando caché antigua', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// 3. Fetch: Estrategia Stale-While-Revalidate
self.addEventListener('fetch', event => {
  // Solo procesar peticiones http/https (ignorar chrome-extension, etc)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Estrategia: "Network First" para HTML (para que el contenido se actualice)
      // "Cache First" para imágenes y estáticos.

      // Aquí usamos una estrategia híbrida simple:
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Si la red responde bien, actualizamos la caché
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Si falla la red (offline), no hacemos nada aquí, retornaremos caché abajo
      });

      // Si tenemos caché, la devolvemos (velocidad), pero fetchPromise actualiza en background
      return cachedResponse || fetchPromise;
    })
  );
});