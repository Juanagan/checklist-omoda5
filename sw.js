/* Service worker del checklist de entrega del Omoda 5.
   Estrategia: red primero, caché como respaldo. Así siempre ves la última
   versión si hay cobertura, y sigue funcionando en el sótano del concesionario.
   Al publicar cambios, sube el número de versión de esta línea. */
const CACHE = 'checklist-omoda5-v2.3.0';

/* Tienen que existir sí o sí: si uno falla, no se instala la caché. */
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/og.png',
  './assets/fonts/ibm-plex-sans-latin-400-normal.woff2',
  './assets/fonts/ibm-plex-sans-latin-600-normal.woff2',
  './assets/fonts/ibm-plex-mono-latin-400-normal.woff2',
  './assets/fonts/ibm-plex-mono-latin-600-normal.woff2',
  './assets/fonts/space-grotesk-latin-700-normal.woff2'
];

/* Pueden faltar sin que pase nada. */
const EXTRA = [
  './assets/omoda5.png',
  './assets/omoda-wordmark.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll(CORE).then(() =>
        Promise.all(EXTRA.map(u => c.add(u).catch(() => {})))
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(m => m || caches.match('./index.html')))
  );
});
