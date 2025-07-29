const url = location.origin + location.pathname;
let uniqueParameters = []


function saveKeywordsToURLFactors(keywords, href, url) {
  if (!Array.isArray(keywords) || !href || !url) {
    console.error("Invalid input");
    return;
  }

  const storageKey = 'url_keywords';

  chrome.storage.local.get([storageKey], (result) => {
    const allData = result[storageKey] || {};

    if (!allData[url]) {
      allData[url] = {};
    }

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
  });
}

function getURLFactors(url, callback) {
  chrome.storage.local.get("url_factors", (data) => {
    const allFactors = data.url_factors || {};
    const urlData = allFactors[url] || null;

    callback(urlData);
  });
}

function checkForParameters() {
    const bodyText = document.body.innerHTML.toLowerCase();
    getURLFactors(url, (factors) => {
      if (factors) {
        if (factors.id == 1){
          uniqueParameters = uniqueParameters.concat([...new Set(
            Array.from(document.querySelectorAll('[id]')).map(el => el.id)
          )]);

          uniqueParameters = [...new Set(uniqueParameters)]
          saveKeywordsToURLFactors(uniqueParameters, location.href.split("?")[0], url)
          console.log("id attributes: ", factors.id)
        }
        if (factors.class == 1){
          uniqueParameters = uniqueParameters.concat([...new Set(
            Array.from(document.querySelectorAll('[class]'))
              .flatMap(el => Array.from(el.classList))
              .filter(cls => cls)
          )]);
          uniqueParameters = [...new Set(uniqueParameters)]
          saveKeywordsToURLFactors(uniqueParameters, location.href.split("?")[0], url)
          console.log("class attributes: ", factors.class)
        }
        if (factors.name == 1){
          uniqueParameters = uniqueParameters.concat([...new Set(
            Array.from(document.querySelectorAll('[name]')).map(el => el.getAttribute('name'))
          )])
          uniqueParameters = [...new Set(uniqueParameters)]
          saveKeywordsToURLFactors(uniqueParameters, location.href.split("?")[0], url)
          console.log("name attributes: ", factors.name)
        }
        if (factors.href == 1){
          let hrefs = Array.from(document.querySelectorAll('[href]')).map(el => {
            if(el.href.startsWith("/") || el.href.startsWith(location.origin)){
              let href = el.href.split("?")[1]
              if(href != undefined) href = href.split("&").map(item => item.split("=")[0])
              return href
            }
            return undefined
          }).filter(item => item != undefined)
          uniqueParameters = uniqueParameters.concat([...new Set(
            hrefs
          )].flat())
          uniqueParameters = [...new Set(uniqueParameters)]
          saveKeywordsToURLFactors(uniqueParameters, location.href.split("?")[0], url)
          console.log("href attributes: ", factors.href)
        }
        if (factors.src == 1){
          let srcs = Array.from(document.querySelectorAll('[src]')).map(el => {
            if(el.getAttribute("src").startsWith("/") || el.getAttribute("src").startsWith(location.origin)){
              let src = el.getAttribute("src").split("?")[1]
              if(src != undefined) src = src.split("&").map(item => item.split("=")[0])
              return src
            }
            return undefined
          }).filter(item => item != undefined).flat()
          uniqueParameters = uniqueParameters.concat([...new Set(
            srcs
          )].flat())
          uniqueParameters = [...new Set(uniqueParameters)]
          saveKeywordsToURLFactors(uniqueParameters, location.href.split("?")[0], url)
          console.log("src attributes: ", factors.src)
        }
        
        if (factors.js_inline == 1){
          console.log("js: ", factors.js_inline)
          const scripts = document.querySelectorAll("script");
          scripts.forEach((script, index) => {
            // if (script.src) {
            //   if(script.src.startsWith(origin) || script.src.startsWith("/")){
            //     if (isProbablyLibrary(script.src) == false){
            //       console.log("[Script File]", script.src);
            //     }
            //   }
            // } else {
            script_content = script.textContent
            let var_names = []
            try{
              var_names = script_content.match(/\b(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g).map(item => item.split(" ")[1])
            }catch{}
            let json_keys = []
            try{
              json_keys = Object.keys(JSON.parse(script_content.match(/\{[\s\r\n]*"(?:[^"\\]|\\.)*"(?:[\s\S]*?)\}/g)))
            }catch{}
            let function_parameters = []
            try{
              function_parameters = script_content.match(/function\s*\w*\s*\(([^)]*)\)|(\w*\s*=\s*)?\(?\s*([^)=]*)\s*\)?\s*=>/g).map(item => item.match(/\(.*\)/g)[0].replace("(", "").replace(")", "").split(",").map(item => item.trim())).filter(item => item != "").flat()
            }catch{}
            uniqueParameters = uniqueParameters.concat([...new Set(var_names.flat().concat(json_keys.flat()).concat(function_parameters.flat()))])
            uniqueParameters = [...new Set(uniqueParameters)]
            saveKeywordsToURLFactors(uniqueParameters, location.href.split("?")[0], url)
            // }
          });
        }
        
        if (factors.json == 1){
          console.log("json attributes: ", factors.json)
        }
        if (factors.url == 1){
          uniqueParameters = uniqueParameters.concat([...new Set(
            location.search.split("?")[1].split("&").map(item => item.split("=")[0])
          )])
          uniqueParameters = [...new Set(uniqueParameters)]
          saveKeywordsToURLFactors(uniqueParameters, location.href.split("?")[0], url)
          console.log("url attributes: ", factors.url)
        }
      }
    });
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

function getKeywordsByPageUrl(url, pageUrl, callback) {
  const storageKey = 'url_keywords';

  chrome.storage.local.get([storageKey], (result) => {
    const allData = result[storageKey] || {};

    if (!allData[url]) {
      console.warn(`URL "${url}" not found.`);
      callback(null);
      return;
    }

    const pageData = allData[url][pageUrl];

    if (!pageData) {
      console.warn(`Page URL "${pageUrl}" not found under URL "${url}".`);
      callback(null);
      return;
    }

    callback(pageData.keywords || []);
  });
}



chrome.storage.local.get("urls", (result) => {
  const arr = result["urls"] || [];
  if (arr.includes(url)) {
    const observer = new MutationObserver((e) => {
        getKeywordsByPageUrl(url, location.href.split("?")[0], (keywords) => {
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
