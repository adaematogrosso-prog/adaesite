const CACHE_VERSION = "adaemt-v1";
const PRECACHE_URLS = ["/", "/login", "/imagenspublicas/logoalumni2.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (requestUrl.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (
            response.ok &&
            (requestUrl.pathname.startsWith("/_next/static/") ||
              requestUrl.pathname.startsWith("/imagenspublicas/"))
          ) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }

          return response;
        })
        .catch(async () => {
          if (event.request.mode === "navigate") {
            const fallback = await caches.match("/");
            if (fallback) return fallback;
          }

          throw new Error("offline");
        });
    }),
  );
});
