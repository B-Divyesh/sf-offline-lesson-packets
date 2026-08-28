const CACHE = 'lesson-packet-shell-v1';
const CORE = ['/', '/index.html', '/privacy/', '/terms/', '/favicon.svg', '/assets/hero-risograph-720.webp', '/assets/hero-risograph-1280.webp'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch('/index.html');
    const html = await response.clone().text();
    await cache.put('/index.html', response);
    await cache.put('/', response.clone());
    const assets = Array.from(html.matchAll(/(?:src|href)="(\/[^"#]+)"/g), (match) => match[1]);
    await Promise.allSettled([...new Set([...CORE, ...assets])].map((url) => cache.add(url)));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) (await caches.open(CACHE)).put(event.request, response.clone());
      return response;
    } catch {
      if (event.request.mode === 'navigate') return (await caches.match('/index.html')) || Response.error();
      return Response.error();
    }
  })());
});
