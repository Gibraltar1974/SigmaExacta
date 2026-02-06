// Nombre del cache
const CACHE_NAME = 'sigmaexacta-v1';

// Instalar
self.addEventListener('install', event => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Activar
self.addEventListener('activate', event => {
  console.log('Service Worker activado');
  return self.clients.claim();
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  // Dejar pasar todas las peticiones (solo registramos)
  console.log('Fetch interceptado:', event.request.url);
});