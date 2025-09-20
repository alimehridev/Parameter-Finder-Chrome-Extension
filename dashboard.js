function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function countUppercase(str) {
  const matches = str.match(/[A-Z]/g);
  return matches ? matches.length : 0;
}
function countLowercase(str) {
  const matches = str.match(/[a-z]/g);
  return matches ? matches.length : 0;
}
function countNumbers(str) {
  const matches = str.match(/[0-9]/g);
  return matches ? matches.length : 0;
}



function getKeywordsByURL(url, callback) {
  if (!chrome.runtime?.id) {
    console.warn("Extension context is invalidated.");
    return;
  }
  chrome.storage.local.get("url_keywords", (data) => {
    const all = data.url_keywords || {};

    const result = all[url] || null;
    callback(result);
  });
}

function findUrlsWithKeyword(data, keyword) {
  const result = [];
  for (const url in data) {
    const keywords = data[url].keywords || [];
    if (keywords.includes(keyword)) {
      result.push(url);
    }
  }
  return result;
}
function collectAllLinks(obj) {
  let allLinks = [];
  for (const key in obj) {
    if (obj[key].links && Array.isArray(obj[key].links)) {
      allLinks = allLinks.concat(obj[key].links);
    }
  }
  return allLinks;
}

async function loadData(url) {
  chrome.storage.local.get("js_links", (result) => {
      const arr = result["js_links"] || [];
      if(!arr){
        document.getElementById("found_js_files_count").textContent = `Javascript files crawler (0 file(s))`
        return
      }
      let links = collectAllLinks(arr[url])
      document.getElementById("found_js_files_count").textContent = `Javascript files crawler (${links.length} file(s))`
  })
  document.getElementById("urlLabel").textContent = `🔗 URL: ${url} (0)`;
  const { url_keywords: parameters_by_url = {} } = await chrome.storage.local.get("url_keywords");
  const pages = parameters_by_url[url] || {};
  
  const dataDiv = document.getElementById("data");
  dataDiv.innerHTML = "";
  let counter = 0
  let len_keywords = 0
  let per_page = 5
  let all_keywords = []
  let current_page = getQueryParam("page") ? getQueryParam("page") : 1
  await Object.entries(pages).forEach(([url, keywords]) => {
      len_keywords = keywords['keywords'].length
      all_keywords = all_keywords.concat(keywords['keywords'])  
  });
  all_keywords = [...new Set(all_keywords)]
  all_keywords.forEach(keyword => {
    if(!(counter >= (current_page - 1) * per_page) || !(counter < (current_page * per_page))){
      counter++
      return
    }
    const pageDiv = document.createElement("div");
    pageDiv.className = "page";

    const kwDiv = document.createElement("div");
    kwDiv.className = "keyword";
    const kw = document.createElement("div");

    kw.textContent = keyword;
    kwDiv.appendChild(kw)
    pageDiv.appendChild(kwDiv);
    const title = document.createElement("strong");
    let urls = findUrlsWithKeyword(pages, keyword)
    let anchors = document.createElement("div")
    anchors.classList.add("anchors")
    urls.forEach(url => {
      let anchor = document.createElement("a")
      anchor.classList.add("url-anchor")
      anchor.href = url
      anchor.target = "_blank"
      anchor.innerText = "[link]"
      anchors.appendChild(anchor)
    })
    pageDiv.appendChild(anchors);
    pageDiv.appendChild(title);
    
    let remove_log_btn = document.createElement("span")
    remove_log_btn.classList.add("removeLogBtn")
    remove_log_btn.addEventListener("click", () => {
      removeParameterFunction(getQueryParam("url"), keyword)
    })
    remove_log_btn.innerText = "x"
    pageDiv.appendChild(remove_log_btn)
    dataDiv.appendChild(pageDiv);
    counter++
  });
  len_keywords = all_keywords.length
  document.getElementById("urlLabel").textContent = `🔗 URL: ${url} (${counter})`;
  let page_count = Math.ceil(len_keywords / per_page)
  let pagination_div = document.getElementsByClassName("pagination")[0]
  let page_range
  for(let i = 1; i <= page_count; i++){

    page_range = [current_page - 2 <= 0 ? null : current_page - 2, 
      current_page - 1 <= 0 ? null : current_page - 1, 
      current_page, 
      parseInt(current_page) + 1 > page_count ? null : parseInt(current_page) + 1, 
      parseInt(current_page) + 2 > page_count ? null : parseInt(current_page) + 2
    ]
  }
  page_range.forEach((page) => {
    if (page != null){
      let page_button = document.createElement("div")
      page_button.classList.add("page-button")
      if(page == current_page){
        page_button.classList.add("page-button-active")
      }
      page_button.innerText = page
      pagination_div.appendChild(page_button)
      page_button.addEventListener("click", () => {
        if (location.href.match(/page=\d{1,5}/)){
          location = location.href.replace(location.href.match(/page=\d{1,5}/)[0], `page=${page}`)
        }else {
          location = location + `&page=${page}`
        }
      })
    }
  })
  if(!page_range.includes(1) && !page_range.includes("1")){
      let page_button = document.createElement("div")
      page_button.classList.add("page-button")
      page_button.innerText = "1"
      pagination_div.insertBefore(document.createTextNode("..."), pagination_div.firstChild)
      pagination_div.insertBefore(page_button, pagination_div.firstChild)
      page_button.addEventListener("click", () => {
        if (location.href.match(/page=\d{1,5}/)){
          location = location.href.replace(location.href.match(/page=\d{1,5}/)[0], `page=1`)
        }else {
          location = location + `&page=1`
        }
      })
  }
  if(!page_range.includes(page_count) && !page_range.includes(page_count.toString())){
      let page_button = document.createElement("div")
      page_button.classList.add("page-button")
      page_button.innerText = page_count
      
      pagination_div.appendChild(document.createTextNode("..."))
      pagination_div.appendChild(page_button)
      page_button.addEventListener("click", () => {
        if (location.href.match(/page=\d{1,5}/)){
          location = location.href.replace(location.href.match(/page=\d{1,5}/)[0], `page=${page_count}`)
        }else {
          location = location + `&page=${page_count}`
        }
      })
  }

}

if (getQueryParam("url")) {
  chrome.storage.local.get("urls", (result) => {
    const arr = result["urls"] || [];
    loadData(matchAnyPattern(arr, getQueryParam("url"), true))
  })
}

function clearURLContent(url) {
  const key = "url_keywords";

  chrome.storage.local.get([key], (result) => {
    const data = result[key] || {};

    if (data[url]) {
      data[url] = {};

      chrome.storage.local.set({ [key]: data }, () => {
        console.log(`Cleared content for URL: ${url}`);
      });
    } else {
      console.log(`Origin ${url} not found.`);
    }
  });
}

document.getElementById("removeAllBtn").addEventListener("click", () => {
  let confirmation = confirm("Are you sure ?")
  if(confirmation){
    chrome.storage.local.get("urls", (result) => {
        const arr = result["urls"] || [];
        url = matchAnyPattern(arr, getQueryParam("url"), true)
        clearURLContent(url)
        location.reload()
    })
  }
})


function removeParameterFunction(url, keywordToRemove) {
  let confirmation = confirm("Are you sure ?")
  if (confirmation){
    const key = "url_keywords";
    chrome.storage.local.get([key], (result) => {
      const data = result[key] || {};
      chrome.storage.local.get("urls", (result) => {
        const arr = result["urls"] || [];
        url = matchAnyPattern(arr, url, true)
        if (!data[url]) {
          console.warn(`URL '${url}' not found.`);
          return;
        }
  
        Object.keys(data[url]).forEach((u) => {
          const keywords = data[url][u]?.keywords;
          
          if (Array.isArray(keywords)) {
            const filtered = keywords.filter(kw => kw !== keywordToRemove);
            data[url][u].keywords = filtered;
          }
        });
  
        chrome.storage.local.set({ [key]: data }, () => {
          console.log(`Keyword '${keywordToRemove}' removed from all URLs under '${url}'.`);
        });
        location.reload()
      })
    });
  }
}

document.querySelector(".recycleBtn").addEventListener("click", () => {
  const confirmation = confirm("Are you sure ?")
  if(confirmation){
      remove_url_from_list(getQueryParam("url"))
      location.href = "dashboard.html"
  }
})


function saveKeywordsToURLFactors(keywords, href, url) {
  if (!Array.isArray(keywords) || !href || !url) {
    console.error("Invalid input");
    return;
  }

  const storageKey = 'url_keywords';

  chrome.storage.local.get([storageKey], (result) => {
    const allData = result[storageKey] || {};
    chrome.storage.local.get("urls", (result) => {
      const arr = result["urls"] || [];
      url = matchAnyPattern(arr, url, true)

      const existingEntry = allData[url][href];
  
      if (existingEntry) {
        const newKeywords = keywords.filter(kw => !existingEntry.keywords.includes(kw));
        if (newKeywords.length > 0) {
          existingEntry.keywords.push(...newKeywords);
          existingEntry.timestamp = Date.now();
        }
      } else {
        allData[url][href] = {
          keywords: [...keywords],
          timestamp: Date.now()
        };
      }
  
      chrome.storage.local.set({ [storageKey]: allData }, () => {
        console.log(`Saved/updated data for URL: ${url}, URL: ${href}`);
      });
    })
  });
}

document.getElementById("addCustomParameterBtn").addEventListener("click", () => {
  let customPrompt = prompt("Enter your custom parameter value:")
  if (customPrompt != null){
    customPrompt = customPrompt.split(",")
    customPrompt = customPrompt.map(item => item.trim())
    chrome.storage.local.get("urls", (result) => {
      const arr = result["urls"] || [];
      url = matchAnyPattern(arr, getQueryParam("url"), true)
      saveKeywordsToURLFactors(customPrompt, url, url)
      location.reload()
    })
  }
})

document.getElementById("all").addEventListener("click", () => {
  document.getElementById("id").checked = document.getElementById("all").checked
  document.getElementById("class").checked = document.getElementById("all").checked
  document.getElementById("name").checked = document.getElementById("all").checked
  document.getElementById("href").checked = document.getElementById("all").checked
  document.getElementById("src").checked = document.getElementById("all").checked
  document.getElementById("js_inline").checked = document.getElementById("all").checked
  document.getElementById("json").checked = document.getElementById("all").checked
  document.getElementById("url").checked = document.getElementById("all").checked
  document.getElementById("js_crawler").checked = document.getElementById("all").checked
})

document.getElementById("copyAllBtn").addEventListener("click", (el) => {
  el.target.innerText = "Processing..."
  chrome.storage.local.get("url_keywords", (data) => {
    const all = data.url_keywords || {};
    chrome.storage.local.get("urls", (result) => {
      const arr = result["urls"] || [];
      url = matchAnyPattern(arr, getQueryParam("url"), true)
      const results = all[url] || null;
      navigator.clipboard.writeText([...new Set(Object.values(results).map(i => i.keywords).flat())].sort().join("\n"))
      el.target.innerText = "Copied"
      setTimeout(() => {
        el.target.innerText = "Copy all to clipboard"
      }, 500)
    })
  })
})