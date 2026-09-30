// redirect.js - Handles new tab redirection when online vs rendering offline folders
(() => {
  const isExplicitOffline = location.search.includes('offline');

  if (!navigator.onLine || isExplicitOffline) {
    // Offline mode: Stay on newtab.html and signal offline mode to google_custom.js
    window.__TAB_MOEIN_OFFLINE__ = true;
    return;
  }

  // Online mode: Immediately navigate to Google homepage synchronously to prevent UI flash
  let navigated = false;
  try {
    window.location.replace("https://www.google.com/");
    navigated = true;
  } catch (e) {
    try {
      window.location.href = "https://www.google.com/";
      navigated = true;
    } catch (err) {
      navigated = false;
    }
  }

  // Only fall back to chrome.tabs API if window navigation failed completely
  if (!navigated && typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.getCurrent) {
    chrome.tabs.getCurrent((tab) => {
      if (tab && tab.id) {
        chrome.tabs.update(tab.id, { url: "https://www.google.com/" });
      }
    });
  }
})();