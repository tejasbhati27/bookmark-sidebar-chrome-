import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Bookmark } from '../types';

interface EditBookmarkModalProps {
  isOpen: boolean;
  bookmark: Bookmark | null;
  categories: string[];
  onClose: () => void;
  onSave: (id: string, newTitle: string, newCategory: string) => void;
}

const EditBookmarkModal: React.FC<EditBookmarkModalProps> = ({
  isOpen,
  bookmark,
  categories,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title);
      setCategory(bookmark.category);
    }
  }, [bookmark]);

  if (!isOpen || !bookmark) return null;

  const handleSave = () => {
    if (title.trim()) {
      onSave(bookmark.id, title.trim(), category);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
    } else if (e.key === 'Escape') {
        onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-neutral-900">
          <h3 className="font-bold text-slate-800 dark:text-white">Edit Bookmark</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-1.5">Title</label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm text-slate-800 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 dark:focus:border-blue-500/50 outline-none resize-none transition-all"
              rows={3}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-1.5">Category</label>
            <div className="relative">
                <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm text-slate-800 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 dark:focus:border-blue-500/50 outline-none transition-all"
                >
                {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                    </svg>
                </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-neutral-950/50 flex gap-2 justify-end border-t border-slate-100 dark:border-white/5">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm text-slate-600 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBookmarkModal;