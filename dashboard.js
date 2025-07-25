const hostname = decodeURIComponent(location.href.split("origin=")[1]).split("//")[1]

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function removeKeywordFromStorage(origin, href, keywordToRemove) {
  chrome.storage.local.get("keywords_by_origin", (data) => {
    const all = data.keywords_by_origin || {};
    if (!all[origin] || !all[origin][href]) return;
    all[origin][href] = all[origin][href].filter(
      (kw) => kw !== keywordToRemove
    );
    if (all[origin][href].length === 0) {
      delete all[origin][href];
    }
    if (Object.keys(all[origin]).length === 0) {
      delete all[origin];
    }
    chrome.storage.local.set({ keywords_by_origin: all });
  });
}


function removeLogFunction(page, origin, pageURL, keyword){
  page.remove()
  removeKeywordFromStorage(origin, pageURL, keyword)
}

async function loadOriginData(origin) {
  document.getElementById("origin").textContent = `🔗 Origin: ${origin}`;

  const { keywords_by_origin } = await chrome.storage.local.get("keywords_by_origin");
  const pages = (keywords_by_origin && keywords_by_origin[origin]) || {};

  const dataDiv = document.getElementById("data");
  dataDiv.innerHTML = "";

  Object.entries(pages).forEach(([pageURL, keywords]) => {
    keywords.forEach(keyword => {
      const pageDiv = document.createElement("div");
      pageDiv.className = "page";

      const title = document.createElement("strong");
      const anchor = document.createElement("a")
      anchor.href = pageURL
      anchor.target = "_blank"
      anchor.innerText = pageURL
      title.appendChild(anchor)
      pageDiv.appendChild(title);
      const kw = document.createElement("div");
      kw.className = "keyword";
      kw.textContent = keyword;
      pageDiv.appendChild(kw);
      let remove_log_btn = document.createElement("button")
      remove_log_btn.classList.add("removeLogBtn")
      remove_log_btn.innerText = "remove"
      pageDiv.appendChild(remove_log_btn)
      remove_log_btn.addEventListener("click", () => {
        removeLogFunction(pageDiv, origin, pageURL, keyword)
      })
      dataDiv.appendChild(pageDiv);
    });

  });
}

const origin = getQueryParam("origin");
if (origin) {
  loadOriginData(origin);
}
