const CACHE_NAME = 'media-download-v6';

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
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
        keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))
    )).then(() => self.clients.claim())
  );
});

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
        // Solo guardamos en caché si recibimos respuesta válida, 
        // y omitimos extensiones de chrome u otros esquemas.
        if (network && network.status === 200 && network.type !== 'opaque') {
           caches.open(CACHE_NAME).then((cache) => cache.put(event.request, network.clone()));
        }
        return network;
      }).catch(() => {});
      return cached || fetchPromise;
    })
  );
});
