document.querySelector("title").textContent = getQueryParam('url')
document.querySelector("span").textContent = `Redirecting to ${getQueryParam('url')}`

document.querySelector("#url_inp").addEventListener("focus", () => {
    document.location = getQueryParam('url')
})