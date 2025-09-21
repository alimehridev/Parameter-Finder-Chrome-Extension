function chunkArrayInPairs(arr, chunk) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunk) {
    result.push(arr.slice(i, i + chunk));
  }
  return result;
}
function generateRandomString(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


function buildQueryString(keys, fixed = "XXXXX", url_encoding = true) {
  if (url_encoding){
    return keys
      .map(key => `${encodeURIComponent(key)}=${fixed}-${generateRandomString(6)}`)
      .join('&');
  }
  return keys
      .map(key => `${key}=${fixed}-${generateRandomString(6)}`)
      .join('&');
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}
function openModal() {
  document.getElementById("output").textContent = ""
  document.getElementById("chunk-number").value = 20
  chrome.storage.local.get("url_keywords", (data) => {
    const all = data.url_keywords || {};
    chrome.storage.local.get("urls", (result) => {
      const arr = result["urls"] || [];
      url = matchAnyPattern(arr, getQueryParam("url"), true)
      const results = all[url] || null;
      let fixed_value = document.getElementById("fixed-part").value
      Object.keys(results).map(key => {
        if(!key.includes("*")){
          let keywords = results[key]['keywords']
          if (key != `${url}`){
              try{
                // keywords = keywords.concat(results[`${getQueryParam("url")}/`]['keywords'])
                keywords = keywords.concat(results[`${url}`]['keywords'])
              }catch{}
          }
          keywords = [...new Set(keywords)]
          let chunk = 20
          keywords = chunkArrayInPairs(keywords, chunk)
          key = (new URL(key)).origin + (new URL(key)).pathname
          let chunk_url_encoding = document.getElementById("urlencode-chbox").checked
          keywords.forEach(chunk => {
              document.getElementById("output").textContent += `${key}?${buildQueryString(chunk, fixed_value, chunk_url_encoding)}\n` 
            })
          }
        })
        document.getElementsByClassName("links-number")[0].innerText = `${document.getElementById("output").textContent.split("\n").length - 1} links`
      })
});
  document.getElementById("myModal").style.display = "block";
}

function closeModal() {
  document.getElementById("myModal").style.display = "none";
}
document.getElementById("closeModalBtn").addEventListener("click", closeModal)
document.getElementById("urlQueryGenBtn").addEventListener("click", openModal)


document.getElementById("openBtn").addEventListener("click", () => {
  let confirmation = confirm("Do you want to open all links ?")
  if(confirmation){
    let links = document.getElementById("output").textContent.split("\n")
    links.forEach(url => {
      if(url != ""){
        window.open(url)
      }
    })
  }
})

document.getElementById("copyBtn").addEventListener("click", () => {
  const text = document.getElementById("output").textContent

  navigator.clipboard.writeText(text)
    .then(() => {
      console.log("Text copied to clipboard!");
    })
    .catch(err => {
      console.error("Failed to copy: ", err);
    });
})


document.getElementById("urlQueryReGenBtn").addEventListener("click", () => {
  document.getElementById("output").textContent = ""
  chrome.storage.local.get("url_keywords", (data) => {
      const all = data.url_keywords || {};
      
      chrome.storage.local.get("urls", (result) => {
        const arr = result["urls"] || [];
        url = matchAnyPattern(arr, getQueryParam("url"), true)
        const results = all[url] || null;
        let fixed_value = document.getElementById("fixed-part").value
        Object.keys(results).map(key => {
          if(!key.includes("*")){
            let keywords = results[key]['keywords']
            if (key != `${url}`){
              try{
                keywords = keywords.concat(results[`${url}`]['keywords'])
              }catch{}
            }
            let topxss_chbox = document.getElementById("topxss-chbox").checked
            if (topxss_chbox) {
              chrome.storage.local.get("top_parameters", (result) => { 
                let top_parameters = result['top_parameters']
                keywords = keywords.concat(top_parameters)
                keywords = [...new Set(keywords)]
                let chunk = parseInt(document.getElementById("chunk-number").value)
                keywords = chunkArrayInPairs(keywords, chunk)
                key = (new URL(key)).origin + (new URL(key)).pathname
                let chunk_url_encoding = document.getElementById("urlencode-chbox").checked
                
                keywords.forEach(chunk => {
                    document.getElementById("output").textContent += `${key}?${buildQueryString(chunk, fixed_value, chunk_url_encoding)}\n` 
                })
                document.getElementsByClassName("links-number")[0].innerText = `${document.getElementById("output").textContent.split("\n").length - 1} links`
              })
            }else{
              keywords = [...new Set(keywords)]
              let chunk = parseInt(document.getElementById("chunk-number").value)
              keywords = chunkArrayInPairs(keywords, chunk)
              key = (new URL(key)).origin + (new URL(key)).pathname
              let chunk_url_encoding = document.getElementById("urlencode-chbox").checked
              
              keywords.forEach(chunk => {
                  document.getElementById("output").textContent += `${key}?${buildQueryString(chunk, fixed_value, chunk_url_encoding)}\n` 
              })
              document.getElementsByClassName("links-number")[0].innerText = `${document.getElementById("output").textContent.split("\n").length - 1} links`
            }
          }
        })
      })
  });
})

document.getElementById("output").addEventListener("click", () => {
  document.getElementById("output").select()
})

document.getElementById("output").addEventListener("focus", () => {
  
  
})