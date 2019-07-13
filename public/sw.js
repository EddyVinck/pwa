self.addEventListener("install", function(event) {
  console.log("[Service Worker] Installing Service Worker ...", event);
  event.waitUntil(
    caches.open("my-static-cached-assets").then(cache => {
      // add content to the cache
      console.log("[Service Worker] Precaching App Shell", event);
      cache.addAll([
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
        // external assets
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
      ]); // reaches to the server, gets the data & stores a key/value-pair in the cache
    })
  ); // ensures installation is finsished until other operations are executed.
});

self.addEventListener("activate", function(event) {
  console.log("[Service Worker] Activating Service Worker ....", event);
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
        return fetch(event.request);
      }
    })
    // If there is no matching key, this just returns null. No need to .catch()
  );
});
