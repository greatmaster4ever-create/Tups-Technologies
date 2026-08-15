const CACHE_NAME = "tups-school-v2.0";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/school-template.html",
  "/school-template.css",
  "/student-dashboard-template.html",
  "/student-dashboard-template.css",
  "/icons-192.png",
  "/icons-512.png",
  "/school-template.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {

  const requestURL =
    new URL(event.request.url);

  // ==========================================
  // ONLY HANDLE TUPS TECHNOLOGIES REQUESTS
  // ==========================================

  if (
    requestURL.origin !== self.location.origin
  ) {

    return;

  }


  event.respondWith(

    caches.match(
      event.request
    )

    .then(response => {

      return (
        response ||
        fetch(event.request)
      );

    })

  );

});