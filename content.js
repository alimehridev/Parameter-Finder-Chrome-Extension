const url = location.origin + location.pathname;
let uniqueParameters = []


function saveKeywordsToURLFactors(keywords, href, url) {
  if (!Array.isArray(keywords) || !href || !url) {
    console.error("Invalid input");
    return;
  }
  chrome.storage.local.get("urls", (result) => {
    const arr = result["urls"] || [];
    url = matchAnyPattern(arr, url, true)
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
  })
}

function saveJavascriptFilesURL(links, href, url){
  if (!Array.isArray(links) || !href || !url) {
    console.error("Invalid input");
    return;
  }
  chrome.storage.local.get("urls", (result) => {
    const arr = result["urls"] || [];
    url = matchAnyPattern(arr, url, true)
    const storageKey = 'js_links';
  
    chrome.storage.local.get([storageKey], (result) => {
      const allData = result[storageKey] || {};
  
      if (!allData[url]) {
        allData[url] = {};
      }
  
      const existingEntry = allData[url][href];
  
      if (existingEntry) {
        const newLink = links.filter(link => !existingEntry.links.includes(link));
        if (newLink.length > 0) {
          existingEntry.links.push(...newLink);
          existingEntry.timestamp = Date.now();
        }
      } else {
        allData[url][href] = {
          links: [...links],
          timestamp: Date.now()
        };
      }
  
      chrome.storage.local.set({ [storageKey]: allData }, () => {
      });
    });
  })
}

function getURLFactors(url, callback) {
  chrome.storage.local.get("url_factors", (data) => {
    const allFactors = data.url_factors || {};
    chrome.storage.local.get("urls", (result) => {
      const arr = result["urls"] || [];
      url = matchAnyPattern(arr, url, true)
      const urlData = allFactors[url] || null;
  
      callback(urlData);
    })
  });
}

function checkForParameters() {
    const bodyText = document.documentElement.outerHTML.toLowerCase();
    getURLFactors(url, (factors) => {
      if (factors) {
        try{
          uniqueParameters = uniqueParameters.concat(
            [...
              new Set(
                bodyText.match(/(?:https?:\/\/[^\s"'<>]+)|(?:\/[^\s"'<>]+)/g)
                  .filter(i => i.includes("?"))
                  .map(i => i.split("?")[1])
                  .map(i => i.split("&amp;"))
                  .flat()
                  .map(i => i.split("=")[0])
                )
            ]
          )
          saveKeywordsToURLFactors(uniqueParameters, location.href.split("?")[0], url)
        }catch{}

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
            script_content = script.textContent
            let founded = []
            try{
              founded = founded.concat(script_content.match(/\b(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g).map(item => item.split(" ")[1]))
            }catch{}
            try{
              founded = founded.concat(script_content.match(/["|']([\w\-]+)["|']\s*?:/g).map(i => i.split('"')[1]))
            }catch{}
            try{
              founded = founded.concat(script_content.match(/function\s*\w*\s*\(([^)]*)\)|(\w*\s*=\s*)?\(?\s*([^)=]*)\s*\)?\s*=>/g).map(item => item.match(/\(.*\)/g)[0].replace("(", "").replace(")", "").split(",").map(item => item.trim())).filter(item => item != "").flat())
            }catch{}
            uniqueParameters = uniqueParameters.concat([...new Set(founded)])
            uniqueParameters = [...new Set(uniqueParameters)]
            saveKeywordsToURLFactors(uniqueParameters, location.href.split("?")[0], url)
          });
        }
        
        if (factors.js_crawler == 1){
          let srcs = Array.from(document.querySelectorAll('script[src]')).map(el => {
            let src = el.getAttribute("src")
            if(src.startsWith("//")){
              return "https://" + src.replace("//", "")
              // return ("https://" + src.replace("//", "")).split("?")[0]
            }else if(src.startsWith("https:")) {
              return src
              // return src.split("?")[0]
            }else if(src.startsWith("/")){
              return location.origin + src
              // return (location.origin + src).split("?")[0]
            }else if(src.startsWith("chrome-extension://")){
              return undefined
            }else {
              return location.href.endsWith("/") ? location.href + src : location.href + "/" + src
              // return location.href.endsWith("/") ? (location.href + src).split("?")[0] : (location.href + "/" + src).split("?")[0]
            }
          }).filter(src => src != undefined)
          saveJavascriptFilesURL(srcs, location.href.split("?")[0], url)
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
    chrome.storage.local.get("urls", (result) => {
      const arr = result["urls"] || [];
      url = matchAnyPattern(arr, url, true)
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
    })
  });
}



chrome.storage.local.get("urls", (result) => {
  const arr = result["urls"] || [];
  if (matchAnyPattern(arr, url)) {
    const observer = new MutationObserver((e) => {
        getKeywordsByPageUrl(url, location.href.split("?")[0], (keywords) => {
          if (keywords) {
            chrome.runtime.sendMessage({ type: "setBadge", text: keywords.length.toString() });
          } else {
            chrome.runtime.sendMessage({ type: "setBadge", text: "0" });
          }
        });
        checkForParameters();
        // chrome.runtime.sendMessage({type: "js_link_finder", text: document.innerHTML})
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
