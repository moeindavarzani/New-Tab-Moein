(() => {
  const isGoogleHost = location.hostname.includes('google.');
  const isExtensionPage = location.protocol === 'chrome-extension:' || window.__TAB_MOEIN_TEST__;
  if (!isGoogleHost && !isExtensionPage) return;

  const isHomePage = () => {
    if (window.__TAB_MOEIN_TEST__) return true;
    if (location.protocol === 'chrome-extension:') return true;
    return location.pathname === '/' || location.pathname === '/webhp' || location.pathname === '';
  };

  const MAX_BOXES = 12;
  const STORAGE_KEY = 'moein_boxes';

  // SVG Icons
  const folderIconSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
  const plusIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
  const trashIconSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
  const closeIconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  const globeIconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`;
  const chromeFolderIconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#f29900"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
  const chevronDownSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
  const searchIconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
  const dragGripIconSvg = `<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><circle cx="3" cy="3" r="1.5"/><circle cx="7" cy="3" r="1.5"/><circle cx="3" cy="7" r="1.5"/><circle cx="7" cy="7" r="1.5"/><circle cx="3" cy="11" r="1.5"/><circle cx="7" cy="11" r="1.5"/></svg>`;
  const googleLogoSvg = `<svg class="moein-bar-logo-svg" viewBox="0 0 272 92" width="120" height="40" aria-label="Google"><path fill="#EA4335" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/><path fill="#FBBC05" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/><path fill="#4285F4" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 8.16 11.18 8.16 7.31 0 11.84-4.53 11.84-13.07v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.87h9.44zm-8.74 21.09c0-7.81-5.21-13.44-11.84-13.44-6.72 0-12.35 5.63-12.35 13.44 0 7.72 5.63 13.35 12.35 13.35 6.63 0 11.84-5.63 11.84-13.35z"/><path fill="#34A853" d="M225 3v65h-9.5V3h9.5z"/><path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-13.78-8.23l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/><path fill="#4285F4" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.68s15.96-34.67 34.94-34.67c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49-.03z"/></svg>`;
  const wifiOffIconSvg = `<svg class="moein-offline-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`;

  // Default Categories Data
  const defaultBoxData = [
    {
      title: 'هوش مصنوعی',
      sites: [
        { name: 'ChatGPT', url: 'https://chatgpt.com/', domain: 'openai.com' },
        { name: 'Gemini', url: 'https://gemini.google.com/', domain: 'gemini.google.com' },
        { name: 'Claude', url: 'https://claude.ai/', domain: 'claude.ai' },
        { name: 'Grok', url: 'https://x.com/i/grok', domain: 'x.com' },
        { name: 'Perplexity', url: 'https://www.perplexity.ai/', domain: 'perplexity.ai' },
        { name: 'AI Studio', url: 'https://aistudio.google.com/', domain: 'aistudio.google.com' }
      ]
    },
    {
      title: 'گوگل',
      sites: [
        { name: 'جیمیل', url: 'https://mail.google.com/', domain: 'mail.google.com' },
        { name: 'درایو', url: 'https://drive.google.com/', domain: 'drive.google.com' },
        { name: 'ترجمه', url: 'https://translate.google.com/', domain: 'translate.google.com' },
        { name: 'نقشه', url: 'https://maps.google.com/', domain: 'maps.google.com' },
        { name: 'تقویم', url: 'https://calendar.google.com/', domain: 'calendar.google.com' },
        { name: 'یوتیوب', url: 'https://www.youtube.com/', domain: 'youtube.com' }
      ]
    },
    {
      title: 'شبکه‌های اجتماعی',
      sites: [
        { name: 'توییتر / X', url: 'https://x.com/', domain: 'x.com' },
        { name: 'اینستاگرام', url: 'https://www.instagram.com/', domain: 'instagram.com' },
        { name: 'لینکدین', url: 'https://www.linkedin.com/', domain: 'linkedin.com' },
        { name: 'تلگرام', url: 'https://web.telegram.org/', domain: 'telegram.org' },
        { name: 'ردیت', url: 'https://www.reddit.com/', domain: 'reddit.com' },
        { name: 'واتساپ', url: 'https://web.whatsapp.com/', domain: 'whatsapp.com' }
      ]
    },
    {
      title: 'برنامه‌نویسی',
      sites: [
        { name: 'GitHub', url: 'https://github.com/', domain: 'github.com' },
        { name: 'Stack Overflow', url: 'https://stackoverflow.com/', domain: 'stackoverflow.com' },
        { name: 'MDN Web', url: 'https://developer.mozilla.org/', domain: 'developer.mozilla.org' },
        { name: 'W3Schools', url: 'https://www.w3schools.com/', domain: 'w3schools.com' },
        { name: 'npmjs', url: 'https://www.npmjs.com/', domain: 'npmjs.com' },
        { name: 'LeetCode', url: 'https://leetcode.com/', domain: 'leetcode.com' }
      ]
    },
    {
      title: 'دانشگاه و پژوهش',
      sites: [
        { name: 'Google Scholar', url: 'https://scholar.google.com/', domain: 'scholar.google.com' },
        { name: 'ResearchGate', url: 'https://www.researchgate.net/', domain: 'researchgate.net' },
        { name: 'arXiv', url: 'https://arxiv.org/', domain: 'arxiv.org' },
        { name: 'Sci-Hub', url: 'https://sci-hub.se/', domain: 'sci-hub.se' },
        { name: 'سیویلیکا', url: 'https://civilica.com/', domain: 'civilica.com' },
        { name: 'مگیران', url: 'https://www.magiran.com/', domain: 'magiran.com' }
      ]
    },
    {
      title: 'ابزار و مدیریت',
      sites: [
        { name: 'Notion', url: 'https://www.notion.so/', domain: 'notion.so' },
        { name: 'Trello', url: 'https://trello.com/', domain: 'trello.com' },
        { name: 'Google Keep', url: 'https://keep.google.com/', domain: 'keep.google.com' },
        { name: 'Clockify', url: 'https://clockify.me/', domain: 'clockify.me' },
        { name: 'Asana', url: 'https://asana.com/', domain: 'asana.com' },
        { name: 'Todoist', url: 'https://todoist.com/', domain: 'todoist.com' }
      ]
    },
    {
      title: 'رسانه و سرگرمی',
      sites: [
        { name: 'آپارات', url: 'https://www.aparat.com/', domain: 'aparat.com' },
        { name: 'فیلیمو', url: 'https://www.filimo.com/', domain: 'filimo.com' },
        { name: 'اسپاتیفای', url: 'https://open.spotify.com/', domain: 'spotify.com' },
        { name: 'نماوا', url: 'https://www.namava.ir/', domain: 'namava.ir' },
        { name: 'کافه بازار', url: 'https://cafebazaar.ir/', domain: 'cafebazaar.ir' },
        { name: 'Twitch', url: 'https://www.twitch.tv/', domain: 'twitch.tv' }
      ]
    },
    {
      title: 'اخبار و فناوری',
      sites: [
        { name: 'زومیت', url: 'https://www.zoomit.ir/', domain: 'zoomit.ir' },
        { name: 'دیجیاتو', url: 'https://digiato.com/', domain: 'digiato.com' },
        { name: 'The Verge', url: 'https://theverge.com/', domain: 'theverge.com' },
        { name: 'TechCrunch', url: 'https://techcrunch.com/', domain: 'techcrunch.com' },
        { name: 'ایسنا', url: 'https://www.isna.ir/', domain: 'isna.ir' },
        { name: 'ورزش سه', url: 'https://www.varzesh3.com/', domain: 'varzesh3.com' }
      ]
    },
    {
      title: 'خرید و مالی',
      sites: [
        { name: 'دیجی‌کالا', url: 'https://www.digikala.com/', domain: 'digikala.com' },
        { name: 'دیوار', url: 'https://divar.ir/', domain: 'divar.ir' },
        { name: 'ترب', url: 'https://torob.com/', domain: 'torob.com' },
        { name: 'نوبیتکس', url: 'https://nobitex.ir/', domain: 'nobitex.ir' },
        { name: 'TradingView', url: 'https://www.tradingview.com/', domain: 'tradingview.com' },
        { name: 'CoinMarket', url: 'https://coinmarketcap.com/', domain: 'coinmarketcap.com' }
      ]
    },
    {
      title: 'ابزارهای کاربردی',
      sites: [
        { name: 'ویکی‌پدیا', url: 'https://fa.wikipedia.org/', domain: 'wikipedia.org' },
        { name: 'Speedtest', url: 'https://www.speedtest.net/', domain: 'speedtest.net' },
        { name: 'نشان و بلد', url: 'https://neshan.org/', domain: 'neshan.org' },
        { name: 'آب‌وهوا', url: 'https://weather.com/', domain: 'weather.com' },
        { name: 'Time.ir', url: 'https://time.ir/', domain: 'time.ir' },
        { name: 'Remove.bg', url: 'https://www.remove.bg/', domain: 'remove.bg' }
      ]
    },
    {
      title: 'طراحی و گرافیک',
      sites: [
        { name: 'Figma', url: 'https://www.figma.com/', domain: 'figma.com' },
        { name: 'Canva', url: 'https://www.canva.com/', domain: 'canva.com' },
        { name: 'Pinterest', url: 'https://www.pinterest.com/', domain: 'pinterest.com' },
        { name: 'Freepik', url: 'https://www.freepik.com/', domain: 'freepik.com' },
        { name: 'Unsplash', url: 'https://unsplash.com/', domain: 'unsplash.com' },
        { name: 'Dribbble', url: 'https://dribbble.com/', domain: 'dribbble.com' }
      ]
    },
    {
      title: 'پادکست و آموزش',
      sites: [
        { name: 'Castbox', url: 'https://castbox.fm/', domain: 'castbox.fm' },
        { name: 'فرادرس', url: 'https://faradars.org/', domain: 'faradars.org' },
        { name: 'کوئرا', url: 'https://quera.org/', domain: 'quera.org' },
        { name: 'Coursera', url: 'https://www.coursera.org/', domain: 'coursera.org' },
        { name: 'TED', url: 'https://www.ted.com/', domain: 'ted.com' },
        { name: 'Spotify', url: 'https://open.spotify.com/', domain: 'spotify.com' }
      ]
    }
  ];

  // State
  let currentBoxes = [];
  let isStorageInitialized = false;
  let draggedBoxId = null;
  let draggedSiteInfo = null; // { sourceBoxId, siteIndex }
  let boxDragInitiatorCard = null;
  let lastDragEndTime = 0;

  // Reordering Pure Helper Functions
  const reorderBoxes = (boxesList, sourceIndex, targetIndex) => {
    if (!Array.isArray(boxesList)) return boxesList;
    if (sourceIndex < 0 || sourceIndex >= boxesList.length) return boxesList;
    if (targetIndex < 0 || targetIndex >= boxesList.length) return boxesList;
    if (sourceIndex === targetIndex) return boxesList;
    const [movedBox] = boxesList.splice(sourceIndex, 1);
    boxesList.splice(targetIndex, 0, movedBox);
    return boxesList;
  };

  const reorderSitesInBox = (boxObj, sourceIndex, targetIndex) => {
    if (!boxObj || !Array.isArray(boxObj.sites)) return boxObj;
    if (sourceIndex < 0 || sourceIndex >= boxObj.sites.length) return boxObj;
    if (targetIndex < 0 || targetIndex >= boxObj.sites.length) return boxObj;
    if (sourceIndex === targetIndex) return boxObj;
    const [movedSite] = boxObj.sites.splice(sourceIndex, 1);
    boxObj.sites.splice(targetIndex, 0, movedSite);
    return boxObj;
  };

  const transferSiteBetweenBoxes = (srcBox, tgtBox, sourceIndex, targetIndex) => {
    if (!srcBox || !tgtBox || !Array.isArray(srcBox.sites) || !Array.isArray(tgtBox.sites)) return null;
    if (sourceIndex < 0 || sourceIndex >= srcBox.sites.length) return null;
    const [movedSite] = srcBox.sites.splice(sourceIndex, 1);
    if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= tgtBox.sites.length) {
      tgtBox.sites.splice(targetIndex, 0, movedSite);
    } else {
      tgtBox.sites.push(movedSite);
    }
    return movedSite;
  };

  // Helper Utilities
  const extractDomain = (url) => {
    try {
      let formattedUrl = (url || '').trim();
      if (!formattedUrl) return '';
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      const parsed = new URL(formattedUrl);
      return parsed.hostname.replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  };

  const sanitizeUrl = (rawUrl) => {
    let url = (rawUrl || '').trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.href;
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  const showToast = (message) => {
    const existing = document.querySelector('.moein-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'moein-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };

  // Storage Management
  let isInternalSave = false;

  const loadBoxesFromStorage = (callback) => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([STORAGE_KEY], (res) => {
        if (res && res[STORAGE_KEY] !== undefined && Array.isArray(res[STORAGE_KEY])) {
          currentBoxes = res[STORAGE_KEY];
        } else {
          // Initialize with default 10 boxes only on initial install
          currentBoxes = defaultBoxData.map((box, index) => ({
            id: 'box_' + Date.now() + '_' + index,
            title: box.title,
            sites: box.sites.map(s => ({ ...s, domain: s.domain || extractDomain(s.url) }))
          }));
          chrome.storage.local.set({ [STORAGE_KEY]: currentBoxes });
        }
        isStorageInitialized = true;
        if (callback) callback();
      });
    } else {
      currentBoxes = defaultBoxData.map((box, index) => ({
        id: 'box_' + Date.now() + '_' + index,
        title: box.title,
        sites: box.sites.map(s => ({ ...s, domain: s.domain || extractDomain(s.url) }))
      }));
      isStorageInitialized = true;
      if (callback) callback();
    }
  };

  const saveBoxes = (callback) => {
    if (chrome && chrome.storage && chrome.storage.local) {
      isInternalSave = true;
      chrome.storage.local.set({ [STORAGE_KEY]: currentBoxes }, () => {
        setTimeout(() => { isInternalSave = false; }, 120);
        if (callback) callback();
      });
    } else if (callback) {
      callback();
    }
  };

  // Listen to cross-tab updates
  if (chrome && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[STORAGE_KEY] && !isInternalSave) {
        currentBoxes = changes[STORAGE_KEY].newValue || [];
        renderShortcutsGrid();
      }
    });
  }

  // Chrome Bookmarks Service Worker Bridge
  const fetchChromeBookmarksTree = () => {
    return new Promise((resolve, reject) => {
      if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        reject(new Error('افزونه در دسترس نیست.'));
        return;
      }
      chrome.runtime.sendMessage({ action: 'getChromeBookmarksTree' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.success) {
          resolve(response.tree);
        } else {
          reject(new Error(response?.error || 'خطا در دریافت نشانک‌ها'));
        }
      });
    });
  };

  // Flatten Chrome Bookmark Tree into Folders list
  const flattenChromeBookmarkFolders = (tree) => {
    const folders = [];

    const traverse = (node, parentPath = '') => {
      if (!node) return;

      if (node.children) {
        let folderTitle = (node.title || '').trim();
        if (!folderTitle) {
          if (node.id === '1') folderTitle = 'نوار نشانک‌ها (Bookmarks Bar)';
          else if (node.id === '2') folderTitle = 'سایر نشانک‌ها (Other Bookmarks)';
          else if (node.id === '3') folderTitle = 'نشانک‌های موبایل (Mobile Bookmarks)';
          else if (node.id !== '0') folderTitle = 'پوشه بدون عنوان';
        } else if (node.id === '1' && !folderTitle.includes('نوار نشانک‌ها')) {
          folderTitle = `نوار نشانک‌ها (${folderTitle})`;
        } else if (node.id === '2' && !folderTitle.includes('سایر نشانک‌ها')) {
          folderTitle = `سایر نشانک‌ها (${folderTitle})`;
        } else if (node.id === '3' && !folderTitle.includes('نشانک‌های موبایل')) {
          folderTitle = `نشانک‌های موبایل (${folderTitle})`;
        }

        const currentPath = (node.id === '0') ? '' : (parentPath ? `${parentPath} > ${folderTitle}` : folderTitle);

        const directBookmarks = [];
        const allBookmarks = [];
        const subfolders = [];

        const collect = (n, isDirect = false) => {
          if (n.url) {
            const item = {
              id: n.id,
              name: (n.title || '').trim() || extractDomain(n.url) || 'نشانک',
              url: n.url,
              domain: extractDomain(n.url)
            };
            if (isDirect) directBookmarks.push(item);
            allBookmarks.push(item);
          }
          if (n.children) {
            n.children.forEach(child => collect(child, false));
          }
        };

        node.children.forEach(child => {
          if (child.url) {
            collect(child, true);
          } else if (child.children) {
            collect(child, false);
            subfolders.push(child);
          }
        });

        // Pre-order push: parent folder appears BEFORE child folders
        if (node.id !== '0') {
          folders.push({
            id: node.id,
            title: folderTitle,
            path: currentPath,
            directBookmarks,
            allBookmarks,
            count: allBookmarks.length,
            directCount: directBookmarks.length
          });
        }

        // Recursively traverse child subfolders
        subfolders.forEach(sub => {
          traverse(sub, currentPath);
        });
      }
    };

    if (Array.isArray(tree)) {
      tree.forEach(root => traverse(root));
    } else if (tree) {
      traverse(tree);
    }

    return folders;
  };

  // Close Active Modal
  const closeModal = () => {
    closeColorPicker();
    document.querySelectorAll('.moein-modal-overlay').forEach(el => el.remove());
    document.body.style.overflow = '';
  };

  // Modal: Add Folder (Manual or from Chrome Bookmarks)
  const openAddFolderModal = () => {
    if (currentBoxes.length >= MAX_BOXES) {
      showToast(`حداکثر می‌توانید ${MAX_BOXES} پنجره داشته باشید.`);
      return;
    }

    closeModal();
    document.body.style.overflow = 'hidden';

    const overlay = document.createElement('div');
    overlay.className = 'moein-modal-overlay';

    overlay.innerHTML = `
      <div class="moein-modal-dialog">
        <div class="moein-modal-header">
          <span class="moein-modal-title">${folderIconSvg} افزودن پنجره جدید</span>
          <button class="moein-modal-close" id="moein-modal-close-btn">${closeIconSvg}</button>
        </div>
        <div class="moein-modal-tabs">
          <button class="moein-modal-tab active" data-tab="tab-manual">📁 پوشه جدید (دستی)</button>
          <button class="moein-modal-tab" data-tab="tab-chrome">🔖 وارد کردن از نشانک‌های کروم</button>
        </div>
        <div class="moein-modal-body">
          <!-- Tab 1: Manual -->
          <div id="moein-tab-manual">
            <label class="moein-modal-label">نام پنجره / پوشه:</label>
            <input type="text" id="moein-new-folder-title" class="moein-modal-input" placeholder="مثلاً: ابزارهای کاری یا شبکه‌های اجتماعی" autofocus />
            <div class="moein-modal-help">یک پنجره جدید خالی ایجاد می‌شود و سپس می‌توانید نشانک‌های دلخواه را به آن اضافه کنید.</div>
          </div>
          <!-- Tab 2: Chrome Bookmarks -->
          <div id="moein-tab-chrome" style="display: none;">
            <label class="moein-modal-label">یک پوشه از نشانک‌های کروم انتخاب کنید:</label>
            <div class="moein-modal-search-box">
              <div class="moein-modal-search-icon">${searchIconSvg}</div>
              <input type="text" id="moein-chrome-search-input" class="moein-modal-input" placeholder="جستجو در نام یا مسیر پوشه‌ها..." />
            </div>
            <div id="moein-chrome-folders-list" style="max-height: 250px; overflow-y: auto;">
              <div style="text-align: center; padding: 20px; color: #5f6368;">در حال دریافت نشانک‌های کروم...</div>
            </div>
          </div>
        </div>
        <div class="moein-modal-footer">
          <button class="moein-btn-secondary" id="moein-modal-cancel-btn">انصراف</button>
          <button class="moein-btn-primary" id="moein-modal-submit-folder">ایجاد پنجره</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Event handlers
    overlay.querySelector('#moein-modal-close-btn').addEventListener('click', closeModal);
    overlay.querySelector('#moein-modal-cancel-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Esc key close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Tabs switching
    const tabBtns = overlay.querySelectorAll('.moein-modal-tab');
    const tabManual = overlay.querySelector('#moein-tab-manual');
    const tabChrome = overlay.querySelector('#moein-tab-chrome');
    const submitBtn = overlay.querySelector('#moein-modal-submit-folder');

    let chromeFolders = [];

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.tab === 'tab-manual') {
          tabManual.style.display = 'block';
          tabChrome.style.display = 'none';
          submitBtn.style.display = 'inline-flex';
          overlay.querySelector('#moein-new-folder-title').focus();
        } else {
          tabManual.style.display = 'none';
          tabChrome.style.display = 'block';
          submitBtn.style.display = 'none'; // Import action is per row

          // Load Chrome Bookmarks
          if (chromeFolders.length === 0) {
            fetchChromeBookmarksTree()
              .then(tree => {
                chromeFolders = flattenChromeBookmarkFolders(tree);
                renderChromeFoldersList(chromeFolders);
              })
              .catch(err => {
                const listEl = overlay.querySelector('#moein-chrome-folders-list');
                listEl.innerHTML = `<div style="text-align: center; padding: 20px; color: #d93025;">${err.message || 'عدم دسترسی به نشانک‌ها'}</div>`;
              });
          }
        }
      });
    });

    const renderChromeFoldersList = (foldersToRender) => {
      const listEl = overlay.querySelector('#moein-chrome-folders-list');
      if (!listEl) return;

      if (foldersToRender.length === 0) {
        listEl.innerHTML = '<div style="text-align: center; padding: 20px; color: #5f6368;">پوشه‌ای یافت نشد.</div>';
        return;
      }

      listEl.innerHTML = '';
      foldersToRender.forEach(folder => {
        const row = document.createElement('div');
        row.className = 'moein-bm-folder-row';

        row.innerHTML = `
          <div class="moein-bm-folder-info">
            <div class="moein-bm-folder-icon">${chromeFolderIconSvg}</div>
            <div class="moein-bm-folder-details">
              <span class="moein-bm-folder-title" title="${folder.title}">${folder.title}</span>
              <span class="moein-bm-folder-path" title="${folder.path}">${folder.path} (${folder.count} نشانک)</span>
            </div>
          </div>
          <div class="moein-bm-folder-action">
            <button class="moein-bm-btn-import">وارد کردن این پوشه</button>
          </div>
        `;

        row.querySelector('.moein-bm-btn-import').addEventListener('click', () => {
          if (currentBoxes.length >= MAX_BOXES) {
            showToast(`حداکثر ${MAX_BOXES} پنجره می‌توانید داشته باشید.`);
            return;
          }

          const uniqueSites = [];
          const seen = new Set();
          folder.allBookmarks.forEach(b => {
            const norm = (b.url || '').toLowerCase().replace(/\/$/, '');
            if (!seen.has(norm)) {
              seen.add(norm);
              uniqueSites.push({
                name: b.name,
                url: b.url,
                domain: b.domain || extractDomain(b.url)
              });
            }
          });

          const newBox = {
            id: 'box_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            title: folder.title,
            sites: uniqueSites
          };

          currentBoxes.push(newBox);
          saveBoxes(() => {
            renderShortcutsGrid();
            closeModal();
            showToast(`پنجره «${newBox.title}» با ${newBox.sites.length} نشانک اضافه شد.`);
          });
        });

        listEl.appendChild(row);
      });
    };

    // Filter search input for Chrome folders
    const searchInput = overlay.querySelector('#moein-chrome-search-input');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = chromeFolders.filter(f =>
        f.title.toLowerCase().includes(query) || f.path.toLowerCase().includes(query)
      );
      renderChromeFoldersList(filtered);
    });

    // Create Manual Folder Submit
    const handleManualSubmit = () => {
      const titleInput = overlay.querySelector('#moein-new-folder-title');
      const title = (titleInput.value || '').trim();
      if (!title) {
        titleInput.focus();
        showToast('لطفاً نام پنجره را وارد کنید.');
        return;
      }

      if (currentBoxes.length >= MAX_BOXES) {
        showToast(`حداکثر ${MAX_BOXES} پنجره می‌توانید داشته باشید.`);
        return;
      }

      const newBox = {
        id: 'box_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title: title,
        sites: []
      };

      currentBoxes.push(newBox);
      saveBoxes(() => {
        renderShortcutsGrid();
        closeModal();
        showToast(`پنجره «${newBox.title}» ایجاد شد.`);
      });
    };

    submitBtn.addEventListener('click', handleManualSubmit);
    overlay.querySelector('#moein-new-folder-title').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleManualSubmit();
    });
  };

  // Modal: Add Bookmark to Specific Folder
  const openAddBookmarkModal = (boxId) => {
    const targetBox = currentBoxes.find(b => b.id === boxId);
    if (!targetBox) return;

    closeModal();
    document.body.style.overflow = 'hidden';

    const overlay = document.createElement('div');
    overlay.className = 'moein-modal-overlay';

    overlay.innerHTML = `
      <div class="moein-modal-dialog">
        <div class="moein-modal-header">
          <span class="moein-modal-title">${folderIconSvg} افزودن نشانک به «${targetBox.title}»</span>
          <button class="moein-modal-close" id="moein-bm-close-btn">${closeIconSvg}</button>
        </div>
        <div class="moein-modal-tabs">
          <button class="moein-modal-tab active" data-tab="tab-bm-url">🔗 ورود مستقیم آدرس (URL)</button>
          <button class="moein-modal-tab" data-tab="tab-bm-chrome">🔖 انتخاب از نشانک‌های کروم</button>
        </div>
        <div class="moein-modal-body">
          <!-- Tab 1: Manual URL -->
          <div id="moein-tab-bm-url">
            <label class="moein-modal-label">عنوان نشانک (اختیاری):</label>
            <input type="text" id="moein-bm-input-name" class="moein-modal-input" placeholder="مثلاً: گوگل یا گیت‌هاب" />

            <label class="moein-modal-label">آدرس وبسایت (URL):</label>
            <input type="text" id="moein-bm-input-url" class="moein-modal-input" placeholder="مثلاً: https://github.com" autofocus />
            <div class="moein-modal-help">در صورت خالی گذاشتن عنوان، نام دامنه به عنوان نام نشانک استفاده خواهد شد. با فشردن کلید Enter نیز ثبت می‌شود.</div>
          </div>
          <!-- Tab 2: Chrome Bookmarks Selection -->
          <div id="moein-tab-bm-chrome" style="display: none;">
            <div class="moein-modal-search-box">
              <div class="moein-modal-search-icon">${searchIconSvg}</div>
              <input type="text" id="moein-bm-search-input" class="moein-modal-input" placeholder="جستجو در نشانک‌ها یا پوشه‌ها..." />
            </div>

            <div class="moein-bm-list-container">
              <div class="moein-bm-list-header">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
                  <input type="checkbox" id="moein-bm-select-all" />
                  <span>انتخاب همه موارد نمایش‌داده‌شده</span>
                </label>
                <span id="moein-bm-selected-count" style="font-size: 11px; color: #5f6368;">۰ مورد انتخاب شده</span>
              </div>
              <div id="moein-bm-folders-checklist" class="moein-bm-list-items" style="max-height: 260px;">
                <div style="text-align: center; padding: 20px; color: #5f6368;">در حال دریافت نشانک‌های کروم...</div>
              </div>
            </div>
            <div class="moein-modal-help" style="margin-top: 8px;">می‌توانید کل یک پوشه را با تیک زدن انتخاب کنید یا با زدن فلش، نشانک‌های داخل آن را باز کرده و انتخاب کنید.</div>
          </div>
        </div>
        <div class="moein-modal-footer">
          <button class="moein-btn-secondary" id="moein-bm-cancel-btn">انصراف</button>
          <button class="moein-btn-primary" id="moein-bm-submit-btn">افزودن نشانک</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Event handlers
    overlay.querySelector('#moein-bm-close-btn').addEventListener('click', closeModal);
    overlay.querySelector('#moein-bm-cancel-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Tabs switching
    const tabBtns = overlay.querySelectorAll('.moein-modal-tab');
    const tabUrl = overlay.querySelector('#moein-tab-bm-url');
    const tabChrome = overlay.querySelector('#moein-tab-bm-chrome');
    const submitBtn = overlay.querySelector('#moein-bm-submit-btn');

    let activeTab = 'tab-bm-url';
    let chromeFolders = [];
    const selectedBookmarksMap = new Map(); // id -> bm item

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.dataset.tab;

        if (activeTab === 'tab-bm-url') {
          tabUrl.style.display = 'block';
          tabChrome.style.display = 'none';
          submitBtn.textContent = 'افزودن نشانک';
          overlay.querySelector('#moein-bm-input-url').focus();
        } else {
          tabUrl.style.display = 'none';
          tabChrome.style.display = 'block';
          updateSubmitBtnState();

          if (chromeFolders.length === 0) {
            fetchChromeBookmarksTree()
              .then(tree => {
                chromeFolders = flattenChromeBookmarkFolders(tree);
                renderFoldersChecklist();
              })
              .catch(err => {
                const listEl = overlay.querySelector('#moein-bm-folders-checklist');
                if (listEl) {
                  listEl.innerHTML = `<div style="text-align: center; padding: 20px; color: #d93025;">${err.message || 'خطا در دریافت نشانک‌ها'}</div>`;
                }
              });
          }
        }
      });
    });

    const updateSubmitBtnState = () => {
      const count = selectedBookmarksMap.size;
      const countEl = overlay.querySelector('#moein-bm-selected-count');
      if (countEl) countEl.textContent = `${count} مورد انتخاب شده`;
      if (activeTab === 'tab-bm-chrome') {
        submitBtn.textContent = count > 0 ? `افزودن ${count} نشانک به «${targetBox.title}»` : 'افزودن نشانک‌های انتخاب‌شده';
      }
    };

    const renderFoldersChecklist = () => {
      const listEl = overlay.querySelector('#moein-bm-folders-checklist');
      if (!listEl) return;

      const searchInput = overlay.querySelector('#moein-bm-search-input');
      const query = (searchInput?.value || '').toLowerCase().trim();

      const filteredFolders = chromeFolders.filter(folder => {
        if (!query) return true;
        const matchesFolder = folder.title.toLowerCase().includes(query) || folder.path.toLowerCase().includes(query);
        const matchesAnyBm = folder.allBookmarks.some(bm =>
          bm.name.toLowerCase().includes(query) || bm.url.toLowerCase().includes(query)
        );
        return matchesFolder || matchesAnyBm;
      });

      if (filteredFolders.length === 0) {
        listEl.innerHTML = '<div style="text-align: center; padding: 20px; color: #5f6368;">نشانک یا پوشه‌ای یافت نشد.</div>';
        return;
      }

      listEl.innerHTML = '';

      filteredFolders.forEach(folder => {
        const folderRow = document.createElement('div');
        folderRow.className = 'moein-bm-folder-check-row';
        folderRow.dataset.folderId = folder.id;

        const mainRow = document.createElement('div');
        mainRow.className = 'moein-bm-folder-main';

        const leadLabel = document.createElement('label');
        leadLabel.className = 'moein-bm-folder-lead';

        const folderCheckbox = document.createElement('input');
        folderCheckbox.type = 'checkbox';
        folderCheckbox.className = 'moein-folder-cb';

        const allSelected = folder.allBookmarks.length > 0 && folder.allBookmarks.every(bm => selectedBookmarksMap.has(bm.id));
        const someSelected = folder.allBookmarks.some(bm => selectedBookmarksMap.has(bm.id));
        folderCheckbox.checked = allSelected;
        folderCheckbox.indeterminate = !allSelected && someSelected;

        const iconDiv = document.createElement('div');
        iconDiv.className = 'moein-bm-folder-icon';
        iconDiv.innerHTML = chromeFolderIconSvg;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'moein-bm-folder-details';
        detailsDiv.innerHTML = `
          <span class="moein-bm-folder-title" title="${folder.title}">${folder.title}</span>
          <span class="moein-bm-folder-path" title="${folder.path}">${folder.path} (${folder.count} نشانک)</span>
        `;

        leadLabel.appendChild(folderCheckbox);
        leadLabel.appendChild(iconDiv);
        leadLabel.appendChild(detailsDiv);

        const expandBtn = document.createElement('button');
        expandBtn.type = 'button';
        expandBtn.className = 'moein-bm-expand-btn';
        expandBtn.title = 'نمایش/مخفی‌سازی نشانک‌های داخل این پوشه';
        expandBtn.innerHTML = chevronDownSvg;

        mainRow.appendChild(leadLabel);
        mainRow.appendChild(expandBtn);
        folderRow.appendChild(mainRow);

        // Nested bookmarks list
        const nestedList = document.createElement('div');
        nestedList.className = 'moein-bm-nested-list';

        if (query && folder.allBookmarks.some(bm => bm.name.toLowerCase().includes(query) || bm.url.toLowerCase().includes(query))) {
          nestedList.classList.add('open');
          expandBtn.classList.add('expanded');
        }

        expandBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = nestedList.classList.toggle('open');
          expandBtn.classList.toggle('expanded', isOpen);
        });

        // Folder Checkbox handler
        folderCheckbox.addEventListener('change', () => {
          const checked = folderCheckbox.checked;
          folderCheckbox.indeterminate = false;
          folder.allBookmarks.forEach(bm => {
            if (checked) {
              selectedBookmarksMap.set(bm.id, bm);
            } else {
              selectedBookmarksMap.delete(bm.id);
            }
          });
          nestedList.querySelectorAll('.moein-bm-item-cb').forEach(cb => {
            cb.checked = checked;
          });
          updateSubmitBtnState();
          updateSelectAllCheckboxState();
        });

        // Populate nested items
        folder.allBookmarks.forEach(bm => {
          if (query) {
            const matchesBm = bm.name.toLowerCase().includes(query) || bm.url.toLowerCase().includes(query);
            const matchesFolder = folder.title.toLowerCase().includes(query) || folder.path.toLowerCase().includes(query);
            if (!matchesBm && !matchesFolder) return;
          }

          const bmItem = document.createElement('label');
          bmItem.className = 'moein-bm-check-item';

          const bmCb = document.createElement('input');
          bmCb.type = 'checkbox';
          bmCb.className = 'moein-bm-item-cb';
          bmCb.checked = selectedBookmarksMap.has(bm.id);

          bmCb.addEventListener('change', () => {
            if (bmCb.checked) {
              selectedBookmarksMap.set(bm.id, bm);
            } else {
              selectedBookmarksMap.delete(bm.id);
            }

            const fAll = folder.allBookmarks.every(b => selectedBookmarksMap.has(b.id));
            const fSome = folder.allBookmarks.some(b => selectedBookmarksMap.has(b.id));
            folderCheckbox.checked = fAll;
            folderCheckbox.indeterminate = !fAll && fSome;

            updateSubmitBtnState();
            updateSelectAllCheckboxState();
          });

          const iconEl = document.createElement('div');
          iconEl.className = 'moein-bm-check-icon';
          const img = document.createElement('img');
          img.src = `https://www.google.com/s2/favicons?domain=${bm.domain}&sz=64`;
          img.alt = bm.name;
          img.loading = 'lazy';
          img.onerror = () => {
            img.remove();
            iconEl.innerHTML = globeIconSvg;
          };
          iconEl.appendChild(img);

          const textEl = document.createElement('div');
          textEl.className = 'moein-bm-check-text';
          textEl.innerHTML = `
            <span class="moein-bm-check-title" title="${bm.name}">${bm.name}</span>
            <span class="moein-bm-check-url" title="${bm.url}">${bm.url}</span>
          `;

          bmItem.appendChild(bmCb);
          bmItem.appendChild(iconEl);
          bmItem.appendChild(textEl);
          nestedList.appendChild(bmItem);
        });

        folderRow.appendChild(nestedList);
        listEl.appendChild(folderRow);
      });

      updateSelectAllCheckboxState();
    };

    const updateSelectAllCheckboxState = () => {
      const selectAllCb = overlay.querySelector('#moein-bm-select-all');
      if (!selectAllCb || chromeFolders.length === 0) return;

      let allCount = 0;
      let selectedCount = 0;
      chromeFolders.forEach(f => {
        f.allBookmarks.forEach(bm => {
          allCount++;
          if (selectedBookmarksMap.has(bm.id)) selectedCount++;
        });
      });

      if (allCount === 0) {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = false;
      } else if (selectedCount === allCount) {
        selectAllCb.checked = true;
        selectAllCb.indeterminate = false;
      } else if (selectedCount > 0) {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = true;
      } else {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = false;
      }
    };

    // Select All Toggle
    const selectAllCheckbox = overlay.querySelector('#moein-bm-select-all');
    selectAllCheckbox.addEventListener('change', () => {
      const isChecked = selectAllCheckbox.checked;
      selectAllCheckbox.indeterminate = false;

      chromeFolders.forEach(folder => {
        folder.allBookmarks.forEach(bm => {
          if (isChecked) {
            selectedBookmarksMap.set(bm.id, bm);
          } else {
            selectedBookmarksMap.delete(bm.id);
          }
        });
      });

      overlay.querySelectorAll('.moein-folder-cb').forEach(cb => {
        cb.checked = isChecked;
        cb.indeterminate = false;
      });
      overlay.querySelectorAll('.moein-bm-item-cb').forEach(cb => {
        cb.checked = isChecked;
      });

      updateSubmitBtnState();
    });

    // Search filter input
    const searchInput = overlay.querySelector('#moein-bm-search-input');
    searchInput.addEventListener('input', () => {
      renderFoldersChecklist();
    });

    // Submit Handler
    const handleBookmarkSubmit = () => {
      if (activeTab === 'tab-bm-url') {
        const rawUrl = overlay.querySelector('#moein-bm-input-url').value;
        const validUrl = sanitizeUrl(rawUrl);

        if (!validUrl) {
          showToast('لطفاً یک آدرس اینترنتی معتبر وارد کنید.');
          overlay.querySelector('#moein-bm-input-url').focus();
          return;
        }

        const domain = extractDomain(validUrl);
        const rawName = overlay.querySelector('#moein-bm-input-name').value.trim();
        const siteName = rawName || domain || 'نشانک';

        const normUrl = validUrl.toLowerCase().replace(/\/$/, '');
        const exists = targetBox.sites.some(s => (s.url || '').toLowerCase().replace(/\/$/, '') === normUrl);

        if (exists) {
          showToast(`این نشانک از قبل در «${targetBox.title}» وجود دارد.`);
          closeModal();
          return;
        }

        targetBox.sites.push({
          name: siteName,
          url: validUrl,
          domain: domain
        });

        saveBoxes(() => {
          renderShortcutsGrid();
          closeModal();
          showToast(`نشانک «${siteName}» اضافه شد.`);
        });
      } else {
        // Tab Chrome
        if (selectedBookmarksMap.size === 0) {
          showToast('لطفاً حداقل یک پوشه یا نشانک را تیک بزنید.');
          return;
        }

        const existingUrls = new Set(targetBox.sites.map(s => (s.url || '').toLowerCase().replace(/\/$/, '')));
        let addedCount = 0;
        let duplicateCount = 0;

        selectedBookmarksMap.forEach(bm => {
          const norm = (bm.url || '').toLowerCase().replace(/\/$/, '');
          if (!existingUrls.has(norm)) {
            existingUrls.add(norm);
            targetBox.sites.push({
              name: bm.name,
              url: bm.url,
              domain: bm.domain || extractDomain(bm.url)
            });
            addedCount++;
          } else {
            duplicateCount++;
          }
        });

        saveBoxes(() => {
          renderShortcutsGrid();
          closeModal();
          if (addedCount > 0) {
            const dupMsg = duplicateCount > 0 ? ` (${duplicateCount} مورد تکراری نادیده گرفته شد)` : '';
            showToast(`${addedCount} نشانک به «${targetBox.title}» افزوده شد.${dupMsg}`);
          } else {
            showToast(`تمام نشانک‌های انتخاب‌شده از قبل در «${targetBox.title}» وجود داشتند.`);
          }
        });
      }
    };

    submitBtn.addEventListener('click', handleBookmarkSubmit);

    // Enter key submits on both Title and URL input
    overlay.querySelector('#moein-bm-input-url').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleBookmarkSubmit();
    });
    overlay.querySelector('#moein-bm-input-name').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleBookmarkSubmit();
    });
  };

  // Modal: Confirm Delete Box
  const openConfirmDeleteBoxModal = (boxId) => {
    const targetBox = currentBoxes.find(b => b.id === boxId);
    if (!targetBox) return;

    closeModal();
    document.body.style.overflow = 'hidden';

    const overlay = document.createElement('div');
    overlay.className = 'moein-modal-overlay';

    overlay.innerHTML = `
      <div class="moein-modal-dialog" style="max-width: 420px;">
        <div class="moein-modal-header">
          <span class="moein-modal-title">${trashIconSvg} حذف پنجره</span>
          <button class="moein-modal-close" id="moein-del-close-btn">${closeIconSvg}</button>
        </div>
        <div class="moein-modal-body">
          <p style="font-size: 13px; line-height: 1.6; color: #3c4043; margin: 0 0 8px 0;">
            آیا از حذف پنجره <strong>«${targetBox.title}»</strong> و تمام نشانک‌های آن اطمینان دارید؟
          </p>
          <div class="moein-modal-help">این عملیات پنجره را از صفحه حذف می‌کند ولی نشانک‌های خود کروم دست‌نخورده باقی می‌مانند.</div>
        </div>
        <div class="moein-modal-footer">
          <button class="moein-btn-secondary" id="moein-del-cancel-btn">انصراف</button>
          <button class="moein-btn-danger" id="moein-del-confirm-btn">حذف پنجره</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#moein-del-close-btn').addEventListener('click', closeModal);
    overlay.querySelector('#moein-del-cancel-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    overlay.querySelector('#moein-del-confirm-btn').addEventListener('click', () => {
      currentBoxes = currentBoxes.filter(b => b.id !== boxId);
      saveBoxes(() => {
        renderShortcutsGrid();
        closeModal();
        showToast(`پنجره «${targetBox.title}» حذف شد.`);
      });
    });
  };

  // Delete Individual Site from a Box
  const deleteSiteFromBox = (boxId, siteIndex) => {
    const targetBox = currentBoxes.find(b => b.id === boxId);
    if (!targetBox || !targetBox.sites[siteIndex]) return;

    const removedSite = targetBox.sites[siteIndex];
    targetBox.sites.splice(siteIndex, 1);

    saveBoxes(() => {
      renderShortcutsGrid();
      showToast(`نشانک «${removedSite.name}» حذف شد.`);
    });
  };

  // Helper for HSL to RGB conversion
  const hslToRgb = (h, s, l) => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r1 = 0, g1 = 0, b1 = 0;
    if (h < 60) { r1 = c; g1 = x; b1 = 0; }
    else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
    else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
    else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
    else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
    else { r1 = c; g1 = 0; b1 = x; }
    return [
      Math.round((r1 + m) * 255),
      Math.round((g1 + m) * 255),
      Math.round((b1 + m) * 255)
    ];
  };

  // Close active color picker popover
  const closeColorPicker = () => {
    const activePopover = document.querySelector('.moein-color-picker-popover');
    if (activePopover) {
      if (typeof activePopover._cleanup === 'function') activePopover._cleanup();
      activePopover.remove();
    }
  };

  // Color Wheel Popover
  const openColorPickerPopover = (box, colorDot, boxCard) => {
    closeColorPicker();

    const popover = document.createElement('div');
    popover.className = 'moein-color-picker-popover';

    // Header
    const popoverHeader = document.createElement('div');
    popoverHeader.className = 'moein-color-popover-header';

    const popoverTitle = document.createElement('div');
    popoverTitle.className = 'moein-color-popover-title';
    popoverTitle.innerHTML = `<span>🎨</span><span>رنگ پنجره</span>`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'moein-color-popover-close';
    closeBtn.innerHTML = closeIconSvg;
    closeBtn.title = 'بستن';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeColorPicker();
    });

    popoverHeader.appendChild(popoverTitle);
    popoverHeader.appendChild(closeBtn);
    popover.appendChild(popoverHeader);

    // Color Wheel Container
    const wheelContainer = document.createElement('div');
    wheelContainer.className = 'moein-color-wheel-container';

    const canvas = document.createElement('canvas');
    canvas.className = 'moein-color-wheel-canvas';
    canvas.width = 140;
    canvas.height = 140;
    canvas.title = 'برای انتخاب رنگ روی دایره کلیک کنید';

    const marker = document.createElement('div');
    marker.className = 'moein-color-marker';

    wheelContainer.appendChild(canvas);
    wheelContainer.appendChild(marker);
    popover.appendChild(wheelContainer);

    // Draw circular Color Wheel
    const ctx = canvas.getContext ? canvas.getContext('2d') : null;
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = cx - 2;

    if (ctx && ctx.createImageData) {
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const idx = (y * width + x) * 4;

          if (dist <= radius) {
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle < 0) angle += 360;

            const sat = dist / radius;
            const light = 0.96 - (sat * 0.44);
            const [r, g, b] = hslToRgb(angle, sat, light);

            let alpha = 255;
            if (dist > radius - 1.5) {
              alpha = Math.max(0, Math.min(255, Math.round((radius - dist) / 1.5 * 255)));
            }

            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = alpha;
          } else {
            data[idx + 3] = 0;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // Apply color logic
    const applyColor = (r, g, b, markX, markY) => {
      const bgColor = `rgba(${r}, ${g}, ${b}, 0.65)`;
      const hoverBgColor = `rgba(${r}, ${g}, ${b}, 0.82)`;
      const dotColor = `rgb(${r}, ${g}, ${b})`;

      box.bgColor = bgColor;
      box.hoverBgColor = hoverBgColor;
      box.colorDot = dotColor;

      boxCard.style.setProperty('--moein-card-bg', bgColor);
      boxCard.style.setProperty('--moein-card-hover-bg', hoverBgColor);
      colorDot.style.backgroundColor = dotColor;

      if (typeof markX === 'number' && typeof markY === 'number') {
        marker.style.left = `${markX}px`;
        marker.style.top = `${markY}px`;
        marker.style.display = 'block';
      } else {
        marker.style.display = 'none';
      }

      saveBoxes();
    };

    // Color Pick from Canvas Click / Drag
    let isPicking = false;

    const pickColorFromEvent = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / (rect.width || canvas.width);
      const scaleY = canvas.height / (rect.height || canvas.height);
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      const x = Math.max(0, Math.min(canvas.width - 1, Math.round(px)));
      const y = Math.max(0, Math.min(canvas.height - 1, Math.round(py)));

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        if (ctx && ctx.getImageData) {
          try {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            if (pixel[3] > 0) {
              applyColor(pixel[0], pixel[1], pixel[2], x, y);
              return;
            }
          } catch (_) {}
        }
        // Fallback calculation directly from angle and sat
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        const sat = dist / radius;
        const light = 0.96 - (sat * 0.44);
        const [r, g, b] = hslToRgb(angle, sat, light);
        applyColor(r, g, b, x, y);
      }
    };

    canvas.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isPicking = true;
      pickColorFromEvent(e);
    });

    const onMouseMove = (e) => {
      if (isPicking) {
        pickColorFromEvent(e);
      }
    };

    const onMouseUp = () => {
      isPicking = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Quick Presets Row
    const presetsRow = document.createElement('div');
    presetsRow.className = 'moein-color-presets-row';

    const presets = [
      { name: 'آبی آسمانی', r: 187, g: 222, b: 251 },
      { name: 'سبز نعنایی', r: 178, g: 242, b: 219 },
      { name: 'بنفش ملایم', r: 225, g: 190, b: 231 },
      { name: 'هلویی', r: 255, g: 204, b: 188 },
      { name: 'لیمویی', r: 255, g: 245, b: 157 },
      { name: 'رز روشن', r: 248, g: 187, b: 208 }
    ];

    presets.forEach(p => {
      const pDot = document.createElement('div');
      pDot.className = 'moein-color-preset-dot';
      pDot.title = p.name;
      pDot.style.backgroundColor = `rgb(${p.r}, ${p.g}, ${p.b})`;
      pDot.addEventListener('click', (e) => {
        e.stopPropagation();
        applyColor(p.r, p.g, p.b);
      });
      presetsRow.appendChild(pDot);
    });

    popover.appendChild(presetsRow);

    // Reset to Default Button
    const resetBtn = document.createElement('button');
    resetBtn.className = 'moein-color-reset-btn';
    resetBtn.textContent = 'رنگ پیش‌فرض شیشه‌ای';
    resetBtn.title = 'بازگشت به حالت پیش‌فرض';
    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      delete box.bgColor;
      delete box.hoverBgColor;
      delete box.colorDot;
      boxCard.style.removeProperty('--moein-card-bg');
      boxCard.style.removeProperty('--moein-card-hover-bg');
      colorDot.style.backgroundColor = 'rgba(230, 235, 240, 0.9)';
      marker.style.display = 'none';
      saveBoxes();
    });

    popover.appendChild(resetBtn);

    // Position Popover above colorDot ("بالاش بیاد")
    document.body.appendChild(popover);

    const dotRect = colorDot.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    let top = dotRect.top - popoverRect.height - 10;
    if (top < 10) {
      top = dotRect.bottom + 10;
    }

    let left = dotRect.left + (dotRect.width / 2) - (popoverRect.width / 2);
    left = Math.max(10, Math.min(window.innerWidth - popoverRect.width - 10, left));

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    // Outside click & ESC listener
    const onOutsideClick = (e) => {
      if (!popover.contains(e.target) && !colorDot.contains(e.target)) {
        closeColorPicker();
      }
    };

    const onKeydown = (e) => {
      if (e.key === 'Escape') {
        closeColorPicker();
      }
    };

    setTimeout(() => {
      document.addEventListener('mousedown', onOutsideClick);
      document.addEventListener('keydown', onKeydown);
    }, 10);

    popover._cleanup = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onOutsideClick);
      document.removeEventListener('keydown', onKeydown);
    };
  };

  // Render the 2x5 Shortcuts Grid
  const renderShortcutsGrid = () => {
    let grid = document.getElementById('moein-shortcuts-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // Render Box Cards (up to MAX_BOXES)
    const boxesToRender = currentBoxes.slice(0, MAX_BOXES);

    boxesToRender.forEach(box => {
      const boxCard = document.createElement('div');
      boxCard.className = 'moein-box-card';
      if (box.sites && box.sites.length > 4) {
        boxCard.classList.add('moein-many-sites');
      }
      if (box.sites.length <= 4) {
        boxCard.classList.add('moein-no-scroll');
      } else if (box.sites.length <= 6) {
        boxCard.classList.add('moein-no-scroll-on-wide');
      }
      boxCard.dataset.boxId = box.id;
      boxCard.setAttribute('draggable', 'false');

      // Apply custom background color if set
      if (box.bgColor) {
        boxCard.style.setProperty('--moein-card-bg', box.bgColor);
        boxCard.style.setProperty('--moein-card-hover-bg', box.hoverBgColor || box.bgColor);
      }

      // Header
      const header = document.createElement('div');
      header.className = 'moein-box-header';

      const titleGroup = document.createElement('div');
      titleGroup.className = 'moein-box-title-group';

      // 6-dot Drag Handle (⋮⋮)
      const dragHandle = document.createElement('div');
      dragHandle.className = 'moein-box-drag-handle';
      dragHandle.title = 'جابجایی این پنجره';
      dragHandle.setAttribute('role', 'button');
      dragHandle.setAttribute('aria-label', 'جابجایی این پنجره');
      dragHandle.innerHTML = dragGripIconSvg;

      const titleSpan = document.createElement('span');
      titleSpan.className = 'moein-box-title';
      titleSpan.title = box.title;
      titleSpan.innerHTML = `${folderIconSvg}<span class="moein-box-title-text">${box.title}</span>`;

      const badge = document.createElement('span');
      badge.className = 'moein-box-badge';
      badge.textContent = `${box.sites.length}`;

      // Color Indicator Dot (to the left of the badge in RTL)
      const colorDot = document.createElement('div');
      colorDot.className = 'moein-box-color-dot';
      colorDot.title = 'تغییر رنگ پس‌زمینه این پنجره';
      colorDot.setAttribute('role', 'button');
      colorDot.setAttribute('aria-label', 'تغییر رنگ پس‌زمینه این پنجره');
      if (box.colorDot) {
        colorDot.style.backgroundColor = box.colorDot;
      } else if (box.bgColor) {
        colorDot.style.backgroundColor = box.bgColor;
      } else {
        colorDot.style.backgroundColor = 'rgba(230, 235, 240, 0.9)';
      }

      titleGroup.appendChild(dragHandle);
      titleGroup.appendChild(titleSpan);
      titleGroup.appendChild(badge);
      titleGroup.appendChild(colorDot);

      // Actions (+ Add Bookmark, Trash Delete Box)
      const actionsGroup = document.createElement('div');
      actionsGroup.className = 'moein-box-actions';

      const addSiteBtn = document.createElement('button');
      addSiteBtn.className = 'moein-btn-icon moein-btn-add';
      addSiteBtn.title = 'افزودن نشانک به این پنجره';
      addSiteBtn.innerHTML = plusIconSvg;
      addSiteBtn.setAttribute('draggable', 'false');

      const delBoxBtn = document.createElement('button');
      delBoxBtn.className = 'moein-btn-icon moein-btn-del';
      delBoxBtn.title = 'حذف این پنجره';
      delBoxBtn.innerHTML = trashIconSvg;
      delBoxBtn.setAttribute('draggable', 'false');

      // Card Drag Activation: Only mousedown on dragHandle initiates card drag
      const enableBoxDrag = (e) => {
        if (e.button === 0) {
          boxDragInitiatorCard = boxCard;
          boxCard.setAttribute('draggable', 'true');
        }
      };

      const cancelBoxDrag = () => {
        if (!draggedBoxId) {
          boxCard.setAttribute('draggable', 'false');
          if (boxDragInitiatorCard === boxCard) {
            boxDragInitiatorCard = null;
          }
        }
      };

      dragHandle.addEventListener('mousedown', enableBoxDrag);
      dragHandle.addEventListener('mouseup', cancelBoxDrag);

      // Action buttons must never initiate drag
      const blockCardDrag = (e) => {
        e.stopPropagation();
        cancelBoxDrag();
      };

      addSiteBtn.addEventListener('mousedown', blockCardDrag);
      delBoxBtn.addEventListener('mousedown', blockCardDrag);
      colorDot.addEventListener('mousedown', blockCardDrag);
      addSiteBtn.addEventListener('dragstart', (e) => { e.preventDefault(); e.stopPropagation(); });
      delBoxBtn.addEventListener('dragstart', (e) => { e.preventDefault(); e.stopPropagation(); });
      colorDot.addEventListener('dragstart', (e) => { e.preventDefault(); e.stopPropagation(); });

      colorDot.addEventListener('click', (e) => {
        e.stopPropagation();
        openColorPickerPopover(box, colorDot, boxCard);
      });

      addSiteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openAddBookmarkModal(box.id);
      });

      delBoxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openConfirmDeleteBoxModal(box.id);
      });

      actionsGroup.appendChild(addSiteBtn);
      actionsGroup.appendChild(delBoxBtn);

      header.appendChild(titleGroup);
      header.appendChild(actionsGroup);
      boxCard.appendChild(header);

      // Box Drag Events
      boxCard.addEventListener('dragstart', (e) => {
        if (boxDragInitiatorCard !== boxCard) {
          e.preventDefault();
          return;
        }
        draggedBoxId = box.id;
        draggedSiteInfo = null;
        boxCard.classList.add('moein-dragging');
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'moein-box', boxId: box.id }));
        }
      });

      boxCard.addEventListener('dragend', () => {
        boxCard.setAttribute('draggable', 'false');
        boxCard.classList.remove('moein-dragging');
        boxDragInitiatorCard = null;
        draggedBoxId = null;
        lastDragEndTime = Date.now();
        document.querySelectorAll('.moein-drag-over').forEach(el => el.classList.remove('moein-drag-over'));
        document.querySelectorAll('.moein-site-drag-over').forEach(el => el.classList.remove('moein-site-drag-over'));
      });

      boxCard.addEventListener('dragover', (e) => {
        if (draggedBoxId) {
          if (draggedBoxId !== box.id) {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            boxCard.classList.add('moein-drag-over');
          }
        } else if (draggedSiteInfo) {
          // Only show box-level drag-over when dragging a bookmark to a DIFFERENT box
          if (draggedSiteInfo.sourceBoxId !== box.id) {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            boxCard.classList.add('moein-drag-over');
          }
        }
      });

      boxCard.addEventListener('dragleave', (e) => {
        if (!boxCard.contains(e.relatedTarget)) {
          boxCard.classList.remove('moein-drag-over');
        }
      });

      boxCard.addEventListener('drop', (e) => {
        e.preventDefault();
        document.querySelectorAll('.moein-drag-over').forEach(el => el.classList.remove('moein-drag-over'));
        document.querySelectorAll('.moein-site-drag-over').forEach(el => el.classList.remove('moein-site-drag-over'));

        if (draggedBoxId && draggedBoxId !== box.id) {
          e.stopPropagation();
          const sourceIdx = currentBoxes.findIndex(b => b.id === draggedBoxId);
          const targetIdx = currentBoxes.findIndex(b => b.id === box.id);
          draggedBoxId = null;
          boxDragInitiatorCard = null;
          if (sourceIdx !== -1 && targetIdx !== -1) {
            const movedBoxTitle = currentBoxes[sourceIdx].title;
            reorderBoxes(currentBoxes, sourceIdx, targetIdx);
            saveBoxes(() => {
              renderShortcutsGrid();
              showToast(`پنجره «${movedBoxTitle}» جابجا شد.`);
            });
          }
        } else if (draggedSiteInfo) {
          e.stopPropagation();
          const { sourceBoxId, siteIndex: srcIdx } = draggedSiteInfo;
          draggedSiteInfo = null;
          const sourceBox = currentBoxes.find(b => b.id === sourceBoxId);
          const targetBox = box;
          if (sourceBox && targetBox) {
            if (sourceBox.id === targetBox.id) {
              if (srcIdx !== targetBox.sites.length - 1) {
                reorderSitesInBox(sourceBox, srcIdx, targetBox.sites.length - 1);
                saveBoxes(() => {
                  renderShortcutsGrid();
                });
              }
            } else {
              const movedSite = transferSiteBetweenBoxes(sourceBox, targetBox, srcIdx);
              if (movedSite) {
                saveBoxes(() => {
                  renderShortcutsGrid();
                  showToast(`نشانک «${movedSite.name}» به «${targetBox.title}» منتقل شد.`);
                });
              }
            }
          }
        } else {
          draggedBoxId = null;
          draggedSiteInfo = null;
          boxDragInitiatorCard = null;
        }
      });

      // Sites Scrollable Container
      const sitesContainer = document.createElement('div');
      sitesContainer.className = 'moein-box-items';
      if (box.sites && box.sites.length > 4) {
        sitesContainer.classList.add('moein-items-many');
      }
      if (box.sites.length <= 4) {
        sitesContainer.classList.add('moein-no-scroll');
      } else if (box.sites.length <= 6) {
        sitesContainer.classList.add('moein-no-scroll-on-wide');
      }

      sitesContainer.addEventListener('dragover', (e) => {
        if (draggedSiteInfo) {
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        }
      });

      if (box.sites.length === 0) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'moein-box-empty';
        emptyEl.innerHTML = `${plusIconSvg}<span>افزودن نشانک</span>`;
        emptyEl.addEventListener('dragover', (e) => {
          if (draggedSiteInfo) {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
          }
        });
        emptyEl.addEventListener('click', () => openAddBookmarkModal(box.id));
        sitesContainer.appendChild(emptyEl);
      } else {
        box.sites.forEach((site, index) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'moein-site-wrapper';
          wrapper.setAttribute('draggable', 'true');
          wrapper.dataset.boxId = box.id;
          wrapper.dataset.siteIndex = index;

          const a = document.createElement('a');
          a.className = 'moein-site-item';
          a.href = site.url;
          a.title = `${site.name} (${site.url})`;
          a.setAttribute('draggable', 'false');
          a.addEventListener('click', (e) => {
            if (Date.now() - lastDragEndTime < 250) {
              e.preventDefault();
              e.stopPropagation();
            }
          });

          const iconWrapper = document.createElement('div');
          iconWrapper.className = 'moein-site-icon';
          iconWrapper.setAttribute('draggable', 'false');

          const domain = site.domain || extractDomain(site.url);
          const img = document.createElement('img');
          img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
          img.alt = site.name;
          img.loading = 'lazy';
          img.setAttribute('draggable', 'false');
          img.onerror = () => {
            img.remove();
            iconWrapper.innerHTML = globeIconSvg;
          };
          iconWrapper.appendChild(img);

          const nameSpan = document.createElement('span');
          nameSpan.className = 'moein-site-name';
          nameSpan.textContent = site.name;
          nameSpan.setAttribute('draggable', 'false');

          a.appendChild(iconWrapper);
          a.appendChild(nameSpan);
          wrapper.appendChild(a);

          // Individual Delete Button (hover ×)
          const delSiteBtn = document.createElement('button');
          delSiteBtn.className = 'moein-site-del-btn';
          delSiteBtn.title = 'حذف این نشانک';
          delSiteBtn.innerHTML = '×';
          delSiteBtn.setAttribute('draggable', 'false');

          delSiteBtn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
          });
          delSiteBtn.addEventListener('dragstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
          delSiteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteSiteFromBox(box.id, index);
          });
          wrapper.appendChild(delSiteBtn);

          // Site Drag Events
          wrapper.addEventListener('dragstart', (e) => {
            if (e.target.closest('.moein-site-del-btn')) {
              e.preventDefault();
              return;
            }
            e.stopPropagation(); // Never trigger card drag
            draggedSiteInfo = { sourceBoxId: box.id, siteIndex: index };
            draggedBoxId = null;
            wrapper.classList.add('moein-site-dragging');
            if (e.dataTransfer) {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'moein-site',
                sourceBoxId: box.id,
                siteIndex: index
              }));
            }
          });

          wrapper.addEventListener('dragend', () => {
            wrapper.classList.remove('moein-site-dragging');
            draggedSiteInfo = null;
            lastDragEndTime = Date.now();
            document.querySelectorAll('.moein-site-drag-over').forEach(el => el.classList.remove('moein-site-drag-over'));
            document.querySelectorAll('.moein-drag-over').forEach(el => el.classList.remove('moein-drag-over'));
          });

          wrapper.addEventListener('dragover', (e) => {
            if (draggedSiteInfo) {
              const { sourceBoxId, siteIndex: srcIdx } = draggedSiteInfo;
              if (sourceBoxId !== box.id || srcIdx !== index) {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                wrapper.classList.add('moein-site-drag-over');
              }
            }
          });

          wrapper.addEventListener('dragleave', (e) => {
            if (!wrapper.contains(e.relatedTarget)) {
              wrapper.classList.remove('moein-site-drag-over');
            }
          });

          wrapper.addEventListener('drop', (e) => {
            if (!draggedSiteInfo) return;
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.moein-site-drag-over').forEach(el => el.classList.remove('moein-site-drag-over'));
            document.querySelectorAll('.moein-drag-over').forEach(el => el.classList.remove('moein-drag-over'));

            const { sourceBoxId, siteIndex: srcIdx } = draggedSiteInfo;
            draggedSiteInfo = null;
            lastDragEndTime = Date.now();
            const targetBoxId = box.id;
            const targetIdx = index;

            const sourceBox = currentBoxes.find(b => b.id === sourceBoxId);
            const targetBox = currentBoxes.find(b => b.id === targetBoxId);
            if (!sourceBox || !targetBox) return;

            if (sourceBoxId === targetBoxId) {
              if (srcIdx !== targetIdx) {
                reorderSitesInBox(sourceBox, srcIdx, targetIdx);
                saveBoxes(() => {
                  renderShortcutsGrid();
                });
              }
            } else {
              const movedSite = transferSiteBetweenBoxes(sourceBox, targetBox, srcIdx, targetIdx);
              if (movedSite) {
                saveBoxes(() => {
                  renderShortcutsGrid();
                  showToast(`نشانک «${movedSite.name}» به «${targetBox.title}» منتقل شد.`);
                });
              }
            }
          });

          sitesContainer.appendChild(wrapper);
        });
      }

      boxCard.appendChild(sitesContainer);
      grid.appendChild(boxCard);
    });

    // Add New Window Card (Shown only if current count < MAX_BOXES)
    if (currentBoxes.length < MAX_BOXES) {
      const addCard = document.createElement('div');
      addCard.className = 'moein-add-card';
      addCard.title = `افزودن پنجره جدید (${currentBoxes.length} از ${MAX_BOXES})`;

      addCard.innerHTML = `
        <div class="moein-add-card-icon">${plusIconSvg}</div>
        <span class="moein-add-card-text">افزودن پنجره جدید</span>
        <span style="font-size: 10px; opacity: 0.7;">${currentBoxes.length} از ${MAX_BOXES} پنجره</span>
      `;

      addCard.addEventListener('dragover', (e) => {
        if (draggedBoxId) {
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
          addCard.classList.add('moein-drag-over');
        }
      });

      addCard.addEventListener('dragleave', (e) => {
        if (!addCard.contains(e.relatedTarget)) {
          addCard.classList.remove('moein-drag-over');
        }
      });

      addCard.addEventListener('drop', (e) => {
        if (draggedBoxId) {
          e.preventDefault();
          e.stopPropagation();
          addCard.classList.remove('moein-drag-over');
          document.querySelectorAll('.moein-drag-over').forEach(el => el.classList.remove('moein-drag-over'));
          const sourceIdx = currentBoxes.findIndex(b => b.id === draggedBoxId);
          const targetIdx = currentBoxes.length - 1;
          draggedBoxId = null;
          boxDragInitiatorCard = null;
          lastDragEndTime = Date.now();
          if (sourceIdx !== -1 && sourceIdx !== targetIdx) {
            const movedBoxTitle = currentBoxes[sourceIdx].title;
            reorderBoxes(currentBoxes, sourceIdx, targetIdx);
            saveBoxes(() => {
              renderShortcutsGrid();
              showToast(`پنجره «${movedBoxTitle}» به انتهای پنجره‌ها منتقل شد.`);
            });
          }
        }
      });

      addCard.addEventListener('click', openAddFolderModal);
      grid.appendChild(addCard);
    }
  };

  // Offline & Auto-Reconnection Management
  const MAX_OFFLINE_ATTEMPTS = 25;
  let offlineAttempts = 0;
  let offlineCheckInterval = null;

  const checkConnectivity = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      await fetch('https://www.google.com/generate_204?t=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        mode: 'no-cors',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return true;
    } catch (e) {
      return false;
    }
  };

  const redirectToGoogle = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.getCurrent) {
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
  };

  const startOfflineReconnectionChecker = (onSuccess = redirectToGoogle) => {
    if (offlineCheckInterval) return;
    offlineAttempts = 0;

    offlineCheckInterval = setInterval(async () => {
      if (offlineAttempts >= MAX_OFFLINE_ATTEMPTS) {
        clearInterval(offlineCheckInterval);
        offlineCheckInterval = null;
        return;
      }

      offlineAttempts++;

      const isConnected = await checkConnectivity();
      if (isConnected) {
        clearInterval(offlineCheckInterval);
        offlineCheckInterval = null;
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      } else if (offlineAttempts >= MAX_OFFLINE_ATTEMPTS) {
        // Stop checking strictly after reaching maximum attempt limit (25 attempts) without altering UI
        clearInterval(offlineCheckInterval);
        offlineCheckInterval = null;
      }
    }, 2000);
  };

  // Google Homepage Layout Customizations
  const applyCustomizations = () => {
    if (!isHomePage()) return;
    if (!document.body) return;
    if (window !== window.top && !window.__TAB_MOEIN_TEST__) return;

    document.body.classList.add('moein-tab-active');

    const isOfflineMode = !navigator.onLine || location.search.includes('offline') || window.__TAB_MOEIN_OFFLINE__ || (location.protocol === 'chrome-extension:' && !window.__TAB_MOEIN_TEST__);

    // 1. Hide footer
    document.querySelectorAll('div[role="contentinfo"], footer, .Ij8KCd, #footer').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });

    // 2. Hide Google offered in English
    const lang = document.getElementById('SIvCob');
    if (lang) lang.style.setProperty('display', 'none', 'important');

    // 3. Hide Search buttons under search box
    document.querySelectorAll('.FPdoLc, div[jsname="VlcAae"]').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });

    // 4. Assemble 2x2 Nav Grid
    let navGrid = document.getElementById('moein-nav-grid');
    const gb = document.getElementById('gb');

    if (!navGrid && gb) {
      const ogbl = gb.querySelector('[data-ogbl]');
      const gbwa = document.getElementById('gbwa');
      const avatar = gb.querySelector('[data-ogsr-up]') ||
                     gb.querySelector('a[href*="myaccount.google.com"]')?.closest('.gb_L, .gb_z, .gb_A, .gb_d, div') ||
                     gb.querySelector('a[href*="accounts.google.com"]')?.closest('.gb_L, .gb_z, .gb_A, .gb_d, div');

      if (ogbl && gbwa && avatar) {
        navGrid = document.createElement('div');
        navGrid.id = 'moein-nav-grid';

        // Row 1: 9-dots and Avatar
        navGrid.appendChild(gbwa);
        navGrid.appendChild(avatar);

        // Row 2: Gmail and Images
        while (ogbl.children.length > 0) {
          navGrid.appendChild(ogbl.children[0]);
        }

        if (ogbl) ogbl.style.display = 'none';
      }
    }

    // 5. Find Logo Element (SVG or IMG)
    const logoEl = document.querySelector('svg.ESTs9d') ||
                   document.querySelector('svg[aria-label="Google"]') ||
                   document.querySelector('img[alt="Google"]') ||
                   document.querySelector('#hplogo') ||
                   document.querySelector('.k1zIA');

    const searchForm = document.querySelector('form[action="/search"]') ||
                       document.querySelector('form[role="search"]');

    // 6. Assemble the Single Unified Bar
    if (!document.getElementById('moein-unified-bar')) {
      if (navGrid && logoEl && searchForm && !isOfflineMode) {
        const bar = document.createElement('div');
        bar.id = 'moein-unified-bar';

        // Slot 1 (Right in RTL): Google Logo
        const logoSlot = document.createElement('div');
        logoSlot.id = 'moein-bar-logo';
        logoSlot.appendChild(logoEl);
        bar.appendChild(logoSlot);

        // Slot 2 (Center in RTL): Search Bar
        const searchSlot = document.createElement('div');
        searchSlot.id = 'moein-bar-search';
        searchSlot.appendChild(searchForm);
        bar.appendChild(searchSlot);

        // Slot 3 (Left in RTL): 4 Buttons in 2x2 grid
        const navSlot = document.createElement('div');
        navSlot.id = 'moein-bar-nav';
        navSlot.appendChild(navGrid);
        bar.appendChild(navSlot);

        // Insert at the top of the body
        document.body.insertBefore(bar, document.body.firstChild);

        // Clean up original containers
        if (gb) gb.style.display = 'none';
        document.querySelectorAll('.k1zIA').forEach(el => el.style.display = 'none');
      } else if (isOfflineMode || !searchForm) {
        // Offline / Extension Page Unified Bar
        const bar = document.createElement('div');
        bar.id = 'moein-unified-bar';
        bar.classList.add('moein-offline-mode');

        // Slot 1: Google Logo
        const logoSlot = document.createElement('div');
        logoSlot.id = 'moein-bar-logo';
        if (logoEl) {
          logoSlot.appendChild(logoEl);
        } else {
          logoSlot.innerHTML = googleLogoSvg;
        }
        bar.appendChild(logoSlot);

        // Slot 2: English Offline Message Banner
        const searchSlot = document.createElement('div');
        searchSlot.id = 'moein-bar-search';
        const offlineBanner = document.createElement('div');
        offlineBanner.className = 'moein-offline-banner';
        offlineBanner.setAttribute('role', 'status');
        offlineBanner.setAttribute('aria-label', 'No internet connection');
        offlineBanner.innerHTML = `${wifiOffIconSvg}<span class="moein-offline-text">No internet connection</span>`;
        offlineBanner.style.cursor = 'pointer';
        offlineBanner.title = 'Click to check connection';
        offlineBanner.addEventListener('click', async () => {
          const isConnected = await checkConnectivity();
          if (isConnected) redirectToGoogle();
        });
        searchSlot.appendChild(offlineBanner);
        bar.appendChild(searchSlot);

        // Slot 3: Balanced nav slot placeholder
        const navSlot = document.createElement('div');
        navSlot.id = 'moein-bar-nav';
        if (navGrid) {
          navSlot.appendChild(navGrid);
        } else {
          navSlot.innerHTML = `<div class="moein-nav-grid-placeholder"></div>`;
        }
        bar.appendChild(navSlot);

        // Insert at the top of the body
        document.body.insertBefore(bar, document.body.firstChild);

        if (gb) gb.style.display = 'none';
        document.querySelectorAll('.k1zIA').forEach(el => el.style.display = 'none');

        // Start 2-second reconnect interval
        startOfflineReconnectionChecker(redirectToGoogle);
      }
    }

    // 7. Assemble 2x5 Shortcuts Grid Container
    const currentBar = document.getElementById('moein-unified-bar');
    if (currentBar && !document.getElementById('moein-shortcuts-grid')) {
      const grid = document.createElement('div');
      grid.id = 'moein-shortcuts-grid';
      currentBar.parentNode.insertBefore(grid, currentBar.nextSibling);

      if (isStorageInitialized) {
        renderShortcutsGrid();
      } else {
        loadBoxesFromStorage(() => {
          renderShortcutsGrid();
        });
      }
    }
  };

  // Initial load
  loadBoxesFromStorage(() => {
    applyCustomizations();
  });

  document.addEventListener('DOMContentLoaded', applyCustomizations);
  window.addEventListener('load', applyCustomizations);

  // MutationObserver to ensure elements stay injected without rebuilding grid unnecessarily
  const observer = new MutationObserver(() => {
    applyCustomizations();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Global safety cleanup for card dragging if mouseup happens outside
  window.addEventListener('mouseup', () => {
    if (!draggedBoxId) {
      if (boxDragInitiatorCard) {
        boxDragInitiatorCard.setAttribute('draggable', 'false');
        boxDragInitiatorCard = null;
      }
      document.querySelectorAll('.moein-box-card[draggable="true"]').forEach(card => {
        card.setAttribute('draggable', 'false');
      });
    }
  });

  // Real-time online/offline event listeners
  window.addEventListener('offline', () => {
    const searchSlot = document.getElementById('moein-bar-search');
    if (searchSlot && !searchSlot.querySelector('.moein-offline-banner')) {
      const form = searchSlot.querySelector('form');
      if (form) form.style.display = 'none';
      const offlineBanner = document.createElement('div');
      offlineBanner.className = 'moein-offline-banner';
      offlineBanner.setAttribute('role', 'status');
      offlineBanner.setAttribute('aria-label', 'No internet connection');
      offlineBanner.innerHTML = `${wifiOffIconSvg}<span class="moein-offline-text">No internet connection</span>`;
      offlineBanner.style.cursor = 'pointer';
      offlineBanner.title = 'Click to check connection';
      offlineBanner.addEventListener('click', async () => {
        const isConnected = await checkConnectivity();
        if (isConnected) {
          offlineBanner.remove();
          if (form) form.style.display = '';
        }
      });
      searchSlot.appendChild(offlineBanner);

      startOfflineReconnectionChecker(() => {
        offlineBanner.remove();
        if (form) form.style.display = '';
      });
    }
  });

  window.addEventListener('online', async () => {
    if (offlineAttempts < MAX_OFFLINE_ATTEMPTS) {
      const isConnected = await checkConnectivity();
      if (isConnected) {
        if (offlineCheckInterval) {
          clearInterval(offlineCheckInterval);
          offlineCheckInterval = null;
        }
        if (location.protocol === 'chrome-extension:') {
          redirectToGoogle();
        } else {
          const searchSlot = document.getElementById('moein-bar-search');
          if (searchSlot) {
            const banner = searchSlot.querySelector('.moein-offline-banner');
            if (banner) banner.remove();
            const form = searchSlot.querySelector('form');
            if (form) form.style.display = '';
          }
        }
      }
    }
  });

  // Test Harness Export
  if (window.__TAB_MOEIN_TEST__) {
    window.__TAB_MOEIN_LOGIC__ = {
      reorderBoxes,
      reorderSitesInBox,
      transferSiteBetweenBoxes,
      extractDomain,
      sanitizeUrl,
      flattenChromeBookmarkFolders,
      getCurrentBoxes: () => currentBoxes,
      setCurrentBoxes: (b) => { currentBoxes = b; },
      renderShortcutsGrid,
      saveBoxes,
      hslToRgb,
      openColorPickerPopover,
      closeColorPicker,
      checkConnectivity,
      startOfflineReconnectionChecker,
      MAX_OFFLINE_ATTEMPTS,
      getOfflineAttempts: () => offlineAttempts,
      setOfflineAttempts: (n) => { offlineAttempts = n; },
      clearOfflineCheckInterval: () => {
        if (offlineCheckInterval) {
          clearInterval(offlineCheckInterval);
          offlineCheckInterval = null;
        }
      }
    };
  }
})();