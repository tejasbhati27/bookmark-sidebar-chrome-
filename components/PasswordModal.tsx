
import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, ArrowRight, KeyRound } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  mode: 'unlock' | 'change';
  onClose: () => void;
  onSubmit: (password: string) => void;
  error?: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSubmit,
  error
}) => {
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      // Slight delay to allow animation to start before focusing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden border border-slate-100 dark:border-white/10 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
        
        <div className="pt-8 pb-6 px-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 shadow-inner">
             {mode === 'unlock' ? <Lock size={20} /> : <KeyRound size={20} />}
          </div>
          
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">
            {mode === 'unlock' ? 'Locked Folder' : 'Change Password'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-[200px]">
            {mode === 'unlock' 
              ? 'Enter your password to access this secret stash.' 
              : 'Enter a new password for your secret folder.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 w-full">
          <div className="relative group">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password..."
              className="w-full text-center px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all tracking-widest placeholder:tracking-normal placeholder:text-slate-400"
            />
            <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
                <ArrowRight size={16} />
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center mt-3 font-medium animate-in slide-in-from-top-1">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-4 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
