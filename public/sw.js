var version = "6";
var latestStaticCacheName = `static-v${version}`;
var latestDynamicCacheName = `dynamic-v${version}`;
var latestCacheNames = [latestStaticCacheName, latestDynamicCacheName];

self.addEventListener("install", function(event) {
  console.log("[Service Worker] Installing Service Worker ...", event);
  event.waitUntil(
    caches.open(latestStaticCacheName).then(cache => {
      // add content to the cache
      console.log("[Service Worker] Precaching App Shell", event);
      cache.addAll([
        "/offline.html",
        "/", // 'example.com/' is a different request than 'example.com/index.html', which is why you also need to cache this request. Requests are cached, not paths.
        "/index.html",
        "/src/js/app.js",
        "/src/js/feed.js",
        /*
        don't need these, only necessary for browsers that don't support caching anyways. 
        Still including them because they aren't conditionally loaded only in browsers that need them , for performance reasons */
        "/src/js/promise.js",
        "/src/js/fetch.js",
        "/src/js/material.min.js",

        // css
        "src/css/app.css",
        "src/css/feed.css",
        // img
        "/src/images/main-image.jpg",
        // external assets'
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
      ]); // reaches to the server, gets the data & stores a key/value-pair in the cache
    })
  ); // ensures installation is finsished until other operations are executed.
});

// The activate event is fired when a user has closed all pages and opens the application again. This is a good place to update the cache because the application wasn't running anymore.
self.addEventListener("activate", function(event) {
  console.log("[Service Worker] Activating Service Worker ....", event);

  // wait until it is finished so fetch events don't use the old cache
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(key => {
          if (latestCacheNames.includes(key) === false) {
            // delete the key if it is not one of the latest caches
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  return self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    // look for the cached key/value-pair
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      } else {
        // if it is _not_ cached, just execute the original request.
        return fetch(event.request)
          .then(res => {
            // store whatever comes back from the request
            return caches.open(latestDynamicCacheName).then(cache => {
              // put is just like add, except it requires that you provide it with the request key value pair. Put does not send a request, it just stores available data
              cache.put(event.request.url, res.clone()); // cloning is necessary, because a response typically is a one-time-use. If you don't clone the response will be empty, becasuse storing the response in the cache also 'uses' the response.
              // Put does not make a request
              return res;
            });
          })
          .catch(err => {
            return caches.open(latestStaticCacheName).then(cache => {
              return cache.match("/offline.html");
            });
          });
      }
    })
    // If there is no matching key, this just returns null. No need to .catch()
  );
});
