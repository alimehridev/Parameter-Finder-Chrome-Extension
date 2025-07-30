function wildcardMatch(pattern, str, returnValue = false) {
  const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');
  const regexPattern = '^' + escaped.replace(/\*/g, '.*') + '$';
  const regex = new RegExp(regexPattern);
  const matched = regex.test(str);

  if (returnValue) {
    return matched ? pattern : false;
  } else {
    return matched;
  }
}

function matchAnyPattern(patterns, str, returnValue = false) {
  for (const pattern of patterns) {
    const res = wildcardMatch(pattern, str, true);
    if (res) {
      if (returnValue) {
        return res;
      } else {
        return true;
      }
    }
  }
  return false;
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "setBadge") {
    chrome.action.setBadgeText({ tabId: sender.tab.id, text: message.text });
    chrome.action.setBadgeBackgroundColor({ tabId: sender.tab.id, color: "#ff8f8fff" });
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get("urls", (result) => {
    const arr = result["urls"] || [];
    let url = (new URL(tab.url).origin) + (new URL(tab.url).pathname);
    if (matchAnyPattern(arr, url)) {
      url = chrome.runtime.getURL("dashboard.html") + `?url=${encodeURIComponent(url)}`;
      chrome.tabs.create({ url });
    }else{
      url = chrome.runtime.getURL("dashboard.html") + `?url_add=${encodeURIComponent(url)}`;
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