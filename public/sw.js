const V = "english-daily-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const q = e.request;
  if (q.method !== "GET" || !q.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(q).then((r) => { const c = r.clone(); caches.open(V).then((x) => x.put(q, c)); return r; })
      .catch(() => caches.match(q).then((r) => r || caches.match("/")))
  );
});
