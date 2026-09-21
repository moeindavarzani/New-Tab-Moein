// Background service worker for Tab Moein Chrome Extension
// Handles Chrome Bookmarks API interactions on behalf of content scripts

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getChromeBookmarksTree') {
    if (!chrome.bookmarks) {
      sendResponse({ success: false, error: 'دسترسی به نشانک‌های کروم امکان‌پذیر نیست.' });
      return;
    }
    chrome.bookmarks.getTree((tree) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, tree: tree });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'getChromeBookmarkSubTree') {
    if (!chrome.bookmarks) {
      sendResponse({ success: false, error: 'دسترسی به نشانک‌های کروم امکان‌پذیر نیست.' });
      return;
    }
    chrome.bookmarks.getSubTree(request.id, (results) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, results: results });
      }
    });
    return true;
  }

  if (request.action === 'ping') {
    sendResponse({ success: true, status: 'ok' });
    return false;
  }
});

// Intercept failed navigations to Google (e.g. offline errors) and redirect to local offline page
if (typeof chrome !== 'undefined' && chrome.webNavigation && chrome.webNavigation.onErrorOccurred) {
  chrome.webNavigation.onErrorOccurred.addListener((details) => {
    // Only intercept main frame (frameId === 0) navigations to Google domains
    if (details.frameId === 0 && details.url && (details.url.includes('google.com') || details.url.includes('google.'))) {
      // Ignore normal navigation cancellations/aborts (e.g. when redirecting or clicking links)
      if (details.error === 'net::ERR_ABORTED') {
        return;
      }

      // Check for actual network disconnection or DNS failure errors
      const err = details.error || '';
      const isNetworkError = err.includes('DISCONNECTED') ||
                             err.includes('NAME_NOT_RESOLVED') ||
                             err.includes('TIMED_OUT') ||
                             err.includes('ADDRESS_UNREACHABLE') ||
                             err.includes('CONNECTION_RESET') ||
                             err.includes('CONNECTION_REFUSED');

      if (isNetworkError) {
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL('newtab.html?offline=1')
        });
      }
    }
  });
}

// Fallback tab update listener for chrome error data pages
if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && (changeInfo.url.startsWith('chrome-error://') || changeInfo.url.includes('chromewebdata'))) {
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('newtab.html?offline=1')
      });
    }
  });
}


