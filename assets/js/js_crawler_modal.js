document.querySelector(".js_crawler_settings").addEventListener("click", () => {
    var modal = document.querySelector(".jsModal");
    modal.style.display = "block";

    chrome.storage.local.get("js_links", (result) => {
      const arr = result["js_links"] || [];
      if(!arr){
        return
      }
      let links = arr[matchAnyPattern(Object.keys(arr), getQueryParam("url"), true)][getQueryParam("url")]['links']
      links.forEach(link => {
        let js_div = document.createElement("div")
        js_div.innerHTML = `
        <div class="js_link">
            <span class="link">
                <span class="link-data">${shortenToXChars(link.split("?")[0], 60)}</span>
                <span class="link-open-btn" aria-link="${link}">open</span>
            </span>
        <span class="chkbox">
            <input type="checkbox" checked name="link_chbox" aria-link="${link}">
        </span>
        </div>
        `
        js_div.querySelector("input[name='link_chbox']").addEventListener("change", () => {
            func1()
        })
        js_div.querySelector(".link-data").addEventListener("click", () => {
            js_div.querySelector("input[name='link_chbox']").checked = !js_div.querySelector("input[name='link_chbox']").checked
            func1()
        })
        js_div.querySelector(".link-open-btn").addEventListener("click", (el) => {
            window.open(link, "_blank")
        })

        document.querySelector(".js_link_container").appendChild(js_div)
      });
        document.querySelector(".links_number").textContent = `${links.length} javascript links`
        func1()
    })
    


    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    var span = document.querySelector(".jsModal-close");
        span.addEventListener("click", () => {
        modal.style.display = "none";
    })
})


document.querySelector(".js_crawler_settings").click()


function func1(){
    if(Object.values(document.querySelectorAll('input[name="link_chbox"]')).filter(e => e.checked == 1).length == document.querySelector(".links_number").textContent.split(" ")[0]){
        document.querySelector(".select_all_links_btn").textContent = "Select None"
    }else {
        document.querySelector(".select_all_links_btn").textContent = "Select All"
    }
    document.querySelector(".selected_number").textContent = `${Object.values(document.querySelectorAll('input[name="link_chbox"]')).filter(e => e.checked == 1).length} links selected`
}


document.querySelectorAll(".js_link").forEach(el => {
    el.addEventListener("click", () => {
        el.querySelector("input[name='link_chbox']").click()
    })
    
})

document.querySelector(".select_all_links_btn").addEventListener("click", (el) => {
    let chboxes = document.querySelector(".jsModal").querySelectorAll("input[name='link_chbox']")
    if(el.target.textContent == "Select All"){
        chboxes.forEach(box => {
            box.checked = 1
        })
        document.querySelector(".selected_number").textContent = `${Object.values(document.querySelectorAll('input[name="link_chbox"]')).filter(e => e.checked == 1).length} links selected`
        el.target.textContent = "Select None"
    }else {
        chboxes.forEach(box => {
            box.checked = 0
        })
        document.querySelector(".selected_number").textContent = `${Object.values(document.querySelectorAll('input[name="link_chbox"]')).filter(e => e.checked == 1).length} links selected`
        el.target.textContent = "Select All"
    }
})

