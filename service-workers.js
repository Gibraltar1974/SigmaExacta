// SigmaExacta Service Worker - Versión mínima
const CACHE_NAME = 'sigmaexacta-cache-v1';

// Instalar
self.addEventListener('install', event => {
  console.log('Service Worker instalado para sigmaexacta.com');
  self.skipWaiting();
});

// Activar
self.addEventListener('activate', event => {
  console.log('Service Worker activado');
  return self.clients.claim();
});

// Fetch - Dejar pasar todo
self.addEventListener('fetch', event => {
  // Dejar pasar todas las peticiones sin cachear
  return;
});