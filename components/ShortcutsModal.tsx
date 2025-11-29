import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const ShortcutItem = ({ keys, description }: { keys: string[], description: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <kbd key={i} className="px-2 py-1 min-w-[24px] text-center bg-slate-100 dark:bg-neutral-800 border-b-2 border-slate-200 dark:border-neutral-700 rounded text-xs font-sans text-slate-500 dark:text-slate-400 font-bold">
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-white/10 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">

        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-neutral-900">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Keyboard size={18} className="text-blue-500" />
            Keyboard Shortcuts
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <ShortcutItem keys={['Ctrl', 'Shift', 'M']} description="Save to Last Used Category" />
          <ShortcutItem keys={['Alt', 'Q']} description="Open Side Panel / Focus" />
          <ShortcutItem keys={['Alt', 'S']} description="Save to Active Category" />
          <ShortcutItem keys={['Ctrl', 'K']} description="Focus Search" />
          <ShortcutItem keys={['Ctrl', 'B']} description="Toggle Bulk Selection" />
          <ShortcutItem keys={['[']} description="Previous Category" />
          <ShortcutItem keys={[']']} description="Next Category" />
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-neutral-950/50 text-center">
          <p className="text-[10px] text-slate-400 dark:text-neutral-500">
            <Command size={10} className="inline mr-1" />
            Global shortcuts require Shift (e.g., Ctrl+Shift+M)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;