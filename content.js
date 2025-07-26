const origin = location.origin;
let uniqueParameters = []
function isUnlikelyWebParam(param) {
  if (param.length > 20 && !param.includes('_')) return true;
  if (/^[a-zA-Z0-9]+$/.test(param) && param.length >= 8) {
    const entropy = estimateEntropy(param);
    if (entropy > 3.5) return true;
  }
  return false;
}
function estimateEntropy(str) {
  const freq = {};
  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (let char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
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

function getOriginFactors(origin, callback) {
  chrome.storage.local.get("origin_factors", (data) => {
    const allFactors = data.origin_factors || {};
    const originData = allFactors[origin] || null;

    callback(originData);
  });
}

function checkForParameters() {
    const bodyText = document.body.innerHTML.toLowerCase();
    getOriginFactors(origin, (factors) => {
      if (factors) {
        if (factors.id == 1){
          uniqueParameters = uniqueParameters.concat([...new Set(
            Array.from(document.querySelectorAll('[id]')).map(el => el.id)
          )]);

          uniqueParameters = [...new Set(uniqueParameters)]
          saveKeywordsToOriginFactors(uniqueParameters, location.href.split("?")[0], origin)
          console.log(uniqueParameters.length);
          console.log("id attributes: ", factors.id)
        }
        if (factors.class == 1){
          uniqueParameters = uniqueParameters.concat([...new Set(
            Array.from(document.querySelectorAll('[class]'))
              .flatMap(el => Array.from(el.classList))
              .filter(cls => cls)
          )]);
          uniqueParameters = [...new Set(uniqueParameters)]
          saveKeywordsToOriginFactors(uniqueParameters, location.href.split("?")[0], origin)
          console.log(uniqueParameters.length);
          console.log("class attributes: ", factors.class)
        }
        if (factors.name == 1){
          uniqueParameters = uniqueParameters.concat([...new Set(
            Array.from(document.querySelectorAll('[name]')).map(el => el.getAttribute('name'))
          )])
          uniqueParameters = [...new Set(uniqueParameters)]
          saveKeywordsToOriginFactors(uniqueParameters, location.href.split("?")[0], origin)
          console.log(uniqueParameters.length);
          console.log("name attributes: ", factors.name)
        }
        if (factors.href == 1){
          const uniqueHrefs = [...new Set(
            Array.from(document.querySelectorAll('[href]'))
              .map(el => el.getAttribute('href'))
              .filter(href => href)
          )]
          uniqueParameters = [...new Set(uniqueParameters)]
          console.log(uniqueHrefs);
          console.log("href attributes: ", factors.href)
        }
        if (factors.src == 1){
          const uniqueSrcs = [...new Set(
            Array.from(document.querySelectorAll('[src]'))
              .map(el => el.getAttribute('src'))
              .filter(src => src)
          )]
          console.log(uniqueSrcs);
          console.log("src attributes: ", factors.src)
        }
        console.log(uniqueParameters.length);
        
        if (factors.js_files == 1){
          console.log("js_files attributes: ", factors.js_files)
        }
        
        if (factors.json == 1){
          console.log("json attributes: ", factors.json)
        }
        if (factors.url == 1){
          console.log("url attributes: ", factors.url)
        }
      }
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

function getKeywordsByPageUrl(origin, pageUrl, callback) {
  const storageKey = 'origin_url_keywords';

  chrome.storage.local.get([storageKey], (result) => {
    const allData = result[storageKey] || {};

    if (!allData[origin]) {
      console.warn(`Origin "${origin}" not found.`);
      callback(null);
      return;
    }

    const pageData = allData[origin][pageUrl];

    if (!pageData) {
      console.warn(`Page URL "${pageUrl}" not found under origin "${origin}".`);
      callback(null);
      return;
    }

    callback(pageData.keywords || []);
  });
}



chrome.storage.local.get("added_origins", (result) => {
  const arr = result["added_origins"] || [];
  if (arr.includes(origin)) {
    const observer = new MutationObserver((e) => {
        getKeywordsByPageUrl(origin, location.href.split("?")[0], (keywords) => {
          if (keywords) {
            chrome.runtime.sendMessage({ type: "setBadge", text: keywords.length.toString() });
          } else {
            chrome.runtime.sendMessage({ type: "setBadge", text: "0" });
          }
        });
        checkForParameters();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
    });
  }else{
    chrome.runtime.sendMessage({ type: "setBadge", text: "off" });
  }
});
