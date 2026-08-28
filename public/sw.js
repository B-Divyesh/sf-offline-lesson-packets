const CACHE = 'lesson-packet-shell-v5';
const CORE = ['/', '/index.html', '/404.html', '/privacy/', '/terms/', '/favicon.svg', '/apple-touch-icon.png', '/assets/hero-risograph-720.webp', '/assets/hero-risograph-1280.webp'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch('/index.html');
    const html = await response.clone().text();
    const rootResponse = response.clone();
    await cache.put('/index.html', response);
    await cache.put('/', rootResponse);
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
    if (event.request.mode === 'navigate') {
      try {
        const response = await fetch(event.request, { cache: 'no-store' });
        if (response.ok) (await caches.open(CACHE)).put(event.request, response.clone());
        return response;
      } catch {
        const cached = (await caches.match(event.request, { ignoreVary: true })) || (await caches.match('/index.html', { ignoreVary: true }));
        if (!cached) return Response.error();
        const headers = new Headers(cached.headers);
        headers.delete('content-length');
        const html = (await cached.text()).replace('<body>', '<body data-offline-fallback="true">');
        return new Response(html, { status: cached.status, statusText: cached.statusText, headers });
      }
    }
    const cached = await caches.match(event.request, { ignoreVary: true });
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) (await caches.open(CACHE)).put(event.request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});
