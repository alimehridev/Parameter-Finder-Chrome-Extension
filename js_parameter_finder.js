function paramChecker(parameters){
    parameters = parameters.filter(str => !/\s/.test(str))                                     // نبودن فاصله توی رشته
    parameters = parameters.filter(str => !/\&/.test(str))                                     // نبودن & توی رشته
    parameters = parameters.filter(str => !/\#/.test(str))                                     // نبودن # توی رشته
    parameters = parameters.filter(str => !/\//.test(str))                                     // نبودن / توی رشته
    parameters = parameters.filter(str => !/\\/.test(str))                                     // نبودن \ توی رشته
    parameters = parameters.filter(str => !/\?/.test(str))                                     // نبودن ? توی رشته
    parameters = parameters.filter(str => /[a-zA-Z0-9_]/.test(str))                             // بررسی نبودن حرف و عدد توی رشته
    parameters = parameters.filter(str => !/[^a-zA-Z0-9_]{2,}/.test(str))                      // بررسی نبودن دوتا کاراکتر غیر عددی، غیر حرفی و _ کنار هم
    parameters = parameters.filter(str => /^.{0,30}$/.test(str))                               // طول بیشتر از 30 کاراکتر کنسله
    parameters = parameters.filter(str => !/^:/.test(str))                                     // شروع شدن با : کنسله
    parameters = parameters.filter(str => !/^<.*>/.test(str))                                  // تگ HTML بودن کنسله
    parameters = parameters.filter(str => !/%$/.test(str))                                    // تموم نشدن با %
    parameters = parameters.filter(str => !/^-/.test(str))                                    // تموم نشدن با %
    parameters = parameters.filter(str => /^[a-zA-Z0-9_]|[a-zA-Z0-9_]$/.test(str))            // اگه با غیر عددی، حرفی یا _ شروع و پایان یافته کنسله

    return [...new Set(parameters)]
}

function extractStrings(jsContent) {
  // regex برای پیدا کردن رشته ها داخل ' یا " یا `
  const regex = /(['"`])(?:(?=(\\?))\2.)*?\1/g;
  const matches = jsContent.match(regex) || [];
  
  // حذف کوتیشن های اطراف و فیلتر کردن رشته هایی که فاصله دارند
  return paramChecker(matches.map(str => str.slice(1, -1)))
}
function extractVariableNames(jsContent) {
  // regex برای پیدا کردن نام متغیرها بعد از const, let یا var
  const regex = /\b(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(jsContent)) !== null) {
    matches.push(match[1]);
  }

  return paramChecker(matches);
}

function extractParams(text) {
  // پیدا کردن عبارات بین ? و & یا بین & و & که شامل =
  const regex = /[?&]([^&=]+=[^&]+)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]); // فقط خود عبارت بدون ? یا &
  }

  return paramChecker(matches.map(i => i.split("=")[0]))

}

function extractBracesContent(text) {
  // گرفتن همه چیز بین { و }
  const regex = /\{([^{}]*)\}/g;
  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const content = match[1].trim();
    if (/^[a-zA-Z0-9_]+$/.test(content)) {
      matches.push(content);
    }
  }

  return paramChecker(matches);
}

function extractObjectKeys(jsContent) {
    const regex = /\{([^{}]*)\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(jsContent)) !== null) {
        const content = match[1].trim();
        const regex = /([a-zA-Z0-9_]+)\s*:/g;
        while ((match = regex.exec(content)) !== null) {
            matches.push(match[1]);
        }
    }
    
    return paramChecker(matches);
}


function extractParenthesesContent(text) {
  const regex = /\(([^()]*)\)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    let parameters = match[1].trim().split(",")
    parameters.forEach(p => {
        p = p.trim()
        if(/^[a-zA-Z0-9_]+$/.test(p)){
            matches.push(p)
        }
    })
  }

  return paramChecker(matches);
}
function extract_from_js_content(content){
    const beautified = js_beautify(content, { indent_size: 2 });
    let params = []
    params = params.concat(extractStrings(beautified))
    params = params.concat(extractVariableNames(beautified))
    params = params.concat(extractParams(beautified))
    params = params.concat(extractBracesContent(beautified))
    params = params.concat(extractObjectKeys(beautified))
    params = params.concat(extractParenthesesContent(beautified))
    params = [...new Set(params)]
    return params
}

async function extract_from_js_link(link) {
    const response = await fetch(link, {
        method: 'GET',
        headers: { 'Content-Type': 'text/plain' }
    });
    const content = await response.text();
    return extract_from_js_content(content);
}


// extract_from_js_link("https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js").then(
//     result => console.log(result)
// )