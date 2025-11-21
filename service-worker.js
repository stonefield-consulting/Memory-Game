// service-worker.js
// Offline-ready, cache-first service worker for Seek-A-Boo (Stanfield Edition)

const CACHE_NAME = "seekaboo-cache-v1";

// Core assets that must be available for the game to run offline
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./game.js",

  // Card images (use the same relative paths as in game.js: `images/...`)
  "images/banana.png",
  "images/milk.png",
  "images/carrot.png",
  "images/cookie.png",
  "images/broccoli.png",
  "images/apple.png",

  "images/jacket.png",
  "images/socks.png",
  "images/hat.png",
  "images/tshirt.png",
  "images/jeans.png",
  "images/shoes.png",

  "images/mailbox.png",
  "images/butterfly.png",
  "images/stop_sign.png",
  "images/leaf.png",
  "images/sunflower.png",
  "images/umbrella.png",

  "images/purple_rectangle.png",
  "images/red_circle.png",
  "images/blue_heart.png",
  "images/orange_triangle.png",
  "images/green_square.png",
  "images/yellow_diamond.png",

  "images/beach_ball.png",
  "images/tricycle.png",
  "images/teddy_bear.png",
  "images/wooden_blocks.png",
  "images/drum.png",
  "images/red_toy_car.png",

  "images/duck.png",
  "images/cat.png",
  "images/horse.png",
  "images/dog.png",
  "images/pig.png",
  "images/goldfish.png"
];

// INSTALL: pre-cache all core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ACTIVATE: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH: cache-first strategy for all GET requests
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache if available
        return cachedResponse;
      }

      // Fall back to network and cache any successful responses
      return fetch(request)
        .then((networkResponse) => {
          // Only cache valid, same-origin, basic (non-extension) responses
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Optional: you could return a fallback image or page here
          // when completely offline and the resource is not in cache.
          return caches.match("./index.html");
        });
    })
  );
});
