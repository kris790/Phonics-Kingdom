// Phonics Kingdom Service Worker
// Enables offline-first functionality for the PWA

const CACHE_NAME = 'phonics-kingdom-v1';
const RUNTIME_CACHE = 'phonics-kingdom-runtime';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Install complete');
        // Force waiting service worker to become active
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Precache failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('[ServiceWorker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // For navigation requests (HTML pages), use network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the latest version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cached version
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For static assets (JS, CSS, images), use cache-first strategy
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Return cached, but also fetch and update cache in background
          event.waitUntil(
            fetch(request)
              .then((response) => {
                caches.open(RUNTIME_CACHE).then((cache) => {
                  cache.put(request, response);
                });
              })
              .catch(() => {
                // Network failed, that's okay we have cache
              })
          );
          return cached;
        }

        // Not in cache, fetch and cache
        return fetch(request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => {
            // Return a fallback for images
            if (request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#ddd" width="100" height="100"/><text fill="#888" x="50%" y="50%" text-anchor="middle" dy=".3em">📷</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            throw new Error('Network unavailable');
          });
      })
    );
    return;
  }

  // For API requests (future Gemini API), use network-first with timeout
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      Promise.race([
        fetch(request),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ])
      .then((response) => {
        // Cache successful API responses
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache for API
        return caches.match(request);
      })
    );
    return;
  }

  // Default: network-first
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    // Pre-cache audio files for offline TTS
    const audioUrls = event.data.urls;
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.addAll(audioUrls).catch((err) => {
        console.log('[ServiceWorker] Failed to cache audio:', err);
      });
    });
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    // Report cache size for analytics
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.keys().then((keys) => {
        event.ports[0].postMessage({ cacheSize: keys.length });
      });
    });
  }
});

// Background sync for offline actions (when supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    console.log('[ServiceWorker] Syncing progress data...');
    // In production, this would sync localStorage data to a server
  }
});

// Push notifications (for future features like daily reminders)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Time to practice your phonics!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'play', title: '🎮 Play Now' },
      { action: 'later', title: '⏰ Later' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Phonics Kingdom', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'later') {
    return;
  }

  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window if open
        for (const client of windowClients) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        return clients.openWindow(url);
      })
  );
});

console.log('[ServiceWorker] Script loaded');
