chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "setBadge") {
    chrome.action.setBadgeText({ tabId: sender.tab.id, text: message.text });
    chrome.action.setBadgeBackgroundColor({ tabId: sender.tab.id, color: "#ff8f8fff" });
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get("urls", (result) => {
    const arr = result["urls"] || [];
      const origin = new URL(tab.url).origin;
      if (arr.includes(origin)) {
        const url = chrome.runtime.getURL("dashboard.html") + `?origin=${encodeURIComponent(origin)}`;
        chrome.tabs.create({ url });
      }else{
        const url = chrome.runtime.getURL("dashboard.html") + `?origin_add=${encodeURIComponent(origin)}`;
        chrome.tabs.create({ url });
      }
  });
});


// chrome.webRequest.onCompleted.addListener(
//   function (details) {
//     if (details.url.toLowerCase().endsWith(".js")) {
//       console.log("[Network JS File]", details.method, details.url);
//     }
//   },
//   { urls: ["<all_urls>"], types: ["script", "xmlhttprequest", "other"] }
// );