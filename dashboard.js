function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}
const hostname = getQueryParam("origin")

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

function entropy(str) {
  str.split("_").length == 2 ? str = str.replaceAll("_", "") : str = str
  str.split("-").length == 2 ? str = str.replaceAll("-", "") : str = str
  const len = str.length

  // Build a frequency map from the string.
  const frequencies = Array.from(str)
    .reduce((freq, c) => (freq[c] = (freq[c] || 0) + 1) && freq, {})

  // Sum the frequency of each character.
  let result = Object.values(frequencies)
    .reduce((sum, f) => sum - f/len * Math.log2(f/len), 0)
  const uppercase_ltr = countUppercase(str)
  const lowercase_ltr = countLowercase(str)
  const numbers_count = countNumbers(str)
  if(((len/2) - 1 <= uppercase_ltr) && (len/2) - 1 <= lowercase_ltr){
    result += 0.5
  }
  if(numbers_count > uppercase_ltr + lowercase_ltr){
    result += 0.5
  }

  return result
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


function getKeywordsByOrigin(origin, callback) {
  if (!chrome.runtime?.id) {
    console.warn("Extension context is invalidated.");
    return;
  }
  chrome.storage.local.get("origin_url_keywords", (data) => {
    const all = data.keywords_by_origin || {};

    const result = all[origin] || null;
    callback(result);
  });
}


function removeLogFunction(page, origin, pageURL, keyword){
  page.remove()
  removeKeywordFromStorage(origin, pageURL, keyword)
}

async function loadOriginData(origin) {
  document.getElementById("origin").textContent = `🔗 Origin: ${origin} (0)`;
  const { origin_url_keywords: parameters_by_origin = {} } = await chrome.storage.local.get("origin_url_keywords");
  const pages = parameters_by_origin[origin] || {};

  const dataDiv = document.getElementById("data");
  dataDiv.innerHTML = "";
  let counter = 0
  let len_keywords = 0
  let per_page = 5
  let current_page = getQueryParam("page") ? getQueryParam("page") : 1
  await Object.entries(pages).forEach(([url, keywords]) => {
    len_keywords = keywords['keywords'].length

    keywords['keywords'].forEach(keyword => {

      let ent = parseInt((80 - (entropy(keyword) * 20)) * 2)
      if(keyword.length > 15){
        len_keywords -= 1
        return
      }
      ent = ent <= 0 ? 0 : (ent >= 100 ? 100 : ent)
      if (ent == 0){
        len_keywords -= 1
        return
      }
      if(!(counter >= (current_page - 1) * per_page) || !(counter < (current_page * per_page))){
        counter++
        return
      }
      const pageDiv = document.createElement("div");
      pageDiv.className = "page";

      const kw = document.createElement("div");
      kw.className = "keyword";

      const entPercentage = document.createElement("span")
      entPercentage.classList.add("ent-percentage")
      entPercentage.innerText = `(${ent}%)`
      kw.textContent = keyword;
      pageDiv.appendChild(kw);
      pageDiv.appendChild(entPercentage)
      const title = document.createElement("strong");
      const anchor = document.createElement("a")
      anchor.classList.add("url-anchor")
      anchor.href = url
      anchor.target = "_blank"
      anchor.innerText = "[link]"
      title.appendChild(anchor)
      pageDiv.appendChild(title);
      
      let remove_log_btn = document.createElement("span")
      remove_log_btn.classList.add("removeLogBtn")
      remove_log_btn.addEventListener("click", () => {
        removeParameterFromOrigin(hostname, keyword)
      })
      remove_log_btn.innerText = "x"
      pageDiv.appendChild(remove_log_btn)
      dataDiv.appendChild(pageDiv);
      counter++
    });
    
  });
  document.getElementById("origin").textContent = `🔗 Origin: ${origin} (${counter})`;
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

if (hostname) {
  loadOriginData(hostname);
}

function clearOriginContent(origin) {
  const key = "origin_url_keywords";

  chrome.storage.local.get([key], (result) => {
    const data = result[key] || {};

    if (data[origin]) {
      data[origin] = {};  // محتوا رو پاک کن

      chrome.storage.local.set({ [key]: data }, () => {
        console.log(`Cleared content for origin: ${origin}`);
      });
    } else {
      console.log(`Origin ${origin} not found.`);
    }
  });
}

document.getElementById("removeAllBtn").addEventListener("click", () => {
  let confirmation = confirm("Are you sure ?")
  if(confirmation){
    clearOriginContent(hostname)
    location.reload()
  }
})


function removeParameterFromOrigin(origin, keywordToRemove) {
  let confirmation = confirm("Are you sure ?")
  if (confirmation){
    const key = "origin_url_keywords";
    chrome.storage.local.get([key], (result) => {
      const data = result[key] || {};

      if (!data[origin]) {
        console.warn(`Origin '${origin}' not found.`);
        return;
      }

      Object.keys(data[origin]).forEach((url) => {
        const keywords = data[origin][url]?.keywords;
        
        if (Array.isArray(keywords)) {
          const filtered = keywords.filter(kw => kw !== keywordToRemove);
          data[origin][url].keywords = filtered;
        }
      });

      chrome.storage.local.set({ [key]: data }, () => {
        console.log(`Keyword '${keywordToRemove}' removed from all URLs under '${origin}'.`);
      });
    });
    location.reload()
  }
}




function saveKeywordsToOriginFactors(keywords, pageUrl, origin) {
  if (!Array.isArray(keywords) || !pageUrl || !origin) {
    console.error("Invalid input");
    return;
  }

  const storageKey = 'origin_url_keywords';

  chrome.storage.local.get([storageKey], (result) => {
    const allData = result[storageKey] || {};

    if (!allData[origin]) {
      allData[origin] = {};
    }

    const existingEntry = allData[origin][pageUrl];

    if (existingEntry) {
      const newKeywords = keywords.filter(kw => !existingEntry.keywords.includes(kw));
      if (newKeywords.length > 0) {
        existingEntry.keywords.push(...newKeywords);
        existingEntry.timestamp = Date.now();
      }
    } else {
      allData[origin][pageUrl] = {
        keywords: [...keywords],
        timestamp: Date.now()
      };
    }

    chrome.storage.local.set({ [storageKey]: allData }, () => {
      console.log(`Saved/updated data for origin: ${origin}, URL: ${pageUrl}`);
    });
  });
}

document.getElementById("addCustomParameterBtn").addEventListener("click", () => {
  let customPrompt = prompt("Enter your custom parameter value:")
  if (customPrompt != null){
    customPrompt = customPrompt.split(",")
    customPrompt = customPrompt.map(item => item.trim())
    saveKeywordsToOriginFactors(customPrompt, hostname + "/", hostname)
    location.reload()
  }
})