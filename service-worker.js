const CACHE_NAME = "tups-school-v2.1";

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


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)

        .then(
          async cache => {

            for (
              const url of urlsToCache
            ) {

              try {

                await cache.add(url);

              }
              catch (error) {

                console.warn(
                  "Service Worker could not cache:",
                  url,
                  error
                );

              }

            }

          }

        )

    );

  }
);


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()

        .then(
          cacheNames => {

            return Promise.all(

              cacheNames
                .map(
                  cacheName => {

                    if (
                      cacheName !== CACHE_NAME
                    ) {

                      return caches.delete(
                        cacheName
                      );

                    }

                  }
                )

            );

          }

        )

    );

  }
);


/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
  "fetch",
  event => {

    const requestURL =
      new URL(
        event.request.url
      );


    /* -----------------------------------------
       ONLY HANDLE SAME-ORIGIN REQUESTS
    ----------------------------------------- */

    if (
      requestURL.origin !==
      self.location.origin
    ) {

      return;

    }


    /*
     * Only handle GET requests.
     */

    if (
      event.request.method !== "GET"
    ) {

      return;

    }


    event.respondWith(

      caches
        .match(
          event.request
        )

        .then(
          response => {

            if (response) {

              return response;

            }


            return fetch(
              event.request
            );

          }

        )

        .catch(
          error => {

            console.warn(
              "Service Worker fetch failed:",
              event.request.url,
              error
            );


            /*
             * Return a normal network error
             * instead of throwing an unhandled
             * service-worker promise rejection.
             */

            return new Response(
              "",
              {
                status: 503,
                statusText:
                  "Service Unavailable"
              }
            );

          }

        )

    );

  }
);