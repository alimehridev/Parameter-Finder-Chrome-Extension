const input = document.getElementById("urlInput");
const addUrlBtn = document.getElementById("addUrlBtn");
const urlList = document.getElementById("urlList");
const url_key_2 = `urls`;

function remove_url_from_list(url){
    const confirmation = confirm("Are you sure ?")
    if(confirmation){
        chrome.storage.local.get("urls", (result) => {
            if (!result["urls"] || result["urls"].length === 0) return;
            const updated = result["urls"].filter((item) => item !== url);
            chrome.storage.local.get("url_factors", (result) => { 
                if(result['url_factors'][url]){
                    console.log(result['url_factors'][url]) 
                    delete result["url_factors"][url]
                    chrome.storage.local.set({ ["url_factors"]: result["url_factors"] }, () => {
                    });
                }

            })
            chrome.storage.local.get("url_keywords", (result) => { 
                if(result['url_keywords'][url]){
                    console.log(result['url_keywords'][url]) 
                    delete result["url_keywords"][url]
                    chrome.storage.local.set({ ["url_keywords"]: result["url_keywords"] }, () => {
                    });
                }

            })
            chrome.storage.local.set({ ["urls"]: updated }, () => {
                location.reload()
            });
        });
    }
}

addUrlBtn.addEventListener("click", () => {
    let value = input.value.trim();
    if (value === "") return;

    chrome.storage.local.get("urls", (result) => {
        const arr = result["urls"] || [];
        
        if (!arr.includes(value) && !arr.includes((value.split("")[value.split("").length - 1] === "/" ? value.slice(0, -1) : value) + "/")) {
            arr.push(value);
            input.value = "";
            chrome.storage.local.set({ ["urls"]: arr }, () => {
                let factors = {
                    id: 1,
                    class: 1,
                    name: 1,
                    href: 1,
                    src: 1,
                    js_inline: 1,
                    json: 1,
                    url: 1
                }
                storeURLFactors(value, factors)

                location.href = `dashboard.html?url=${value}`
            });
        }else {
            alert(`${value} exists`)
            return
        }

        
    });

});

// Optional: add keyword on Enter
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addUrlBtn.click();
});



const dataDiv = document.getElementById("data");
dataDiv.innerHTML = "";
chrome.storage.local.get("urls", (result) => {
    if (!result["urls"] || result["urls"].length === 0) return;
    result["urls"].reverse()
    result["urls"].forEach((item) => { 
        const pageDiv = document.createElement("div");
        pageDiv.className = "page";
        const kw = document.createElement("div");
        kw.className = "keyword";
        const a = document.createElement("a")
        a.href = `?url=${item}`
        a.innerText = item
        a.style.color = "initial"
        kw.appendChild(a);
        pageDiv.appendChild(kw)

        let remove_url_btn = document.createElement("span")
        remove_url_btn.classList.add("removeLogBtn")
        remove_url_btn.addEventListener("click", () => {
            remove_url_from_list(item)
        })
        remove_url_btn.innerText = "x"
        pageDiv.appendChild(remove_url_btn)

        dataDiv.appendChild(pageDiv)
    })
    
});