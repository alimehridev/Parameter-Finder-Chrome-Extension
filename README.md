
# Parameter Finder - Chrome Extension

A relatively powerful tool for discovering potential parameters from a web page. It works as a Chrome extension that runs directly in your browser. While you're browsing a website, the extension actively scans the page and attempts to extract words or attributes that are likely to be used as parameters.

## 🚀 Features

- ✅ Scans the current page's DOM for key HTML attributes.
- 🔍 Detects and stores parameters like `id`, `class`, `name`, `href`, `src`, and script sources.
- 💾 Saves parameter data in `localStorage` for each URL.
- 📤 Sends data to the background script for further processing.

## 🧠 How It Works

1. `content.js` runs on every page load.
2. It collects relevant parameters from DOM elements.
3. Data is structured and saved in `localStorage` under the current URL.
5. `background.js` handles notifications or cross-tab communication.

## 🛠 Installation

1. Clone the repository:
   git clone https://github.com/alimehridev/Parameter-Finder-Chrome-Extension.git
2. Go to `chrome://extensions/` in your browser.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder.

## 🤔 Use Cases

* Bug bounty reconnaissance.
* Front-end testing and DOM mapping.
* Automated parameter discovery

## 📌 TODO

* [ ] Add export/import functionality
* [ ] Add other filters: url, parameter, ...
* [ ] Sorting based on entropy
* [ ] Crawling Javascript files to find more parameters
* [ ] Check the head tag too, it is just checking body content.
* [ ] Adding wildcard instead of absolute url

## 🧑‍💻 Author

* Ali Mehri – [@alimehridev](https://github.com/alimehridev)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
