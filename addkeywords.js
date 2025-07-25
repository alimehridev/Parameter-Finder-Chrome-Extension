document.getElementsByClassName("backBtn")[0].addEventListener("click", () => {
    window.location = location.href.split("?")[0]
})

document.getElementById("addBtn").addEventListener("click", () => {
    let id_chkbox = +document.getElementById("id").checked
    let class_chkbox = +document.getElementById("class").checked
    let name_chkbox = +document.getElementById("name").checked
    let href_chkbox = +document.getElementById("href").checked
    let src_chkbox = +document.getElementById("src").checked
    let js_files_chkbox = +document.getElementById("js_files").checked
    let factors = {
        id: id_chkbox,
        class: class_chkbox,
        name: name_chkbox,
        href: href_chkbox,
        src: src_chkbox,
        js_files: js_files_chkbox
    }
    storeOriginFactors(origin, factors)
})


getOriginFactors(origin, (factors) => {
  if (factors) {
    console.log("Factors for origin:", factors);
    document.getElementById("id").checked = factors.id
    document.getElementById("class").checked = factors.class
    document.getElementById("name").checked = factors.name
    document.getElementById("href").checked = factors.href
    document.getElementById("src").checked = factors.src
    document.getElementById("js_files").checked = factors.js_files
  } 
});




