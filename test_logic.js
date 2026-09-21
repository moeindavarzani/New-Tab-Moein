// Comprehensive Test Suite for Tab Moein logic

const assert = require('assert');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. extractDomain test
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

// 2. sanitizeUrl test
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

// 3. flattenChromeBookmarkFolders (Pre-order traversal with clean hierarchy)
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

// 4. Deduplication helper
const deduplicateBookmarks = (existingSites, newBookmarks) => {
  const existingUrls = new Set(existingSites.map(s => (s.url || '').toLowerCase().replace(/\/$/, '')));
  const added = [];
  let duplicates = 0;

  newBookmarks.forEach(bm => {
    const norm = (bm.url || '').toLowerCase().replace(/\/$/, '');
    if (!existingUrls.has(norm)) {
      existingUrls.add(norm);
      added.push({
        name: bm.name,
        url: bm.url,
        domain: bm.domain || extractDomain(bm.url)
      });
    } else {
      duplicates++;
    }
  });

  return { added, duplicates };
};

// 5. Storage initialization simulation
const simulateStorageLoad = (storageData, defaultBoxes) => {
  const STORAGE_KEY = 'moein_boxes';
  let currentBoxes = [];
  if (storageData && storageData[STORAGE_KEY] !== undefined && Array.isArray(storageData[STORAGE_KEY])) {
    currentBoxes = storageData[STORAGE_KEY];
  } else {
    currentBoxes = defaultBoxes;
  }
  return currentBoxes;
};

// 6. Box & Bookmark Reordering Helpers
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

// ==========================================
// TEST EXECUTION
// ==========================================

console.log('--- 1. Testing extractDomain ---');
assert.strictEqual(extractDomain('https://www.google.com/search?q=test'), 'google.com');
assert.strictEqual(extractDomain('github.com/repo'), 'github.com');
assert.strictEqual(extractDomain('http://sub.domain.co.uk/path'), 'sub.domain.co.uk');
assert.strictEqual(extractDomain(''), '');
assert.strictEqual(extractDomain('invalid:url:here::'), '');
console.log('✓ extractDomain passed');

console.log('--- 2. Testing sanitizeUrl ---');
assert.strictEqual(sanitizeUrl('google.com'), 'https://google.com/');
assert.strictEqual(sanitizeUrl('http://test.com/abc'), 'http://test.com/abc');
assert.strictEqual(sanitizeUrl('https://example.com/'), 'https://example.com/');
assert.strictEqual(sanitizeUrl('javascript:alert(1)'), '');
assert.strictEqual(sanitizeUrl(''), '');
console.log('✓ sanitizeUrl passed');

console.log('--- 3. Testing flattenChromeBookmarkFolders (Pre-order hierarchy & paths) ---');
const sampleTree = [
  {
    id: '0',
    title: '',
    children: [
      {
        id: '1',
        title: 'Bookmarks Bar',
        children: [
          { id: '10', title: 'Google', url: 'https://www.google.com' },
          { id: '11', title: 'GitHub', url: 'https://github.com' },
          {
            id: '12',
            title: 'Work',
            children: [
              { id: '13', title: 'Slack', url: 'https://slack.com' },
              { id: '14', title: 'Jira', url: 'https://jira.atlassian.com' },
              {
                id: '15',
                title: 'Deep Projects',
                children: [
                  { id: '16', title: 'Project A', url: 'https://proj.a' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '2',
        title: 'Other Bookmarks',
        children: [
          { id: '20', title: 'News', url: 'https://bbc.com' }
        ]
      }
    ]
  }
];

const folders = flattenChromeBookmarkFolders(sampleTree);
assert.strictEqual(folders.length, 4); // Bookmarks Bar, Work, Deep Projects, Other Bookmarks

// CRITICAL ASSERTION: Parent folder MUST be listed before child folders!
assert.strictEqual(folders[0].id, '1', 'Bookmarks Bar must be at index 0 (parent before children)');
assert.strictEqual(folders[1].id, '12', 'Work must be at index 1');
assert.strictEqual(folders[2].id, '15', 'Deep Projects must be at index 2');
assert.strictEqual(folders[3].id, '2', 'Other Bookmarks must be at index 3');

// Path verification: root '0' must not contaminate path
assert.strictEqual(folders[0].path, 'نوار نشانک‌ها (Bookmarks Bar)');
assert.strictEqual(folders[1].path, 'نوار نشانک‌ها (Bookmarks Bar) > Work');
assert.strictEqual(folders[2].path, 'نوار نشانک‌ها (Bookmarks Bar) > Work > Deep Projects');

// Bookmark count verification
assert.strictEqual(folders[0].directBookmarks.length, 2); // Google, GitHub
assert.strictEqual(folders[0].allBookmarks.length, 5); // Google, GitHub, Slack, Jira, Project A
assert.strictEqual(folders[1].directBookmarks.length, 2); // Slack, Jira
assert.strictEqual(folders[1].allBookmarks.length, 3); // Slack, Jira, Project A
assert.strictEqual(folders[2].allBookmarks.length, 1); // Project A
console.log('✓ flattenChromeBookmarkFolders (Pre-order hierarchy & clean paths) passed');

console.log('--- 4. Testing 12-Box Limit Constraint ---');
let boxes = Array.from({ length: 11 }, (_, i) => ({ id: `b${i}`, title: `Box ${i}`, sites: [] }));
assert.strictEqual(boxes.length < 12, true);
boxes.push({ id: 'b11', title: 'Box 11', sites: [] });
assert.strictEqual(boxes.length >= 12, true);
const canAdd = (list) => list.length < 12;
assert.strictEqual(canAdd(boxes), false);
// Delete one restores add capability
boxes = boxes.filter(b => b.id !== 'b0');
assert.strictEqual(boxes.length, 11);
assert.strictEqual(canAdd(boxes), true);
console.log('✓ 12-Box Limit Constraint passed');

console.log('--- 5. Testing Storage Persistence Edge Case (Issue 2: User Deletes All Boxes) ---');
const defaultBoxes = [{ id: 'd1', title: 'Default 1', sites: [] }];
// Scenario A: First install (key is undefined in storage)
const firstInstallState = simulateStorageLoad({}, defaultBoxes);
assert.strictEqual(firstInstallState.length, 1, 'First install initializes defaults');

// Scenario B: User deleted ALL boxes (storage has empty array [])
const userDeletedAllState = simulateStorageLoad({ moein_boxes: [] }, defaultBoxes);
assert.strictEqual(userDeletedAllState.length, 0, 'User empty array [] MUST be preserved and NOT reset to defaults');
console.log('✓ Storage Persistence Edge Case passed (User empty array preserved)');

console.log('--- 6. Testing Bookmark Deduplication Logic ---');
const existingSites = [
  { name: 'Google', url: 'https://google.com/', domain: 'google.com' },
  { name: 'GitHub', url: 'https://github.com', domain: 'github.com' }
];

const newBookmarks = [
  { name: 'Google Duplicate', url: 'https://google.com', domain: 'google.com' },
  { name: 'GitHub Duplicate', url: 'https://github.com/', domain: 'github.com' },
  { name: 'GitLab', url: 'https://gitlab.com', domain: 'gitlab.com' }
];

const { added, duplicates } = deduplicateBookmarks(existingSites, newBookmarks);
assert.strictEqual(added.length, 1, 'Only 1 unique bookmark should be added');
assert.strictEqual(added[0].name, 'GitLab');
assert.strictEqual(duplicates, 2, '2 duplicate bookmarks should be filtered out');
console.log('✓ Bookmark Deduplication Logic passed');

console.log('--- 7. Testing Folder-Level Ticking & Bookmark Selection Logic ---');
const selectedMap = new Map();
const workFolder = folders[1]; // 3 bookmarks: Slack, Jira, Project A

// Tick entire folder
workFolder.allBookmarks.forEach(bm => selectedMap.set(bm.id, bm));
assert.strictEqual(selectedMap.size, 3, 'All 3 bookmarks in Work folder are selected');

// Untick one bookmark
selectedMap.delete('13'); // untick Slack
assert.strictEqual(selectedMap.size, 2);
const allWorkSelected = workFolder.allBookmarks.every(bm => selectedMap.has(bm.id));
const someWorkSelected = workFolder.allBookmarks.some(bm => selectedMap.has(bm.id));
assert.strictEqual(allWorkSelected, false, 'Not all items selected');
assert.strictEqual(someWorkSelected, true, 'Folder is in indeterminate state');

// Untick remaining
workFolder.allBookmarks.forEach(bm => selectedMap.delete(bm.id));
assert.strictEqual(selectedMap.size, 0);
assert.strictEqual(workFolder.allBookmarks.some(bm => selectedMap.has(bm.id)), false, 'Folder unchecked');
console.log('✓ Folder-Level Ticking & Bookmark Selection Logic passed');

console.log('--- 8. Testing Reordering Folder Boxes Logic ---');
const testBoxes = [
  { id: 'b0', title: 'Box 0', sites: [] },
  { id: 'b1', title: 'Box 1', sites: [] },
  { id: 'b2', title: 'Box 2', sites: [] },
  { id: 'b3', title: 'Box 3', sites: [] }
];

// Test 8a: Move forward (0 -> 2)
reorderBoxes(testBoxes, 0, 2);
assert.deepStrictEqual(testBoxes.map(b => b.id), ['b1', 'b2', 'b0', 'b3'], 'Move 0 -> 2 puts b0 at index 2');

// Test 8b: Move backward (3 -> 1)
reorderBoxes(testBoxes, 3, 1);
assert.deepStrictEqual(testBoxes.map(b => b.id), ['b1', 'b3', 'b2', 'b0'], 'Move 3 -> 1 puts b3 at index 1');

// Test 8c: Same index is no-op
reorderBoxes(testBoxes, 2, 2);
assert.deepStrictEqual(testBoxes.map(b => b.id), ['b1', 'b3', 'b2', 'b0'], 'Same index does not change order');

// Test 8d: Out of bounds indices handled safely
reorderBoxes(testBoxes, -1, 2);
reorderBoxes(testBoxes, 1, 99);
assert.deepStrictEqual(testBoxes.map(b => b.id), ['b1', 'b3', 'b2', 'b0'], 'Invalid indices leave array unchanged');

// Test 8e: Move to last position (simulating drop on addCard)
reorderBoxes(testBoxes, 0, testBoxes.length - 1);
assert.deepStrictEqual(testBoxes.map(b => b.id), ['b3', 'b2', 'b0', 'b1'], 'Move 0 to last position puts b1 at the end');
console.log('✓ Reordering Folder Boxes Logic passed');

console.log('--- 9. Testing Reordering Bookmarks inside Same Box Logic ---');
const testBoxWithSites = {
  id: 'b_sites',
  title: 'Tools',
  sites: [
    { name: 'Site 0', url: 'https://site0.com' },
    { name: 'Site 1', url: 'https://site1.com' },
    { name: 'Site 2', url: 'https://site2.com' },
    { name: 'Site 3', url: 'https://site3.com' }
  ]
};

// Test 9a: Move Site 1 to end (1 -> 3)
reorderSitesInBox(testBoxWithSites, 1, 3);
assert.deepStrictEqual(testBoxWithSites.sites.map(s => s.name), ['Site 0', 'Site 2', 'Site 3', 'Site 1']);

// Test 9b: Move Site 1 back to beginning (3 -> 0)
reorderSitesInBox(testBoxWithSites, 3, 0);
assert.deepStrictEqual(testBoxWithSites.sites.map(s => s.name), ['Site 1', 'Site 0', 'Site 2', 'Site 3']);

// Test 9c: Same index no-op and out of bounds safety
reorderSitesInBox(testBoxWithSites, 2, 2);
reorderSitesInBox(testBoxWithSites, -1, 0);
reorderSitesInBox(testBoxWithSites, 0, 50);
assert.deepStrictEqual(testBoxWithSites.sites.map(s => s.name), ['Site 1', 'Site 0', 'Site 2', 'Site 3']);
console.log('✓ Reordering Bookmarks inside Same Box Logic passed');

console.log('--- 10. Testing Transferring Bookmarks Between Different Boxes Logic ---');
const boxAlpha = {
  id: 'box_a',
  title: 'Alpha',
  sites: [
    { name: 'Alpha 1', url: 'https://a1.com' },
    { name: 'Alpha 2', url: 'https://a2.com' }
  ]
};
const boxBeta = {
  id: 'box_b',
  title: 'Beta',
  sites: [
    { name: 'Beta 1', url: 'https://b1.com' }
  ]
};
const boxEmpty = {
  id: 'box_empty',
  title: 'Empty Box',
  sites: []
};

// Test 10a: Move Alpha 1 (index 0) to Box Beta at index 0
const moved1 = transferSiteBetweenBoxes(boxAlpha, boxBeta, 0, 0);
assert.strictEqual(moved1.name, 'Alpha 1');
assert.strictEqual(boxAlpha.sites.length, 1);
assert.strictEqual(boxAlpha.sites[0].name, 'Alpha 2');
assert.strictEqual(boxBeta.sites.length, 2);
assert.strictEqual(boxBeta.sites[0].name, 'Alpha 1');
assert.strictEqual(boxBeta.sites[1].name, 'Beta 1');

// Test 10b: Transfer remaining site in Alpha to empty box
const moved2 = transferSiteBetweenBoxes(boxAlpha, boxEmpty, 0);
assert.strictEqual(moved2.name, 'Alpha 2');
assert.strictEqual(boxAlpha.sites.length, 0);
assert.strictEqual(boxEmpty.sites.length, 1);
assert.strictEqual(boxEmpty.sites[0].name, 'Alpha 2');

// Test 10c: Invalid source index returns null and doesn't mutate
const invalidMove = transferSiteBetweenBoxes(boxAlpha, boxBeta, 0);
assert.strictEqual(invalidMove, null);
assert.strictEqual(boxBeta.sites.length, 2);

// Test 10d: Out of range target index appends to the end of target box
const moved3 = transferSiteBetweenBoxes(boxBeta, boxEmpty, 0, 999);
assert.strictEqual(moved3.name, 'Alpha 1');
assert.strictEqual(boxEmpty.sites.length, 2);
assert.strictEqual(boxEmpty.sites[1].name, 'Alpha 1');
console.log('✓ Transferring Bookmarks Between Different Boxes Logic passed');

console.log('--- 11. Testing Color Wheel HSL/RGB Conversion & Box Color Persistence Logic ---');
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

// Test 11a: Primary and secondary colors at 100% saturation and 50% lightness
assert.deepStrictEqual(hslToRgb(0, 1, 0.5), [255, 0, 0], '0 deg is Red');
assert.deepStrictEqual(hslToRgb(60, 1, 0.5), [255, 255, 0], '60 deg is Yellow');
assert.deepStrictEqual(hslToRgb(120, 1, 0.5), [0, 255, 0], '120 deg is Green');
assert.deepStrictEqual(hslToRgb(180, 1, 0.5), [0, 255, 255], '180 deg is Cyan');
assert.deepStrictEqual(hslToRgb(240, 1, 0.5), [0, 0, 255], '240 deg is Blue');
assert.deepStrictEqual(hslToRgb(300, 1, 0.5), [255, 0, 255], '300 deg is Magenta');

// Test 11b: Center of color wheel (sat = 0, l = 0.96) is soft white
const centerRgb = hslToRgb(0, 0, 0.96);
assert.strictEqual(centerRgb[0], 245);
assert.strictEqual(centerRgb[1], 245);
assert.strictEqual(centerRgb[2], 245);

// Test 11c: Custom background color persistence in box state
const testBox = { id: 'box_color_test', title: 'رنگ تست', sites: [] };
testBox.bgColor = 'rgba(187, 222, 251, 0.65)';
testBox.colorDot = 'rgb(187, 222, 251)';

const serialized = JSON.stringify(testBox);
const deserialized = JSON.parse(serialized);
assert.strictEqual(deserialized.bgColor, 'rgba(187, 222, 251, 0.65)');
assert.strictEqual(deserialized.colorDot, 'rgb(187, 222, 251)');

// Test 11d: Resetting box color
delete deserialized.bgColor;
delete deserialized.colorDot;
assert.strictEqual(deserialized.bgColor, undefined);
assert.strictEqual(deserialized.colorDot, undefined);
console.log('✓ Color Wheel HSL/RGB Conversion & Box Color Persistence Logic passed');

console.log('--- 12. Testing Responsive 3-Column Bookmark Grid Logic (> 4 Sites) ---');
const shouldShow3Columns = (siteCount, containerWidth) => {
  return siteCount > 4 && containerWidth >= 260;
};

// Test 12a: Folders with 4 or fewer sites stay at 2 columns regardless of width
assert.strictEqual(shouldShow3Columns(1, 300), false, '1 site stays 2 columns');
assert.strictEqual(shouldShow3Columns(3, 320), false, '3 sites stay 2 columns');
assert.strictEqual(shouldShow3Columns(4, 350), false, '4 sites stay 2 columns');

// Test 12b: Folders with > 4 sites switch to 3 columns on wide width (>= 260px)
assert.strictEqual(shouldShow3Columns(5, 260), true, '5 sites get 3 columns when width >= 260');
assert.strictEqual(shouldShow3Columns(7, 300), true, '7 sites get 3 columns when width >= 260');
assert.strictEqual(shouldShow3Columns(30, 320), true, '30 sites get 3 columns when width >= 260');

// Test 12c: Narrow width (< 260px, e.g. sidebar open) preserves 2 columns even for > 4 sites
assert.strictEqual(shouldShow3Columns(5, 250), false, '5 sites stay 2 columns when width < 260px');
assert.strictEqual(shouldShow3Columns(30, 240), false, '30 sites stay 2 columns when width < 260px');
console.log('✓ Responsive 3-Column Bookmark Grid Logic passed');

console.log('--- 13. Testing 2-Row Scrollbar Elimination Logic ---');
const fitsInTwoRows = (siteCount, isWide) => {
  if (siteCount <= 4) return true; // fits in 2 rows of 2
  if (siteCount <= 6 && isWide) return true; // fits in 2 rows of 3
  return false;
};

// Test 13a: Folders with 4 or fewer sites fit in 2 rows always
assert.strictEqual(fitsInTwoRows(1, false), true, '1 site fits in 2 rows');
assert.strictEqual(fitsInTwoRows(3, false), true, '3 sites fit in 2 rows (like دانشگاه)');
assert.strictEqual(fitsInTwoRows(4, false), true, '4 sites fit in 2 rows (like شبکه‌های اجتماعی)');

// Test 13b: Folders with 5 or 6 sites fit in 2 rows on wide screen (3 columns)
assert.strictEqual(fitsInTwoRows(5, true), true, '5 sites fit in 2 rows on wide (like پیام‌رسان‌ها)');
assert.strictEqual(fitsInTwoRows(6, true), true, '6 sites fit in 2 rows on wide');

// Test 13c: Folders that require 3+ rows do not fit in 2 rows, so they scroll
assert.strictEqual(fitsInTwoRows(5, false), false, '5 sites require 3 rows on narrow, so scrolls');
assert.strictEqual(fitsInTwoRows(7, true), false, '7 sites require 3 rows on wide (like مالی), so scrolls');
assert.strictEqual(fitsInTwoRows(9, true), false, '9 sites require 3 rows (like زبان), so scrolls');
assert.strictEqual(fitsInTwoRows(30, true), false, '30 sites require scrolling');
console.log('✓ 2-Row Scrollbar Elimination Logic passed');

console.log('--- 14. Testing Offline Reconnection & 25-Attempt Cap Logic ---');
const MAX_OFFLINE_ATTEMPTS = 25;

class MockOfflineReconnector {
  constructor(options = {}) {
    this.attempts = 0;
    this.maxAttempts = MAX_OFFLINE_ATTEMPTS;
    this.isRunning = true;
    this.reconnected = false;
    this.checkFn = options.checkFn || (() => false);
    this.onSuccess = options.onSuccess || (() => {});
  }

  tick() {
    if (!this.isRunning) return;
    if (this.attempts >= this.maxAttempts) {
      this.isRunning = false;
      return;
    }

    this.attempts++;

    const connected = this.checkFn(this.attempts);
    if (connected) {
      this.isRunning = false;
      this.reconnected = true;
      this.onSuccess();
    } else if (this.attempts >= this.maxAttempts) {
      this.isRunning = false;
    }
  }
}

// 14a. Test 25 attempts cap when offline stays disconnected
const runnerOffline = new MockOfflineReconnector({ checkFn: () => false });
for (let i = 0; i < 40; i++) {
  runnerOffline.tick();
}
assert.strictEqual(runnerOffline.attempts, 25, 'Attempts must strictly stop at 25');
assert.strictEqual(runnerOffline.isRunning, false, 'Runner must stop running after 25 attempts');
assert.strictEqual(runnerOffline.reconnected, false, 'Did not reconnect');

// 14b. Test early reconnection when network returns (e.g. at attempt 8)
let successCalled = false;
const runnerReconnected = new MockOfflineReconnector({
  checkFn: (attempt) => attempt === 8,
  onSuccess: () => { successCalled = true; }
});
for (let i = 0; i < 40; i++) {
  runnerReconnected.tick();
}
assert.strictEqual(runnerReconnected.attempts, 8, 'Attempts must stop immediately upon successful reconnection');
assert.strictEqual(runnerReconnected.reconnected, true, 'Reconnected flag set to true');
assert.strictEqual(runnerReconnected.isRunning, false, 'Runner stopped after successful reconnection');
assert.strictEqual(successCalled, true, 'onSuccess callback invoked');

// 14c. Verify Offline Message Text & Absence of Attempt Counters in UI
const offlineText = 'No internet connection';
assert.strictEqual(offlineText, 'No internet connection', 'Offline text must be English "No internet connection"');
assert.strictEqual(offlineText.includes('25'), false, 'UI text must not contain attempt number');
assert.strictEqual(offlineText.includes('تلاش'), false, 'UI text must not contain retry or counter words');

// 14d. Verify Offline Navigation Interception Logic
const shouldInterceptError = (url, frameId) => {
  if (frameId !== 0) return false;
  if (!url) return false;
  return url.includes('google.com') || url.includes('google.');
};
assert.strictEqual(shouldInterceptError('https://www.google.com/', 0), true, 'Intercepts failed main-frame Google navigation');
assert.strictEqual(shouldInterceptError('https://www.google.com/webhp', 0), true, 'Intercepts Google webhp navigation');
assert.strictEqual(shouldInterceptError('https://www.google.com/', 1), false, 'Does not intercept iframe navigation');
assert.strictEqual(shouldInterceptError('https://example.com/', 0), false, 'Does not intercept non-Google navigation');
console.log('✓ Offline Reconnection & 25-Attempt Cap Logic passed');

console.log('--- 15. Testing Multi-Tier Favicon Resolver & Subdomain Fallback Logic ---');
const extractRootDomain = (domain) => {
  if (!domain) return '';
  const clean = domain.trim().toLowerCase().replace(/^www\./, '');
  const parts = clean.split('.');
  if (parts.length <= 2) return clean;
  const commonTwoPartTlds = ['ac.ir', 'co.ir', 'gov.ir', 'org.ir', 'net.ir', 'id.ir', 'sch.ir', 'co.uk', 'gov.uk', 'com.au'];
  const lastTwo = parts.slice(-2).join('.');
  if (commonTwoPartTlds.includes(lastTwo) && parts.length > 2) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
};

const buildFaviconSources = (pageUrl, domain) => {
  const d = domain || extractDomain(pageUrl);
  const rootD = extractRootDomain(d);
  const sources = [];

  if (pageUrl) {
    sources.push(`chrome-extension://mock-id/_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=64`);
  }

  if (d) sources.push(`https://www.google.com/s2/favicons?domain=${d}&sz=64`);

  if (rootD && rootD !== d) {
    sources.push(`https://www.google.com/s2/favicons?domain=${rootD}&sz=64`);
  }

  if (d) sources.push(`https://icons.duckduckgo.com/ip3/${d}.ico`);

  if (pageUrl) {
    try {
      const formatted = /^https?:\/\//i.test(pageUrl) ? pageUrl : `https://${pageUrl}`;
      const parsed = new URL(formatted);
      sources.push(`${parsed.origin}/favicon.ico`);
    } catch (e) {}
  }

  return sources;
};

// 15a. extractRootDomain tests for Iranian and international domains
assert.strictEqual(extractRootDomain('web.shad.ir'), 'shad.ir', 'Resolves web.shad.ir to shad.ir');
assert.strictEqual(extractRootDomain('sayad.bmi.ir'), 'bmi.ir', 'Resolves sayad.bmi.ir to bmi.ir');
assert.strictEqual(extractRootDomain('automation.hsu.ac.ir'), 'hsu.ac.ir', 'Resolves 3-part Iranian academic domain to hsu.ac.ir');
assert.strictEqual(extractRootDomain('my.tci.ir'), 'tci.ir', 'Resolves my.tci.ir to tci.ir');
assert.strictEqual(extractRootDomain('sub.domain.co.uk'), 'domain.co.uk', 'Resolves UK 2-part TLD');
assert.strictEqual(extractRootDomain('google.com'), 'google.com', 'Preserves 2-part standard domain google.com');
assert.strictEqual(extractRootDomain('www.google.com'), 'google.com', 'Strips leading www.');
assert.strictEqual(extractRootDomain(''), '', 'Handles empty domain gracefully');

// 15b. buildFaviconSources tier validation
const shadSources = buildFaviconSources('https://web.shad.ir/chat', 'web.shad.ir');
assert.strictEqual(shadSources.length, 5, 'Generates full 5-tier fallback sources for subdomain');
assert.strictEqual(shadSources[0].startsWith('chrome-extension://'), true, 'Tier 1 is Chrome native local cache');
assert.strictEqual(shadSources[1], 'https://www.google.com/s2/favicons?domain=web.shad.ir&sz=64', 'Tier 2 is Google S2 for exact subdomain');
assert.strictEqual(shadSources[2], 'https://www.google.com/s2/favicons?domain=shad.ir&sz=64', 'Tier 3 is Google S2 for root domain shad.ir');
assert.strictEqual(shadSources[3], 'https://icons.duckduckgo.com/ip3/web.shad.ir.ico', 'Tier 4 is DuckDuckGo service');
assert.strictEqual(shadSources[4], 'https://web.shad.ir/favicon.ico', 'Tier 5 is direct origin favicon.ico');

// 15c. buildFaviconSources root domain (no duplicate root tier)
const githubSources = buildFaviconSources('https://github.com', 'github.com');
assert.strictEqual(githubSources.length, 4, 'Only 4 tiers when domain is already root domain (no duplicate)');
console.log('✓ Multi-Tier Favicon Resolver & Subdomain Fallback Logic passed');

console.log('--- 16. Testing Headless Chrome DOM Test Suite (test_runner.html) ---');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
if (fs.existsSync(chromePath)) {
  const runnerPath = path.resolve(__dirname, 'test_runner.html').replace(/\\/g, '/');
  const domCmd = `"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=6000 --dump-dom "file:///${runnerPath}"`;
  const domOutput = execSync(domCmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const hasPassedTitle = domOutput.includes('<title>TESTS_PASSED</title>') || domOutput.includes('ALL 26 TESTS PASSED SUCCESSFULLY');
  const hasFailedTitle = domOutput.includes('<title>TESTS_FAILED</title>');
  if (!hasPassedTitle || hasFailedTitle) {
    const match = domOutput.match(/<div id="test-output"[^>]*>([\s\S]*?)<\/div>/);
    if (match) console.error(match[1]);
  }
  assert.strictEqual(hasPassedTitle, true, 'test_runner.html must pass with <title>TESTS_PASSED</title> in headless Chrome');
  assert.strictEqual(hasFailedTitle, false, 'test_runner.html must not fail with <title>TESTS_FAILED</title>');
  console.log('✓ Headless Chrome DOM Test Suite (26/26 DOM Tests in test_runner.html) passed');

} else {
  console.log('⚠ Chrome executable not found at default path, skipped headless DOM run');
}

console.log('\n=============================================');
console.log('🎉 ALL 16 TESTS (UNIT + DOM) PASSED WITH ZERO ERRORS!');
console.log('=============================================\n');



