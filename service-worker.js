const CACHE_NAME = 'media-download-v5';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/main.js',
  './js/api/cobaltService.js',
  './js/ui/uiHandler.js',
  './js/ui/toastService.js',
  './js/utils/validators.js',
  './js/utils/clipboard.js',
  './js/utils/storage.js',
  './js/utils/haptics.js',
  './js/pwa/registerServiceWorker.js',
  './js/pwa/installPrompt.js',
  './js/pwa/shareTarget.js',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    // Hemos eliminado self.skipWaiting() para que el nuevo SW se quede en "instalado" pero esperando confirmación
  );
});

self.addEventListener('activate', (event) => {
  // Limpieza agresiva de cualquier caché que no coincida con CACHE_NAME actual
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
        keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))
    )).then(() => self.clients.claim())
  );
});

// Escuchar mensajes desde la UI (Botón Actualizar)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((network) => {
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, network.clone()));
        return network;
      }).catch(() => {});
      return cached || fetchPromise;
    })
  );
});
