const input = document.getElementById("urlInput");
const addUrlBtn = document.getElementById("addUrlBtn");
const urlList = document.getElementById("urlList");
const url_key_2 = `urls`;

function remove_url_from_list(li){
    const payload = li.firstChild.innerText
    chrome.storage.local.get(url_key_2, (result) => {
        if (!result[url_key_2] || result[url_key_2].length === 0) return;

        const updated = result[url_key_2].filter((item) => item !== payload);
        chrome.storage.local.set({ [url_key_2]: updated }, () => {
            li.remove();
        });
    });
}


addUrlBtn.addEventListener("click", () => {
    const value = input.value.trim();
    if (value === "") return;

    const li = document.createElement("li");
    const a = document.createElement("a")
    a.href = `?url=${value}`
    a.innerText = value
    const remove_button = document.createElement("button")
    remove_button.innerText = "❌"
    remove_button.classList.add("url-remove-btn")
    li.appendChild(a)
    li.appendChild(remove_button)
    li.querySelector(".url-remove-btn").addEventListener("click", () => {
        remove_url_from_list(li)
    });
    urlList.appendChild(li);
    input.value = "";

    chrome.storage.local.get(url_key_2, (result) => {
        const arr = result[url_key_2] || [];
        
        if (!arr.includes(value)) {
            arr.push(value);
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



chrome.storage.local.get(url_key_2, (result) => {
    if (!result[url_key_2] || result[url_key_2].length === 0) return;
    result[url_key_2].forEach((item) => { 
        const li = document.createElement("li");
        const a = document.createElement("a")
        a.href = `?url=${item}`
        a.innerText = item
        const remove_button = document.createElement("button")
        remove_button.innerText = "❌"
        remove_button.classList.add("url-remove-btn")
        li.appendChild(a)
        li.appendChild(remove_button)
        li.querySelector(".url-remove-btn").addEventListener("click", () => {
            remove_url_from_list(li)
        });
        urlList.appendChild(li);
    })
    
});