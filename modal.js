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


function buildQueryString(keys, fixed = "XXXXX") {
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

    const result = all[getQueryParam("origin")] || null;
    let fixed_value = document.getElementById("fixed-part").value
    Object.keys(result).map(key => {
        let keywords = result[key]['keywords']
        if (key != `${getQueryParam("origin")}/`){
            try{
              keywords = keywords.concat(result[`${getQueryParam("origin")}/`]['keywords'])
            }catch{}
        }
        keywords = [...new Set(keywords)]
        let chunk = 20
        keywords = chunkArrayInPairs(keywords, chunk)
        keywords.forEach(chunk => {
            document.getElementById("output").textContent += `${key}?${buildQueryString(chunk, fixed_value)}\n` 
        })
      })
    document.getElementsByClassName("links-number")[0].innerText = `${document.getElementById("output").textContent.split("https://").length} links`
});
  document.getElementById("myModal").style.display = "block";
}

function closeModal() {
  document.getElementById("myModal").style.display = "none";
}
document.getElementById("closeModalBtn").addEventListener("click", closeModal)
document.getElementById("urlQueryGenBtn").addEventListener("click", openModal)


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

      const result = all[getQueryParam("origin")] || null;
      let fixed_value = document.getElementById("fixed-part").value
      Object.keys(result).map(key => {
          let keywords = result[key]['keywords']
          if (key != `${getQueryParam("origin")}/`){
            try{
              keywords = keywords.concat(result[`${getQueryParam("origin")}/`]['keywords'])
            }catch{}
          }
          keywords = [...new Set(keywords)]
          let chunk = parseInt(document.getElementById("chunk-number").value)
          keywords = chunkArrayInPairs(keywords, chunk)
          keywords.forEach(chunk => {
              document.getElementById("output").textContent += `${key}?${buildQueryString(chunk, fixed_value)}\n` 
          })
      })
      document.getElementsByClassName("links-number")[0].innerText = `${document.getElementById("output").textContent.split("https://").length} links`
  });
})

document.getElementById("output").addEventListener("click", () => {
  document.getElementById("output").select()
})

document.getElementById("output").addEventListener("focus", () => {
  
  
})