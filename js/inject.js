(function () {
  // Hook کردن fetch
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = args[0];
    // if((new URL(url)).pathname.endsWith("js")){
    // }
    console.log("FETCH", typeof url === "string" ? "GET" : url.method || "GET", url.toString());
    return originalFetch(...args);
  };

  // Hook کردن XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    // if((new URL(url)).pathname.endsWith("js")){
    // }
    console.log("XHR", method, url);
    return originalOpen.call(this, method, url, ...rest);
  };
})();
