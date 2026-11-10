// Nihongo Study — minimal service worker
// Strategy: stale-while-revalidate for same-origin assets (instant from cache,
// refreshed in the background so deploys land on the next load); network-first
// for navigations.
const VERSION = "v9"; // above main's v5, so old cache-first caches are cleared on activate
const SHELL = `nihongo-shell-${VERSION}`; // single cache: background refreshes overwrite precached copies

const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon.svg",
  "/vendor/react.js",
  "/vendor/react-dom.js",
  "/src/data.js",
  "/src/vocab-n5.js",
  "/src/kanji-data.js",
  "/src/ime.js",
  "/src/lang.js",
  "/src/engine.js",
  "/src/theme.js",
  "/src/course-data.js",
  "/src-compiled/ui.js",
  "/src-compiled/features.js",
  "/src-compiled/home.js",
  "/src-compiled/study.js",
  "/src-compiled/screens.js",
  "/src-compiled/course.js",
  "/src-compiled/app.js",
  "/src/extra-modes.js",
  "/src/extras-quickwins.js",
  "/src/extras-sync.js",
  "/src/rewards.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // skip cross-origin (fonts/CDNs)
  if (url.pathname.startsWith("/api/")) return;    // never cache API responses

  // Network-first for navigations so deploys are picked up.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/index.html")))
    );
    return;
  }

  // Stale-while-revalidate for everything else.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fresh = fetch(req).then((res) => {
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(req, copy));
        }
        return res;
      });
      if (cached) {
        fresh.catch(() => {}); // offline: keep serving the cached copy
        return cached;
      }
      return fresh;
    })
  );
});
