function notifyBar(message) {
  if(! $('.alert-box').length) {
    $(`<div class="alert-box success" >${message}</div>`).prependTo('body').delay(1300).fadeOut(500, function() {
        $('.alert-box').remove();
    });
  };
};
function getURLFactors(url, callback) {
  chrome.storage.local.get("url_factors", (data) => {
    const allFactors = data.url_factors || {};
    const urlData = allFactors[url] || null;

    callback(urlData);
  });
}

function storeURLFactors(url, factors) {
  chrome.storage.local.get("url_factors", (data) => {
    const allFactors = data.url_factors || {};

    allFactors[url] = {
      id: factors.id,
      class: factors.class,
      name: factors.name,
      href: factors.href,
      src: factors.src,
      js_inline: factors.js_inline,
      json: factors.json,
      url: factors.url
    };

    chrome.storage.local.set({ url_factors: allFactors }, () => {
      console.log(`Factors for ${url} saved.`);
    });
  });
  notifyBar("Done.")
}


function isProbablyLibrary(url) {
  const lowerUrl = url.toLowerCase();
  const knownLibraries = [
    "jquery", "lodash", "underscore", "zepto",
    "react", "react-dom", "vue", "vuex", "angular", "preact", "svelte",
    "bootstrap", "uikit", "bulma", "foundation", "tailwind",
    "chart", "chartjs", "highcharts", "d3", "three", "echarts", "amcharts", "vis",
    "moment", "date-fns", "dayjs", "numeral", "uuid", "qs", "axios", "fetch",
    "anime", "gsap", "scrollmagic", "lottie", "velocity", "wow", "aos",
    "tinymce", "ckeditor", "quill", "ace", "monaco",
    "validator", "formik", "yup", "parsley", "jquery.validate", "inputmask",
    "redux", "mobx", "localforage", "js-cookie", "store", "idb",
    "babel", "webpack", "rollup", "systemjs", "require", "esbuild",
    "gtag", "ga.js", "analytics", "mixpanel", "hotjar", "segment", "clarity", "amplitude", "smartlook",
    "modernizr", "core-js", "regenerator-runtime", "eventemitter", "pako", "socket.io", "firebase", "supabase",
    "next", "nuxt", "vite", "astro", "sapper", "solid", "inertia"
  ];
  const cdnDomains = [
    "cdn.", "cdnjs.", "cdnjs.cloudflare.com", "cdn.jsdelivr.net", "jsdelivr.net", "unpkg.com", "fastly.net",
    "googleapis.com", "fonts.googleapis.com", "ajax.googleapis.com",
    "azureedge.net", "msedge.net", "msecnd.net",
    "cloudfront.net", "s3.amazonaws.com",
    "bootstrapcdn.com", "code.jquery.com", "reactjs.org", "vuejs.org", "angularjs.org",
    "googletagmanager.com", "google-analytics.com", "clarity.ms", "cdn.segment.com", "cdn.amplitude.com", "cdn.hotjar.com", "smartlook.com",
    "optimizely.com", "hs-scripts.com", "hubspot.com", "mailchimp.com", "intercomcdn.com", "zohocdn.com",
    "doubleclick.net", "googlesyndication.com", "adnxs.com", "taboola.com", "outbrain.com"
  ];


  const hasKnownLibName = knownLibraries.some(lib => lowerUrl.includes(lib));
  const isFromCDN = cdnDomains.some(domain => lowerUrl.includes(domain));
  // const endsInMinJS = lowerUrl.includes(".min.js");

  return hasKnownLibName || isFromCDN // || endsInMinJS;
}


function extractParamNames(jsCode) {
  const wordList = ["phone","phone_number","token","session","user_id","api_key","amount"];
  const found = new Set();
  const regex = /\b([a-zA-Z_][a-zA-Z0-9_]{2,})\s*[:=]\s*/g;
  let match;
  while ((match = regex.exec(jsCode)) !== null) {
    const name = match[1];
    if (wordList.includes(name.toLowerCase())) {
      found.add(name);
    }
  }
  return Array.from(found);
}

function estimateEntropy(str) {
  const freq = {};
  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (let char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}