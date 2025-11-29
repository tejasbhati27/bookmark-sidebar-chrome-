
export interface Bookmark {
  id: string;
  url: string;
  title: string;
  hostname: string;
  favicon: string;
  category: string;
  createdAt: number;
}

export interface StorageData {
  categories: string[];
  bookmarks: Bookmark[];
  secretPassword?: string;
  secretCategoryName?: string; // New field to track the custom name
  lastSavedCategory?: string; // New field to track the last category used for saving
  categoryUsage?: Record<string, number>; // Track last usage timestamp for each category
}

export const DEFAULT_CATEGORIES = ["Inbox", "Work", "Design", "Dev", "Secret"];

export const MOCK_BOOKMARKS: Bookmark[] = [
  {
    id: '1',
    url: 'https://react.dev',
    title: 'React - The library for web and native user interfaces',
    hostname: 'react.dev',
    favicon: 'https://www.google.com/s2/favicons?domain=react.dev&sz=128',
    category: 'Dev',
    createdAt: Date.now()
  },
  {
    id: '2',
    url: 'https://dribbble.com',
    title: 'Dribbble - Discover the World’s Top Designers & Creative Professionals',
    hostname: 'dribbble.com',
    favicon: 'https://www.google.com/s2/favicons?domain=dribbble.com&sz=128',
    category: 'Design',
    createdAt: Date.now() - 100000
  }
];
