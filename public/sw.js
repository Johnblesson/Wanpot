const CACHE_NAME = "wanpot-cache-v1";
const urlsToCache = [
  "/",
  "/dashboard",
  "/manifest.json",
  "/images/wanpot.ico",
  "/images/wanpot-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
