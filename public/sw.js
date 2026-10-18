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

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data.json(); } catch (x) {}
  e.waitUntil(self.registration.showNotification(d.title || "English Daily", { body: d.body || "Time for your daily English practice!", icon: "/icons/icon.svg", badge: "/icons/icon.svg" }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((l) => { for (const c of l) if ("focus" in c) return c.focus(); return clients.openWindow("/"); }));
});
