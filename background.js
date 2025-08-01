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


chrome.runtime.onInstalled.addListener(() => {
  const top_parameters = ["redirectTo", "redirectUrl", "redirectURL", "redirect_url", "redirect_to", "q","s","search","id","lang","keyword","query","page","keywords","year","view","email","type","name","p","month","image","list_type","url","terms","categoryid","key","login","begindate","enddate"]

  chrome.storage.local.set({"top_parameters": top_parameters}, () => {
  });
});


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