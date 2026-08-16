// MonsterQuest service worker — precache everything for offline play.
const CACHE = "monsterquest-v4";
const ASSETS = [
  ".",
  "index.html",
  "manifest.webmanifest",
  "js/audio.js",
  "js/data.js",
  "js/maps.js",
  "js/towns.js",
  "js/sprites.js",
  "js/battle.js",
  "js/game.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        // cache same-origin responses so updates keep working offline
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => {
        // navigation fallback while offline
        if (e.request.mode === "navigate") return caches.match("index.html");
        throw new Error("offline");
      });
    })
  );
});
