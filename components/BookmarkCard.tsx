
import React from 'react';
import { Trash2, Pencil, Check, CalendarDays } from 'lucide-react';
import { Bookmark } from '../types';
import { formatDate } from '../utils';

declare const chrome: any;

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  viewMode: 'list' | 'grid';
  showCategoryBadge?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  selectionMode?: boolean;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ 
  bookmark, 
  onDelete, 
  onEdit,
  viewMode,
  showCategoryBadge = false,
  isSelected = false,
  onToggleSelect,
  selectionMode = false
}) => {
  
  const handleCardClick = (e: React.MouseEvent) => {
    // If we are in selection mode, clicking the card toggles selection
    if (selectionMode && onToggleSelect) {
      onToggleSelect(bookmark.id);
      return;
    }

    // Normal behavior: Open link
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: bookmark.url });
    } else {
      window.open(bookmark.url, '_blank');
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelect) {
      onToggleSelect(bookmark.id);
    }
  };

  const selectedClasses = isSelected 
    ? "border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500" 
    : "border-slate-200 dark:border-white/5 bg-gradient-to-br from-white to-blue-50/30 dark:from-neutral-900 dark:to-blue-900/10 hover:border-blue-300 dark:hover:border-neutral-700";

  // --- Grid View Layout ---
  if (viewMode === 'grid') {
    return (
      <div 
        className={`group relative rounded-2xl border p-4 shadow-sm hover:shadow-xl dark:shadow-black/40 transition-all duration-300 ease-out cursor-pointer flex flex-col h-full ${selectedClasses} ${isSelected ? '' : 'hover:-translate-y-1'}`}
        onClick={handleCardClick}
      >
        {/* Selection Checkbox */}
        <div 
          onClick={handleCheckboxClick}
          className={`absolute top-3 right-3 z-10 p-1 rounded-lg transition-all duration-200 
            ${isSelected ? 'opacity-100 text-white bg-blue-600' : 'opacity-0 group-hover:opacity-100 text-slate-300 hover:text-blue-500 bg-white dark:bg-neutral-800 shadow-sm border border-slate-100 dark:border-neutral-700'}
          `}
        >
          {isSelected ? <Check size={14} strokeWidth={3} /> : <div className="w-3.5 h-3.5 border-2 border-current rounded-sm" />}
        </div>

        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-slate-100 dark:border-white/5 p-1.5 flex items-center justify-center overflow-hidden shadow-sm">
            <img 
              src={bookmark.favicon} 
              alt="" 
              className="w-full h-full object-contain filter hover:brightness-110 transition-all"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/32/32';
              }}
            />
          </div>
           {showCategoryBadge && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-neutral-500 bg-slate-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-neutral-700 mr-6">
              {bookmark.category}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2 line-clamp-2" title={bookmark.title}>
            {bookmark.title}
          </h3>
        </div>
        
        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-100/50 dark:border-white/5">
           <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium truncate max-w-[60%]">
                {bookmark.hostname}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-300 dark:text-neutral-600">
                <CalendarDays size={10} />
                <span>{formatDate(bookmark.createdAt)}</span>
              </div>
           </div>
          
          {!selectionMode && (
            <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                  onClick={(e) => {
                  e.stopPropagation();
                  onEdit(bookmark.id);
                  }}
                  className="p-1.5 text-slate-300 dark:text-neutral-600 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit"
              >
                  <Pencil size={14} />
              </button>
              <button
                  onClick={(e) => {
                  e.stopPropagation();
                  onDelete(bookmark.id);
                  }}
                  className="p-1.5 text-slate-300 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Remove from stash"
              >
                  <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- List View Layout (Default) ---
  return (
    <div 
      className={`group relative rounded-2xl border p-3 shadow-sm hover:shadow-xl dark:shadow-black/40 transition-all duration-300 ease-out cursor-pointer ${selectedClasses} ${isSelected ? '' : 'hover:-translate-y-0.5 hover:scale-[1.01]'}`}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox (Absolute Left) */}
      <div 
        onClick={handleCheckboxClick}
        className={`absolute top-1/2 -translate-y-1/2 -left-3 z-20 transition-all duration-200
          ${isSelected || selectionMode ? 'opacity-100 translate-x-4' : 'opacity-0 -translate-x-full group-hover:translate-x-4 group-hover:opacity-100'}
        `}
      >
         <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-lg border ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-transparent hover:border-blue-400'}`}>
            <Check size={14} strokeWidth={3} />
         </div>
      </div>

      <div className={`flex items-start gap-3 transition-transform duration-200 ${isSelected || selectionMode ? 'translate-x-5' : ''}`}>
        {/* Favicon Container */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-slate-100 dark:border-white/5 p-1.5 flex items-center justify-center overflow-hidden shadow-sm">
          <img 
            src={bookmark.favicon} 
            alt="" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/32/32';
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex justify-between items-start">
             <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1.5 line-clamp-2 pr-12" title={bookmark.title}>
               {bookmark.title}
             </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium truncate">
                {bookmark.hostname}
            </p>
            <span className="text-[10px] text-slate-300 dark:text-neutral-600 px-1">•</span>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                {formatDate(bookmark.createdAt)}
            </span>

            {showCategoryBadge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700 ml-auto">
                    {bookmark.category}
                </span>
            )}
          </div>
        </div>

        {/* Actions (Hidden if selecting) */}
        {!selectionMode && (
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg p-0.5 shadow-sm border border-slate-100 dark:border-white/10">
              <button
                  onClick={(e) => {
                  e.stopPropagation();
                  onEdit(bookmark.id);
                  }}
                  className="p-1.5 text-slate-400 dark:text-neutral-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  title="Edit"
              >
                  <Pencil size={14} />
              </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(bookmark.id);
              }}
              className="p-1.5 text-slate-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              title="Remove from stash"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkCard;
