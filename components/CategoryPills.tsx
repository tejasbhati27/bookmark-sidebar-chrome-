
import React, { useRef, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface CategoryPillsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onAddCategory: (name: string) => void;
  onEditCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (category: string) => void;
  onReorderCategories?: (newCategories: string[]) => void;
  isSecretUnlocked: boolean;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onReorderCategories,
  isSecretUnlocked
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Edit State
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryValue, setNewCategoryValue] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);

  // Drag State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Focus on edit input
  useEffect(() => {
    if (editingCategory && editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
    }
  }, [editingCategory]);

  // Focus on add input
  useEffect(() => {
    if (isAdding && addInputRef.current) {
        addInputRef.current.focus();
    }
  }, [isAdding]);

  // --- Edit Handlers ---
  const startEditing = (category: string) => {
    if (category === 'Inbox') return; // Only Inbox is locked from renaming
    setEditingCategory(category);
    setEditValue(category);
  };

  const saveEdit = () => {
    if (editingCategory && editValue.trim()) {
        onEditCategory(editingCategory, editValue.trim());
    }
    setEditingCategory(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        saveEdit();
    } else if (e.key === 'Escape') {
        cancelEdit();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingCategory) {
        onDeleteCategory(editingCategory);
        setEditingCategory(null);
    }
  };

  // --- Add Handlers ---
  const startAdding = () => {
    setIsAdding(true);
    setNewCategoryValue('');
  };

  const saveAdd = () => {
    if (newCategoryValue.trim()) {
        onAddCategory(newCategoryValue.trim());
    }
    setIsAdding(false);
    setNewCategoryValue('');
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewCategoryValue('');
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        saveAdd();
    } else if (e.key === 'Escape') {
        cancelAdd();
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!onReorderCategories) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index || !onReorderCategories) return;
    
    // Simple array move logic
    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);
    
    onReorderCategories(newCategories);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-950 sticky top-0 z-20 pt-2 pb-1">
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto px-4 pb-3 pt-1 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat, index) => {
            const isEditing = editingCategory === cat;
            const isActive = activeCategory === cat;
            const isDragging = draggedIndex === index;

            if (isEditing) {
                return (
                    <div key={`edit-${cat}`} className="flex items-center bg-white dark:bg-neutral-800 border border-blue-500/50 rounded-full shadow-lg shadow-blue-500/10 pr-1 animate-in zoom-in duration-200 ring-2 ring-blue-500/20">
                        <input
                            ref={editInputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleEditKeyDown}
                            className="px-4 py-1.5 rounded-l-full text-sm font-medium text-slate-900 dark:text-white outline-none min-w-[80px] w-auto bg-transparent"
                            style={{ width: `${Math.max(editValue.length, 8)}ch` }}
                        />
                        {cat !== 'Inbox' && (
                            <button 
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleDeleteClick}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                title="Delete Category"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                );
            }

            return (
                <div
                    key={cat}
                    draggable={!isEditing && onReorderCategories !== undefined}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      relative group
                      ${isDragging ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}
                      ${draggedIndex === null ? 'pill-transition' : ''} 
                    `}
                >
                    <button
                        onClick={() => onSelectCategory(cat)}
                        onDoubleClick={() => startEditing(cat)}
                        title={cat === 'Inbox' ? "Inbox cannot be renamed" : "Double-click to edit, Drag to reorder"}
                        className={`
                        whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold select-none flex items-center gap-1.5 border
                        ${!isEditing && onReorderCategories ? 'cursor-grab active:cursor-grabbing' : ''}
                        ${
                            isActive
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg shadow-slate-500/20 dark:shadow-white/20 border-transparent transform scale-105'
                            : 'bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-500 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-neutral-700 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-neutral-800'
                        }
                        `}
                    >
                        {cat}
                    </button>
                </div>
            );
        })}

        {/* Add Category Input */}
        {isAdding && (
             <input
                ref={addInputRef}
                type="text"
                value={newCategoryValue}
                onChange={(e) => setNewCategoryValue(e.target.value)}
                onBlur={saveAdd}
                onKeyDown={handleAddKeyDown}
                placeholder="New..."
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-neutral-800 border border-blue-400 text-slate-900 dark:text-white outline-none shadow-sm min-w-[80px] animate-in slide-in-from-left-2 duration-200"
            />
        )}
        
        {!isAdding && (
            <button
            onClick={startAdding}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-transparent border border-dashed border-slate-300 dark:border-neutral-700 text-slate-400 dark:text-neutral-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
            title="Add Category"
            >
            <Plus size={16} />
            </button>
        )}
      </div>
    </div>
  );
};

export default CategoryPills;
