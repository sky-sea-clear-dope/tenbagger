// PWA用サービスワーカー: ネットワーク優先、オフライン時はキャッシュ表示
// CACHE名を変えると古いキャッシュを捨てて新版を確実に読み込ませられる
const CACHE = "tenx-v2";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html", "./manifest.json", "./icon-192.png"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  if (e.request.url.includes("prices.json")) return; // 株価データは常に最新を取得(キャッシュしない)
  e.respondWith(
    fetch(e.request).then(r => {
      const clone = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
