// Silent Help — minimal offline-first service worker.
//
// Strategy:
//   - Precache the critical crisis surface (/sos, /tools and their assets)
//     so it works with zero internet.
//   - Navigation requests: network-first, falling back to the cached shell.
//   - Everything else: stale-while-revalidate.
//   - API requests (/api/*) are never cached — they always hit the network.
//
// Never caches auth pages or any user-specific data.

const CACHE_NAME = 'silent-help-v1';
const PRECACHE_URLS = [
    '/',
    '/sos',
    '/tools',
    '/offline',
    '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Bail for non-GET and non-http(s).
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (!url.protocol.startsWith('http')) return;

    // Never cache API responses.
    if (url.pathname.startsWith('/api/')) return;

    // Navigation: network-first with shell fallback.
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => undefined);
                    return res;
                })
                .catch(async () => {
                    const cached = await caches.match(req);
                    if (cached) return cached;
                    // Fall back to SOS cache when offline and route unknown.
                    const sos = await caches.match('/sos');
                    if (sos) return sos;
                    return new Response(
                        '<!doctype html><meta charset="utf-8"><title>Offline</title><body style="font-family:system-ui;background:#0b1220;color:#e2e8f0;padding:2rem"><h1>You are offline</h1><p>Breathing, SOS and journal drafts still work. Try again when you have signal.</p></body>',
                        { headers: { 'content-type': 'text/html; charset=utf-8' } },
                    );
                }),
        );
        return;
    }

    // Stale-while-revalidate for everything else.
    event.respondWith(
        caches.match(req).then((cached) => {
            const network = fetch(req)
                .then((res) => {
                    if (res && res.status === 200 && res.type !== 'opaque') {
                        const copy = res.clone();
                        caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => undefined);
                    }
                    return res;
                })
                .catch(() => cached);
            return cached || network;
        }),
    );
});
