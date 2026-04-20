const CACHE_NAME = "tups-school-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/sch001.html",
  "/school.css",
  "/school.js"
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
