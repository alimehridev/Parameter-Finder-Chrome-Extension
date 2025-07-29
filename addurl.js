const input = document.getElementById("urlInput");
const addUrlBtn = document.getElementById("addUrlBtn");
const urlList = document.getElementById("urlList");
const url_key_2 = `urls`;

function remove_url_from_list(url){
    const confirmation = confirm("Are you sure ?")
    if(confirmation){
        chrome.storage.local.get(url_key_2, (result) => {
            if (!result[url_key_2] || result[url_key_2].length === 0) return;
            const updated = result[url_key_2].filter((item) => item !== url);
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
            chrome.storage.local.set({ [url_key_2]: updated }, () => {
                location.reload()
            });
        });
    }
}

addUrlBtn.addEventListener("click", () => {
    const dataDiv = document.getElementById("data");
    let value = input.value.trim();
    if(!value.endsWith("/")) {value = value + "/"}
    if (value === "") return;

    

    chrome.storage.local.get(url_key_2, (result) => {
        const arr = result[url_key_2] || [];
        
        if (!arr.includes(value)) {
            arr.push(value);
            const pageDiv = document.createElement("div");
            pageDiv.className = "page";
            const kw = document.createElement("div");
            kw.className = "keyword";
            const a = document.createElement("a")
            a.href = `?url=${value}`
            a.innerText = value
            a.style.color = "initial"
            kw.appendChild(a);
            pageDiv.appendChild(kw)

            let remove_url_btn = document.createElement("span")
            remove_url_btn.classList.add("removeLogBtn")
            remove_url_btn.addEventListener("click", () => {
                remove_url_from_list(value)
            })
            remove_url_btn.innerText = "x"
            pageDiv.appendChild(remove_url_btn)

            dataDiv.appendChild(pageDiv)
            input.value = "";
        }else {
            input.value = "";
            alert(`${value} exists`)
            return
        }

        chrome.storage.local.set({ [url_key_2]: arr }, () => {
            console.log("Added:", value);
        });
    });

});

// Optional: add keyword on Enter
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addUrlBtn.click();
});



const dataDiv = document.getElementById("data");
dataDiv.innerHTML = "";
chrome.storage.local.get(url_key_2, (result) => {
    if (!result[url_key_2] || result[url_key_2].length === 0) return;
    result[url_key_2].forEach((item) => { 
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