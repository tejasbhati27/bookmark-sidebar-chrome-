import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  categoryName: string;
  bookmarkCount: number;
  onClose: () => void;
  onConfirmMove: () => void;
  onConfirmDelete: () => void;
  isBulkDelete?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  categoryName,
  bookmarkCount,
  onClose,
  onConfirmMove,
  onConfirmDelete,
  isBulkDelete = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-neutral-900">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={18} />
            {isBulkDelete ? 'Delete Bookmarks' : 'Delete Category'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isBulkDelete ? (
             <p className="text-slate-600 dark:text-neutral-400 text-sm mb-4">
                Are you sure you want to delete <strong>{bookmarkCount}</strong> selected bookmarks?
                <br/><span className="text-xs text-red-500 mt-2 block font-medium">This action cannot be undone.</span>
             </p>
          ) : (
            <>
              <p className="text-slate-600 dark:text-neutral-400 text-sm mb-4">
                You are about to delete <strong>"{categoryName}"</strong>.
              </p>
              
              {bookmarkCount > 0 ? (
                <p className="text-amber-800 dark:text-amber-200 text-xs bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50">
                  This category contains <strong>{bookmarkCount}</strong> bookmarks. What would you like to do with them?
                </p>
              ) : (
                 <p className="text-slate-500 dark:text-neutral-500 text-xs">This category is empty.</p>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-neutral-950/50 flex flex-col gap-2">
          {isBulkDelete ? (
             <button
                onClick={onConfirmDelete}
                className="w-full py-2.5 px-4 bg-red-600 border border-transparent rounded-lg text-white text-sm font-medium hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
              >
                Yes, Delete {bookmarkCount} Items
              </button>
          ) : (
             <>
                {bookmarkCount > 0 ? (
                  <>
                    <button
                      onClick={onConfirmMove}
                      className="w-full py-2.5 px-4 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-700 dark:text-neutral-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-neutral-700 hover:border-slate-400 transition-all shadow-sm"
                    >
                      Move {bookmarkCount} items to Inbox
                    </button>
                    <button
                      onClick={onConfirmDelete}
                      className="w-full py-2.5 px-4 bg-red-600 border border-transparent rounded-lg text-white text-sm font-medium hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
                    >
                      Delete items & category
                    </button>
                  </>
                ) : (
                   <button
                      onClick={onConfirmDelete}
                      className="w-full py-2.5 px-4 bg-red-600 border border-transparent rounded-lg text-white text-sm font-medium hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
                    >
                      Delete Category
                    </button>
                )}
             </>
          )}
          
          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 font-medium mt-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;