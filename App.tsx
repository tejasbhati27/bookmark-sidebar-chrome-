
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Archive, Save, Loader2, Search, LayoutGrid, List as ListIcon, X, CheckSquare, Trash2, FolderInput, Filter, Moon, Sun, Lock, ShieldCheck, KeyRound, Calendar, HelpCircle } from 'lucide-react';
import CategoryPills from './components/CategoryPills';
import BookmarkCard from './components/BookmarkCard';
import ConfirmationModal from './components/ConfirmationModal';
import EditBookmarkModal from './components/EditBookmarkModal';
import PasswordModal from './components/PasswordModal';
import ShortcutsModal from './components/ShortcutsModal';
import { Bookmark, StorageData, DEFAULT_CATEGORIES, MOCK_BOOKMARKS } from './types';
import { generateId, getHostname, getFaviconUrl, getMonthYear } from './utils';

declare const chrome: any;

const STORAGE_KEY = 'visual_stash_data';
const DEFAULT_PASSWORD = '1234';
const DEFAULT_SECRET_NAME = 'Secret';

const App: React.FC = () => {
  // Data State
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [secretPassword, setSecretPassword] = useState<string>(DEFAULT_PASSWORD);
  const [secretCategoryName, setSecretCategoryName] = useState<string>(DEFAULT_SECRET_NAME);
  const [lastSavedCategory, setLastSavedCategory] = useState<string | null>(null);

  // UI State
  const [activeCategory, setActiveCategory] = useState<string>('Inbox');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Secret Folder State
  const [isSecretUnlocked, setIsSecretUnlocked] = useState(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'url' | 'title'>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // View State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Bulk Selection State
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<Set<string>>(new Set());
  const isSelectionMode = selectedBookmarkIds.size > 0;

  // Modals
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: string | null; isBulk?: boolean }>({
    isOpen: false,
    category: null,
    isBulk: false
  });
  const [editBookmarkModal, setEditBookmarkModal] = useState<{ isOpen: boolean; bookmarkId: string | null }>({
    isOpen: false,
    bookmarkId: null
  });
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; mode: 'unlock' | 'change'; error?: string }>({
    isOpen: false,
    mode: 'unlock'
  });
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const result = await chrome.storage.local.get([STORAGE_KEY, 'viewMode', 'theme']);

          // Load Data
          if (result[STORAGE_KEY]) {
            const data: StorageData = result[STORAGE_KEY];
            setCategories(data.categories || DEFAULT_CATEGORIES);
            setBookmarks(data.bookmarks || []);
            setSecretPassword(data.secretPassword || DEFAULT_PASSWORD);
            setSecretCategoryName(data.secretCategoryName || DEFAULT_SECRET_NAME);
            setLastSavedCategory(data.lastSavedCategory || null);
          } else {
            // First time setup
            await chrome.storage.local.set({
              [STORAGE_KEY]: {
                categories: DEFAULT_CATEGORIES,
                bookmarks: [],
                secretPassword: DEFAULT_PASSWORD,
                secretCategoryName: DEFAULT_SECRET_NAME,
                lastSavedCategory: null
              }
            });
          }

          // Load View Preference
          if (result.viewMode) setViewMode(result.viewMode);

          // Load Theme Preference
          if (result.theme) {
            setTheme(result.theme);
          } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
          }
        } else {
          // Dev mode fallback
          console.warn("Chrome Storage API not found. Using mock data.");
          setBookmarks(MOCK_BOOKMARKS);
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    // Ensure panel has focus when opened
    window.focus();
  }, []);

  // Listen for external updates (e.g. from background script)
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      const handleStorageChange = (changes: any, namespace: string) => {
        if (namespace === 'local' && changes[STORAGE_KEY]) {
          const newData = changes[STORAGE_KEY].newValue;
          if (newData) {
            setCategories(newData.categories || DEFAULT_CATEGORIES);
            setBookmarks(newData.bookmarks || []);
            setSecretPassword(newData.secretPassword || DEFAULT_PASSWORD);
            setSecretCategoryName(newData.secretCategoryName || DEFAULT_SECRET_NAME);
            setLastSavedCategory(newData.lastSavedCategory || null);
          }
        }
      };
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, []);

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auto-Lock Timer logic
  useEffect(() => {
    // If the folder is unlocked but we are NOT in the secret category, start timer
    if (isSecretUnlocked && activeCategory !== secretCategoryName) {
      lockTimerRef.current = setTimeout(() => {
        setIsSecretUnlocked(false);
        console.log("Secret folder auto-locked due to inactivity.");
      }, 15000); // 15 seconds
    } else {
      // If we switch back to secret or it's already locked, clear timer
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
    }

    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, [activeCategory, isSecretUnlocked, secretCategoryName]);


  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ theme: newTheme });
    }
  };

  // Persist data helper
  const saveData = async (
    newCategories: string[],
    newBookmarks: Bookmark[],
    newPassword?: string,
    newSecretName?: string,
    newLastSaved?: string
  ) => {
    const passwordToSave = newPassword !== undefined ? newPassword : secretPassword;
    const secretNameToSave = newSecretName !== undefined ? newSecretName : secretCategoryName;
    const lastSavedToSave = newLastSaved !== undefined ? newLastSaved : lastSavedCategory;

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        [STORAGE_KEY]: {
          categories: newCategories,
          bookmarks: newBookmarks,
          secretPassword: passwordToSave,
          secretCategoryName: secretNameToSave,
          lastSavedCategory: lastSavedToSave
        }
      });
    }
  };

  const handleToggleViewMode = async (mode: 'list' | 'grid') => {
    setViewMode(mode);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ viewMode: mode });
    }
  };

  // --- Filter & Grouping Logic ---

  // 1. Filter bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      if (searchQuery.trim()) {
        if (b.category === secretCategoryName && !isSecretUnlocked) return false;
        const q = searchQuery.toLowerCase();
        if (searchFilter === 'url') return b.url.toLowerCase().includes(q) || b.hostname.toLowerCase().includes(q);
        if (searchFilter === 'title') return b.title.toLowerCase().includes(q);
        return b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q) || b.hostname.toLowerCase().includes(q);
      }
      return b.category === activeCategory;
    });
  }, [bookmarks, searchQuery, searchFilter, activeCategory, isSecretUnlocked, secretCategoryName]);

  // 2. Sort by date (Newest First) and Group by Month
  const groupedBookmarks = useMemo(() => {
    const sorted = [...filteredBookmarks].sort((a, b) => b.createdAt - a.createdAt);

    const groups: { [key: string]: Bookmark[] } = {};
    const groupOrder: string[] = [];

    sorted.forEach(bookmark => {
      const monthYear = getMonthYear(bookmark.createdAt);
      if (!groups[monthYear]) {
        groups[monthYear] = [];
        groupOrder.push(monthYear);
      }
      groups[monthYear].push(bookmark);
    });

    return { groups, groupOrder };
  }, [filteredBookmarks]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea (except for Escape)
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) && e.key !== 'Escape') {
        return;
      }

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // 1. Save (Alt + S) - Save to Active Category
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        handleSaveCurrentPage(activeCategory);
      }

      // 2. Save to Last (Cmd/Ctrl + M) or (Cmd/Ctrl + Shift + S)
      if (isCmdOrCtrl && (e.key === 'm' || (e.key === 's' && e.shiftKey))) {
        e.preventDefault();
        if (lastSavedCategory && categories.includes(lastSavedCategory)) {
          handleSaveCurrentPage(lastSavedCategory);
        } else {
          handleSaveCurrentPage(activeCategory);
        }
      }

      // 3. Open/Focus Panel (Ctrl + I)
      if (isCmdOrCtrl && e.key === 'i') {
        e.preventDefault();
        // Just focus for visual confirmation
        if (searchQuery) setSearchQuery('');
      }

      // 4. Focus Search (Cmd/Ctrl + K)
      if (isCmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // 5. Toggle Bulk Mode (Cmd/Ctrl + B)
      if (isCmdOrCtrl && e.key === 'b') {
        e.preventDefault();
        if (isSelectionMode) {
          setSelectedBookmarkIds(new Set());
        } else if (bookmarks.length > 0) {
          if (filteredBookmarks.length > 0) {
            setSelectedBookmarkIds(new Set([filteredBookmarks[0].id]));
          }
        }
      }

      // 6. Switch Categories ([ and ])
      if (e.key === '[' || e.key === ']') {
        const currentIndex = categories.indexOf(activeCategory);
        if (currentIndex !== -1) {
          let newIndex = e.key === '[' ? currentIndex - 1 : currentIndex + 1;
          if (newIndex >= 0 && newIndex < categories.length) {
            const newCat = categories[newIndex];
            handleSelectCategory(newCat);
          }
        }
      }

      // 7. Toggle Shortcuts Modal (?)
      if (e.key === '?' && e.shiftKey) {
        setShortcutsModalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categories, activeCategory, lastSavedCategory, isSelectionMode, bookmarks, isSecretUnlocked, secretCategoryName, filteredBookmarks]);


  // --- Category Logic ---

  const handleSelectCategory = (cat: string) => {
    if (cat === secretCategoryName && !isSecretUnlocked) {
      setPasswordModal({ isOpen: true, mode: 'unlock' });
    } else {
      setActiveCategory(cat);
    }
  };

  const handleAddCategory = (name: string) => {
    if (name && !categories.includes(name)) {
      const updatedCategories = [...categories, name];
      setCategories(updatedCategories);
      saveData(updatedCategories, bookmarks);
      setActiveCategory(name);
    }
  };

  const handleEditCategory = (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) return;
    if (oldName === 'Inbox') return;

    if (categories.some(c => c === newName)) {
      alert('Category name already exists');
      return;
    }

    const updatedCategories = categories.map(c => c === oldName ? newName : c);
    const updatedBookmarks = bookmarks.map(b =>
      b.category === oldName ? { ...b, category: newName } : b
    );

    setCategories(updatedCategories);
    setBookmarks(updatedBookmarks);

    // Check if we are renaming the secret category
    let newSecretName = secretCategoryName;
    if (oldName === secretCategoryName) {
      newSecretName = newName;
      setSecretCategoryName(newName);
    }

    // Check if renaming last saved category
    let newLastSaved = lastSavedCategory;
    if (lastSavedCategory === oldName) {
      newLastSaved = newName;
      setLastSavedCategory(newName);
    }

    if (activeCategory === oldName) {
      setActiveCategory(newName);
    }

    saveData(updatedCategories, updatedBookmarks, undefined, newSecretName, newLastSaved || undefined);
  };

  const handleReorderCategories = (newCategories: string[]) => {
    setCategories(newCategories);
    saveData(newCategories, bookmarks);
  };

  // Trigger Modal
  const requestDeleteCategory = (category: string) => {
    if (category === 'Inbox' || category === secretCategoryName) return;
    setDeleteModal({ isOpen: true, category, isBulk: false });
  };

  const executeDeleteCategory = async (action: 'move' | 'delete') => {
    const categoryToDelete = deleteModal.category;
    if (!categoryToDelete) return;

    const updatedCategories = categories.filter(c => c !== categoryToDelete);
    let updatedBookmarks = [...bookmarks];

    if (action === 'delete') {
      updatedBookmarks = bookmarks.filter(b => b.category !== categoryToDelete);
    } else {
      updatedBookmarks = bookmarks.map(b =>
        b.category === categoryToDelete ? { ...b, category: 'Inbox' } : b
      );
    }

    setCategories(updatedCategories);
    setBookmarks(updatedBookmarks);
    setActiveCategory('Inbox');
    setDeleteModal({ isOpen: false, category: null });

    // If we deleted the last saved category, reset it
    let newLastSaved = lastSavedCategory;
    if (lastSavedCategory === categoryToDelete) {
      newLastSaved = 'Inbox';
      setLastSavedCategory('Inbox');
    }

    await saveData(updatedCategories, updatedBookmarks, undefined, undefined, newLastSaved || undefined);
  };

  // --- Password Logic ---

  const handlePasswordSubmit = (inputPassword: string) => {
    if (passwordModal.mode === 'unlock') {
      if (inputPassword === secretPassword) {
        setIsSecretUnlocked(true);
        setActiveCategory(secretCategoryName);
        setPasswordModal({ isOpen: false, mode: 'unlock' });
      } else {
        setPasswordModal(prev => ({ ...prev, error: 'Incorrect password' }));
      }
    } else if (passwordModal.mode === 'change') {
      if (inputPassword.length < 4) {
        setPasswordModal(prev => ({ ...prev, error: 'Password too short' }));
        return;
      }
      setSecretPassword(inputPassword);
      // IMPORTANT: Pass the new password explicitly to saveData
      saveData(categories, bookmarks, inputPassword);
      setPasswordModal({ isOpen: false, mode: 'change' });
    }
  };

  const handleChangePassword = () => {
    setPasswordModal({ isOpen: true, mode: 'change', error: undefined });
  };

  // --- Bookmark Logic ---

  const handleDeleteBookmark = async (id: string) => {
    const updatedBookmarks = bookmarks.filter(b => b.id !== id);
    setBookmarks(updatedBookmarks);
    if (selectedBookmarkIds.has(id)) {
      const newSet = new Set(selectedBookmarkIds);
      newSet.delete(id);
      setSelectedBookmarkIds(newSet);
    }
    await saveData(categories, updatedBookmarks);
  };

  const handleOpenEditModal = (id: string) => {
    setEditBookmarkModal({ isOpen: true, bookmarkId: id });
  };

  const handleSaveEditedBookmark = async (id: string, newTitle: string, newCategory: string) => {
    const updatedBookmarks = bookmarks.map(b =>
      b.id === id ? { ...b, title: newTitle, category: newCategory } : b
    );
    setBookmarks(updatedBookmarks);
    await saveData(categories, updatedBookmarks);
    setEditBookmarkModal({ isOpen: false, bookmarkId: null });
  };

  // Updated to accept optional target category
  const handleSaveCurrentPage = async (targetCategory?: string) => {
    setIsSaving(true);
    const categoryToUse = targetCategory || activeCategory;

    // Ensure category exists, else fallback to Inbox
    const finalCategory = categories.includes(categoryToUse) ? categoryToUse : 'Inbox';

    try {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        // Real extension environment
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab && tab.url && tab.title) {
          const exists = bookmarks.some(b => b.url === tab.url && b.category === finalCategory);
          if (exists) {
            setIsSaving(false);
            return;
          }

          const newBookmark: Bookmark = {
            id: generateId(),
            url: tab.url,
            title: tab.title,
            hostname: getHostname(tab.url),
            favicon: getFaviconUrl(tab.url),
            category: finalCategory,
            createdAt: Date.now()
          };

          const updatedBookmarks = [newBookmark, ...bookmarks];
          setBookmarks(updatedBookmarks);
          setLastSavedCategory(finalCategory);
          await saveData(categories, updatedBookmarks, undefined, undefined, finalCategory);
        }
      } else {
        // Mock
        const mockUrl = `https://example.com/page-${Date.now()}`;
        const newBookmark: Bookmark = {
          id: generateId(),
          url: mockUrl,
          title: `Saved Page ${bookmarks.length + 1}`,
          hostname: 'example.com',
          favicon: 'https://picsum.photos/32/32',
          category: finalCategory,
          createdAt: Date.now()
        };
        const updatedBookmarks = [newBookmark, ...bookmarks];
        setBookmarks(updatedBookmarks);
        setLastSavedCategory(finalCategory);
      }
    } catch (error) {
      console.error("Failed to save page:", error);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  // --- Bulk Selection Logic ---

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedBookmarkIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedBookmarkIds(newSet);
  };

  const handleBulkMove = async (targetCategory: string) => {
    if (!targetCategory) return;

    // Check if moving to secret and locked
    if (targetCategory === secretCategoryName && !isSecretUnlocked) {
      alert("Unlock the Secret folder first to move items into it.");
      return;
    }

    const updatedBookmarks = bookmarks.map(b =>
      selectedBookmarkIds.has(b.id) ? { ...b, category: targetCategory } : b
    );

    setBookmarks(updatedBookmarks);
    await saveData(categories, updatedBookmarks);
    setSelectedBookmarkIds(new Set());
    setActiveCategory(targetCategory);
  };

  const requestBulkDelete = () => {
    setDeleteModal({ isOpen: true, category: null, isBulk: true });
  };

  const executeBulkDelete = async () => {
    const updatedBookmarks = bookmarks.filter(b => !selectedBookmarkIds.has(b.id));
    setBookmarks(updatedBookmarks);
    await saveData(categories, updatedBookmarks);
    setSelectedBookmarkIds(new Set());
    setDeleteModal({ isOpen: false, category: null, isBulk: false });
  };

  const isSearchActive = searchQuery.trim().length > 0;
  const isLockedView = activeCategory === secretCategoryName && !isSecretUnlocked;

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-neutral-950">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-slate-50 overflow-hidden font-sans">

      {/* Header Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 dark:border-white/5">
        <div className={`relative flex-1 group transition-all duration-300 ease-out ${isSearchFocused ? 'mr-0' : ''}`}>
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isSearchFocused ? 'text-blue-500' : 'text-slate-400 dark:text-neutral-500'}`} size={16} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 py-2 bg-slate-100 dark:bg-neutral-900 border border-transparent dark:border-neutral-800 focus:border-blue-500 dark:focus:border-blue-500/50 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-neutral-600 ${isSearchFocused ? 'pr-36' : 'pr-12'}`}
          />

          {/* Filter UI */}
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
            {isSearchFocused ? (
              <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-8 duration-300">
                {(['all', 'title', 'url'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={(e) => { e.preventDefault(); setSearchFilter(f); searchInputRef.current?.focus(); }}
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md transition-all ${searchFilter === f
                      ? 'bg-white dark:bg-neutral-800 text-blue-600 shadow-sm border border-slate-200 dark:border-neutral-700'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-neutral-800/50'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1 pr-2 pointer-events-none">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-neutral-500">{searchFilter}</span>
                <Filter size={12} className="text-slate-400 dark:text-neutral-500" />
              </div>
            )}
          </div>
        </div>

        {/* Hide actions when searching to focus attention and space */}
        <div className={`flex items-center gap-1 transition-all duration-300 overflow-hidden ${isSearchFocused ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <button onClick={() => setShortcutsModalOpen(true)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-xl transition-all" title="Shortcuts (?)">
            <HelpCircle size={18} />
          </button>

          <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-xl transition-all" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => handleToggleViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-xl transition-all"
            title="Toggle View"
          >
            {viewMode === 'list' ? <LayoutGrid size={18} /> : <ListIcon size={18} />}
          </button>
        </div>
      </div>

      {/* Categories */}
      <CategoryPills
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={requestDeleteCategory}
        onReorderCategories={handleReorderCategories}
        isSecretUnlocked={isSecretUnlocked}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth">
        {/* Secret Locked State */}
        {isLockedView ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-slate-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Lock size={32} className="text-slate-400 dark:text-neutral-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{secretCategoryName} is Locked</h2>
            <p className="text-slate-500 dark:text-neutral-400 text-sm mb-8 max-w-[240px]">
              Enter your password to view the hidden stash.
            </p>
            <button
              onClick={() => setPasswordModal({ isOpen: true, mode: 'unlock' })}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
            >
              Unlock Folder
            </button>
          </div>
        ) : (
          <>
            {groupedBookmarks.groupOrder.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-neutral-600 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Archive size={48} strokeWidth={1} className="mb-4 opacity-50" />
                <p className="text-sm font-medium">No bookmarks found</p>
                {isSearchActive && <button onClick={() => setSearchQuery('')} className="mt-2 text-xs text-blue-500 hover:underline">Clear Search</button>}
              </div>
            ) : (
              <div className="space-y-6">
                {groupedBookmarks.groupOrder.map(monthYear => (
                  <div key={monthYear} className="animate-in slide-in-from-bottom-2 duration-500">
                    {/* Month Header */}
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <Calendar size={12} className="text-blue-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-500">
                        {monthYear}
                      </span>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-neutral-900"></div>
                    </div>

                    {/* Grid/List */}
                    <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
                      {groupedBookmarks.groups[monthYear].map(bookmark => (
                        <BookmarkCard
                          key={bookmark.id}
                          bookmark={bookmark}
                          onDelete={handleDeleteBookmark}
                          onEdit={handleOpenEditModal}
                          viewMode={viewMode}
                          showCategoryBadge={isSearchActive}
                          isSelected={selectedBookmarkIds.has(bookmark.id)}
                          selectionMode={isSelectionMode}
                          onToggleSelect={handleToggleSelect}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Secret Settings Button (Only visible inside unlocked secret folder) */}
      {isSecretUnlocked && activeCategory === secretCategoryName && (
        <div className="absolute bottom-24 right-4 z-40">
          <button
            onClick={handleChangePassword}
            className="p-3 bg-white dark:bg-neutral-800 text-slate-400 dark:text-neutral-400 hover:text-blue-500 dark:hover:text-blue-400 hover:shadow-xl rounded-full shadow-lg border border-slate-100 dark:border-white/5 transition-all"
            title="Change Password"
          >
            <KeyRound size={20} />
          </button>
        </div>
      )}

      {/* Footer / Floating Action Island */}
      <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center pointer-events-none z-50">
        <div className={`
           pointer-events-auto flex items-center justify-between gap-3 p-2 rounded-2xl shadow-2xl transition-all duration-300 border border-white/20 dark:border-white/5 backdrop-blur-xl
           ${isSelectionMode
            ? 'w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900'
            : 'w-auto min-w-[200px] bg-white/90 dark:bg-neutral-900/90'
          }
        `}>
          {isSelectionMode ? (
            <>
              <div className="flex items-center gap-2 px-2">
                <span className="bg-white/20 dark:bg-black/10 text-xs font-bold px-2 py-0.5 rounded text-white dark:text-black">
                  {selectedBookmarkIds.size}
                </span>
                <span className="text-xs font-medium">Selected</span>
              </div>

              <div className="flex items-center gap-1">
                {/* Move Dropdown Trigger - simplified for UI */}
                <div className="relative group">
                  <button className="p-2 hover:bg-white/10 dark:hover:bg-black/5 rounded-lg transition-colors" title="Move to...">
                    <FolderInput size={18} />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden hidden group-hover:block animate-in slide-in-from-bottom-2">
                    <div className="py-1 max-h-48 overflow-y-auto">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleBulkMove(cat)}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800"
                        >
                          Move to {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={requestBulkDelete}
                  className="p-2 text-red-400 hover:text-red-500 hover:bg-white/10 dark:hover:bg-black/5 rounded-lg transition-colors"
                  title="Delete Selected"
                >
                  <Trash2 size={18} />
                </button>

                <div className="w-px h-4 bg-white/20 dark:bg-black/10 mx-1"></div>

                <button
                  onClick={() => setSelectedBookmarkIds(new Set())}
                  className="p-2 hover:bg-white/10 dark:hover:bg-black/5 rounded-lg transition-colors"
                  title="Cancel Selection"
                >
                  <X size={18} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => handleSaveCurrentPage(activeCategory)}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                  <span>Stash Page</span>
                  {lastSavedCategory && (
                    <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-green-400 animate-pulse m-1" title={`Last saved to: ${lastSavedCategory}`}></span>
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        categoryName={deleteModal.category || ''}
        bookmarkCount={deleteModal.isBulk ? selectedBookmarkIds.size : bookmarks.filter(b => b.category === deleteModal.category).length}
        onClose={() => setDeleteModal({ isOpen: false, category: null, isBulk: false })}
        onConfirmMove={() => executeDeleteCategory('move')}
        onConfirmDelete={() => deleteModal.isBulk ? executeBulkDelete() : executeDeleteCategory('delete')}
        isBulkDelete={deleteModal.isBulk}
      />

      <EditBookmarkModal
        isOpen={editBookmarkModal.isOpen}
        bookmark={bookmarks.find(b => b.id === editBookmarkModal.bookmarkId) || null}
        categories={categories}
        onClose={() => setEditBookmarkModal({ isOpen: false, bookmarkId: null })}
        onSave={handleSaveEditedBookmark}
      />

      <PasswordModal
        isOpen={passwordModal.isOpen}
        mode={passwordModal.mode}
        onClose={() => setPasswordModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handlePasswordSubmit}
        error={passwordModal.error}
      />

      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

    </div>
  );
};

export default App;
