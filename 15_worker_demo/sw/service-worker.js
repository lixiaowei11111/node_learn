const _this = this;
// const version = "v1";
const version = "v2";
const cacheFile = ["/", "/index.html", "index.css", "index.js"];
this.addEventListener("install", (event) => {
  this.skipWaiting();
  event.waitUntil(
    caches.open(version).then((cache) => {
      return cache.addAll(cacheFile);
    })
  );
});
this.addEventListener("fetch", async (event) => {
  const { request } = event;
  event.respondWith(
    caches.match(request.clone()).catch(() => {
      return fetch(request.clone()).catch();
    })
  );
});
this.addEventListener("activate", (event) => {
  const wihleList = [version];
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (!wihleList.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});
