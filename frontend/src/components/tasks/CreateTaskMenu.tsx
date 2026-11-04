import React, { useState, useRef, useEffect } from 'react';
import { Plus, Zap, Layers, ChevronDown } from 'lucide-react';
import { QuickAddModal } from './QuickAddModal';
import { CreateTaskWizardModal } from './CreateTaskWizardModal';
import { Task } from '../../types';

interface CreateTaskMenuProps {
  onTaskCreated?: (task: Partial<Task>) => void;
  className?: string;
}

export const CreateTaskMenu: React.FC<CreateTaskMenuProps> = ({ onTaskCreated, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTaskSave = (task: Partial<Task>) => {
    if (onTaskCreated) onTaskCreated(task);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-sage-600 text-white font-semibold text-sm hover:bg-sage-700 active:bg-sage-800 shadow-sm transition-all"
      >
        <span className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Task
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Sub-menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-surface-border shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsQuickAddOpen(true);
            }}
            className="w-full text-left p-3 rounded-xl hover:bg-sage-50 transition-colors flex items-start gap-3 group"
          >
            <div className="p-2 rounded-lg bg-sage-100 text-sage-800 group-hover:bg-sage-200 transition-colors shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-content-primary">Quick Add Task</p>
              <p className="text-xs text-content-secondary mt-0.5">
                Fast 1-step capture for errands, quick notes, and reminders.
              </p>
            </div>
          </button>

          <div className="my-1 border-t border-surface-border" />

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsWizardOpen(true);
            }}
            className="w-full text-left p-3 rounded-xl hover:bg-sage-50 transition-colors flex items-start gap-3 group"
          >
            <div className="p-2 rounded-lg bg-sage-100 text-sage-800 group-hover:bg-sage-200 transition-colors shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-content-primary">Guided Breakdown</p>
              <p className="text-xs text-content-secondary mt-0.5">
                6-step process for large projects, confidence scoring, & subtasks.
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={handleTaskSave}
      />

      <CreateTaskWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSaveTask={handleTaskSave}
      />
    </div>
  );
};
