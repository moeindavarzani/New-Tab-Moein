// redirect.js - Handles new tab redirection when online vs rendering offline folders
(() => {
  const isExplicitOffline = location.search.includes('offline');

  if (!navigator.onLine || isExplicitOffline) {
    // Offline mode: Stay on newtab.html and signal offline mode to google_custom.js
    window.__TAB_MOEIN_OFFLINE__ = true;
    return;
  }

  // Online mode: Redirect to Google homepage
  if (chrome && chrome.tabs && chrome.tabs.getCurrent) {
    chrome.tabs.getCurrent((tab) => {
      if (tab && tab.id) {
        chrome.tabs.update(tab.id, { url: "https://www.google.com/" });
      } else {
        window.location.replace("https://www.google.com/");
      }
    });
  } else {
    window.location.replace("https://www.google.com/");
  }
})();