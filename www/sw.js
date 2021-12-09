/** VARS */
const CACHE_NAME = "offline";
const OFFLINE_URL = "offline.html";

/** FUNCTIONS */

/** Fetch */

const respondWithFetchPromiseNavigate = (event) =>
  new Promise((resolve) => {
    event.preloadResponse
      .then((preloadResponse) => {
        if (preloadResponse) {
          resolve(preloadResponse);
        }

        // Always try the network first.
        fetch(event.request)
          .then((networkResponse) => {
            resolve(networkResponse);
          })
          // send cache offline.html
          .catch(() => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.match(OFFLINE_URL).then((cachedResponse) => {
                resolve(cachedResponse);
              });
            });
          });
      })
      .catch(() => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.match(OFFLINE_URL).then((cachedResponse) => {
            resolve(cachedResponse);
          });
        });
      });
  });

  const fetchSW = (event) => {
    // We only want to call event.respondWith() if this is a navigation request
    // for an HTML page.
    if (event.request.mode === "navigate") {
      event.respondWith(respondWithFetchPromiseNavigate(event));
    } else if (CACHED_FILES.includes(event.request.url)) {
      event.respondWith(caches.match(event.request));
    }
  };
  

/*********************************** */


const CACHE_NAME = "offline-v2";
const deleteOldCaches = () =>
  new Promise((resolve) => {
    caches.keys().then((keys) => {
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            caches.delete(key);
          }
        })
      ).finally(resolve);
    });
  });

  /** Activate */
const waitUntilActivatePromise = () =>
  new Promise((resolve) => {
    deleteOldCaches().then(() => {
      if ("navigationPreload" in self.registration) {
        self.registration.navigationPreload.enable().finally(resolve);}});});




const activate = (event) => {
  event.waitUntil(waitUntilActivatePromise());
  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
};

/*********************************** */

const ORIGIN_URL = `${location.protocol}//${location.host}`;
const CACHED_FILES = [
  OFFLINE_URL,
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.2/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.2/dist/js/bootstrap.bundle.min.js",
  `${ORIGIN_URL}/css/index.css`,
  `${ORIGIN_URL}/js/index.js`,
  `${ORIGIN_URL}/img/logo.png`,
];
const waitUntilInstallationPromise = () =>
  new Promise((resolve) => {
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(CACHED_FILES).then(resolve);
    });
  });


const installSW = (event) => {
  event.waitUntil(waitUntilInstallationPromise());
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
};
/*********************************** */

/** INIT */
self.addEventListener("install", installSW);
self.addEventListener("activate", activate);
self.addEventListener("fetch", fetchSW);
