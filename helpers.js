function notifyBar(message) {
  if(! $('.alert-box').length) {
    $(`<div class="alert-box success" >${message}</div>`).prependTo('body').delay(1300).fadeOut(500, function() {
        $('.alert-box').remove();
    });
  };
};
function getOriginFactors(origin, callback) {
  chrome.storage.local.get("origin_factors", (data) => {
    const allFactors = data.origin_factors || {};
    const originData = allFactors[origin] || null;

    callback(originData);
  });
}

function storeOriginFactors(origin, factors) {
  chrome.storage.local.get("origin_factors", (data) => {
    const allFactors = data.origin_factors || {};

    allFactors[origin] = {
      id: factors.id,
      class: factors.class,
      name: factors.name,
      href: factors.href,
      src: factors.src,
      js: factors.js,
      json: factors.json,
      url: factors.url
    };

    chrome.storage.local.set({ origin_factors: allFactors }, () => {
      console.log(`Factors for ${origin} saved.`);
    });
  });
  notifyBar("Done.")
}