let hostname_addr = decodeURIComponent(location.href.split("origin=")[1]).split("//")[1]
if(hostname_addr == undefined){
    document.getElementsByClassName("origin_dashboard")[0].remove()
    document.getElementsByClassName("main_dashboard")[0].style.display = "block"
    if(location.href.split("origin_add=")[1]){
        document.getElementById("urlInput").value = decodeURIComponent(location.href.split("origin_add=")[1])
    }
    document.getElementById("urlInput").focus()
}else {
    document.getElementsByClassName("origin_dashboard")[0].style.display = "block"
    document.getElementsByClassName("main_dashboard")[0].remove()
}