const CACHE_NAME = 'robot-app-v2';
const ASSETS = ['/', 'app.html', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // 所有请求使用网络优先策略，确保始终获取最新内容
  e.respondWith(
    fetch(e.request).then(response => {
      // 成功获取网络响应后更新缓存
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      }
      return response;
    }).catch(() => {
      // 网络失败时使用缓存（离线兜底）
      return caches.match(e.request);
    })
  );
});
