var deferredPrompt;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(function() {
    console.log("Service worker registered!");
  });
}

window.addEventListener("beforeinstallprompt", function(event) {
  console.log("beforeinstallprompt fired");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

var promise = new Promise((resolve, reject) => {
  setTimeout(function() {
    reject({ code: 500, message: "An error occurred!" });
    resolve("This is executed once the timer is done!");
  }, 3000);
});

fetch("https://httpbin.org/ip")
  .then(response => {
    console.log({ response });
    return response.json();
  })
  .then(parsedJsonData => {
    console.log({ parsedJsonData });
  })
  .catch(err => {
    console.log(err);
  });

fetch("https://httpbin.org/post", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json" // accept is not always necessary
  },
  mode: "cors", // 'cors' | 'no-cors'
  body: JSON.stringify({
    message: "Hello from outer space! 👽"
  })
})
  .then(res => {
    return res.json();
  })
  .then(res2 => {
    console.log(res2);
  })
  .catch(err => {
    throw new Error("Resistance is futile! 👾");
  });

promise
  .then(text => {
    // more async stuff
    return text.toUpperCase();
  })
  .then(newText => {
    console.log(`The result: ${newText}`);
  })
  .catch(err => {
    console.error(err.message);
  });

console.log("This is executed right after setTimeout()");
