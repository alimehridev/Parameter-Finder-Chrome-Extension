const input = document.getElementById("urlInput");
const addUrlBtn = document.getElementById("addUrlBtn");
const urlList = document.getElementById("urlList");
const origin_key_2 = `urls`;

function remove_origin_from_list(li){
    const payload = li.firstChild.innerText
    chrome.storage.local.get(origin_key_2, (result) => {
        if (!result[origin_key_2] || result[origin_key_2].length === 0) return;

        const updated = result[origin_key_2].filter((item) => item !== payload);
        chrome.storage.local.set({ [origin_key_2]: updated }, () => {
            li.remove();
        });
    });
}


addUrlBtn.addEventListener("click", () => {
    const value = input.value.trim();
    if (value === "") return;

    const li = document.createElement("li");
    const a = document.createElement("a")
    a.href = `?origin=${value}`
    a.innerText = value
    const remove_button = document.createElement("button")
    remove_button.innerText = "❌"
    remove_button.classList.add("origin-remove-btn")
    li.appendChild(a)
    li.appendChild(remove_button)
    li.querySelector(".origin-remove-btn").addEventListener("click", () => {
        remove_origin_from_list(li)
    });
    urlList.appendChild(li);
    input.value = "";

    chrome.storage.local.get(origin_key_2, (result) => {
        const arr = result[origin_key_2] || [];
        
        if (!arr.includes(value)) {
            arr.push(value);
        }

        chrome.storage.local.set({ [origin_key_2]: arr }, () => {
            console.log("Added:", value);
        });
    });

});

// Optional: add keyword on Enter
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addUrlBtn.click();
});



chrome.storage.local.get(origin_key_2, (result) => {
    if (!result[origin_key_2] || result[origin_key_2].length === 0) return;
    result[origin_key_2].forEach((item) => { 
        const li = document.createElement("li");
        const a = document.createElement("a")
        a.href = `?origin=${item}`
        a.innerText = item
        const remove_button = document.createElement("button")
        remove_button.innerText = "❌"
        remove_button.classList.add("origin-remove-btn")
        li.appendChild(a)
        li.appendChild(remove_button)
        li.querySelector(".origin-remove-btn").addEventListener("click", () => {
            remove_origin_from_list(li)
        });
        urlList.appendChild(li);
    })
    
});