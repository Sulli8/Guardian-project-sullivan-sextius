console.log('custom_sw.js loaded');

// Gestion du fetch
addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(async response => {
            if (response) {
                console.log('Return cached resource:', event.request.url);
                return response;
            }
            try {
                const networkResponse = await fetch(event.request);
                const clonedResponse = networkResponse.clone();
                const runtimeCache = await caches.open('runtime-cache');
                runtimeCache.put(event.request, networkResponse);
                console.log('Put resource in cache:', event.request.url);
                return clonedResponse;
            } catch (error) {
                console.error('Fetch failed, returning offline fallback:', error);
                return caches.match('/offline.html');
            }
        })
    );
});

// Gestion des notifications push
self.addEventListener('push', event => {
    console.log('Push event received');

    if (!event.data) {
        console.warn('Push event with no data');
        return;
    }

    event.waitUntil(
        (async () => {
            try {
                const payload = await event.data.json();
                const options = {
                    body: payload.notification?.body || 'Default body',
                    icon: payload.notification?.icon || '/default-icon.png',
                    badge: '/badge-icon.png',
                    actions: payload.notification?.actions || []
                };
                await self.registration.showNotification(payload.notification?.title || 'Default title', options);
            } catch (error) {
                console.error('Error handling push event:', error);
            }
        })()
    );
});

// Activation et nettoyage des caches
self.addEventListener('activate', event => {
    const cacheWhitelist = ['runtime-cache'];
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );
    event.waitUntil(self.clients.claim());
});
