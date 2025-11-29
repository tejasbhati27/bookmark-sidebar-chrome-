import { StorageData, Bookmark, DEFAULT_CATEGORIES } from './types';
import { generateId, getHostname, getFaviconUrl } from './utils';

// Fix: Declare chrome to avoid TypeScript errors when @types/chrome is missing
declare var chrome: any;

const STORAGE_KEY = 'visual_stash_data';

// Enable the side panel to open when the action button is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error: any) => console.error(error));

// --- Helper Functions ---

const resolveUrlAndTitle = async (url: string, title: string): Promise<{ url: string, title: string }> => {
  try {
    // 1. Resolve URL (follow redirects)
    // We use HEAD request to follow redirects without downloading body
    const response = await fetch(url, { method: 'HEAD' });
    const finalUrl = response.url;

    // 2. If title is generic, missing, or same as URL, try to fetch page to get title
    let finalTitle = title;
    const isGenericTitle = !title || title === url || title === 'Saved Link' || title.includes('t.co') || title.includes('http');

    if (isGenericTitle) {
      try {
        const pageResponse = await fetch(finalUrl);
        const text = await pageResponse.text();
        // Service Workers don't have DOMParser, use Regex
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          finalTitle = titleMatch[1].trim();
          // Decode HTML entities if simple ones exist (basic check)
          finalTitle = finalTitle.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
        }
      } catch (err) {
        console.warn("Failed to fetch page title:", err);
      }
    }

    return { url: finalUrl, title: finalTitle };
  } catch (e) {
    console.error("Failed to resolve URL:", e);
    return { url, title };
  }
};

const saveBookmark = async (url: string, title: string, category: string) => {
  if (!url) return;

  try {
    // Notify user we are processing (Yellow badge)
    await chrome.action.setBadgeText({ text: '...' });
    await chrome.action.setBadgeBackgroundColor({ color: '#eab308' });

    // Resolve URL and Title (especially for t.co links)
    const { url: finalUrl, title: finalTitle } = await resolveUrlAndTitle(url, title);

    const result = await chrome.storage.local.get([STORAGE_KEY]);
    const data: StorageData = result[STORAGE_KEY] || {
      categories: DEFAULT_CATEGORIES,
      bookmarks: [],
      secretPassword: '1234',
      secretCategoryName: 'Secret',
      categoryUsage: {}
    };

    // Check for duplicates
    const exists = data.bookmarks.some((b: Bookmark) => b.url === finalUrl && b.category === category);
    if (exists) {
      await chrome.action.setBadgeText({ text: 'DUP' });
      setTimeout(() => chrome.action.setBadgeText({ text: '' }), 1500);
      return;
    }

    // Create Bookmark
    const newBookmark: Bookmark = {
      id: generateId(),
      url: finalUrl,
      title: finalTitle || finalUrl, // Fallback to URL if title is still empty
      hostname: getHostname(finalUrl),
      favicon: getFaviconUrl(finalUrl),
      category: category,
      createdAt: Date.now()
    };

    // Update Usage
    const updatedUsage = { ...(data.categoryUsage || {}) };
    updatedUsage[category] = Date.now();

    // Save
    const updatedBookmarks = [newBookmark, ...data.bookmarks];
    const updatedData = {
      ...data,
      bookmarks: updatedBookmarks,
      lastSavedCategory: category,
      categoryUsage: updatedUsage
    };

    await chrome.storage.local.set({ [STORAGE_KEY]: updatedData });

    // Update Context Menus to reflect new usage order
    await updateContextMenus();

    // Success Feedback
    await chrome.action.setBadgeText({ text: 'OK' });
    await chrome.action.setBadgeBackgroundColor({ color: '#22c55e' }); // Green
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 1500);

  } catch (error) {
    console.error('Save Failed:', error);
    await chrome.action.setBadgeText({ text: 'ERR' });
    await chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }); // Red
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 1500);
  }
};

const updateContextMenus = async () => {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    const data: StorageData = result[STORAGE_KEY] || { categories: DEFAULT_CATEGORIES, categoryUsage: {} };
    const categories = data.categories || DEFAULT_CATEGORIES;
    const usage = data.categoryUsage || {};

    // Sort categories by usage (most recent first), then by index in original list
    const sortedCategories = [...categories].sort((a, b) => {
      const timeA = usage[a] || 0;
      const timeB = usage[b] || 0;
      if (timeA !== timeB) {
        return timeB - timeA; // Descending order of usage
      }
      return categories.indexOf(a) - categories.indexOf(b); // Stable sort fallback
    });

    chrome.contextMenus.removeAll(() => {
      // Parent Item
      chrome.contextMenus.create({
        id: "visual-stash-root",
        title: "Save to VisualStash",
        contexts: ["page", "selection", "link", "image"]
      });

      // Sub-menus
      sortedCategories.forEach((category) => {
        // Use custom name for Secret category if available
        let title = category;
        if (category === 'Secret' && data.secretCategoryName) {
          title = data.secretCategoryName;
        }

        chrome.contextMenus.create({
          id: `save-to-${category}`,
          parentId: "visual-stash-root",
          title: title,
          contexts: ["page", "selection", "link", "image"]
        });
      });
    });
  } catch (error) {
    console.error("Failed to update context menus:", error);
  }
};

// --- Event Listeners ---

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info: any, tab: any) => {
  if (info.menuItemId.startsWith('save-to-')) {
    const category = info.menuItemId.replace('save-to-', '');

    let urlToSave = tab.url;
    let titleToSave = tab.title;

    // Check if a link was clicked
    if (info.linkUrl) {
      urlToSave = info.linkUrl;
      // Try to use selection text as title, otherwise fallback to hostname or generic
      titleToSave = info.selectionText || getHostname(info.linkUrl) || "Saved Link";
    }

    await saveBookmark(urlToSave, titleToSave, category);
  }
});

// Handle Keyboard Shortcuts
chrome.commands.onCommand.addListener(async (command: string) => {
  if (command === 'save-to-last') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const result = await chrome.storage.local.get([STORAGE_KEY]);
    const data = result[STORAGE_KEY] || {};
    let targetCategory = data.lastSavedCategory || 'Inbox';

    // Ensure target category actually exists
    if (data.categories && !data.categories.includes(targetCategory)) {
      targetCategory = 'Inbox';
    }

    await saveBookmark(tab.url, tab.title, targetCategory);
  }
});

// Initialize on Install/Startup
chrome.runtime.onInstalled.addListener(() => {
  console.log("VisualStash installed");
  updateContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  updateContextMenus();
});

// Listen for storage changes to update context menus if categories change
chrome.storage.onChanged.addListener((changes: any, namespace: string) => {
  if (namespace === 'local' && changes[STORAGE_KEY]) {
    // We only need to update if categories changed, but checking deep equality is hard, 
    // and updateContextMenus is cheap enough to run on every save.
    // However, saveBookmark already calls updateContextMenus, so we might double call.
    // Let's rely on saveBookmark and explicit updates from the app for now.
    // But if the user changes categories in the UI, we need to reflect that.
    // So let's run it.
    updateContextMenus();
  }
});