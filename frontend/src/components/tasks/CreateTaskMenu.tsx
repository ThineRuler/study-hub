import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Zap, Layers, ChevronRight } from 'lucide-react';
import { QuickAddModal } from './QuickAddModal';
import { CreateTaskWizardModal } from './CreateTaskWizardModal';

interface CreateTaskMenuProps {
  className?: string;
}

export const CreateTaskMenu: React.FC<CreateTaskMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 288; // 18rem (w-72)
      // Check if there is room to fly out to the right
      const fitsOnRight = rect.right + menuWidth + 16 <= window.innerWidth;

      if (fitsOnRight) {
        setCoords({
          top: Math.max(12, Math.min(rect.top - 8, window.innerHeight - 240)),
          left: rect.right + 12,
        });
      } else {
        // Fallback for narrow mobile screens
        setCoords({
          top: rect.bottom + 8,
          left: Math.max(12, rect.left),
        });
      }
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        updatePosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-sage-600 text-white font-semibold text-sm hover:bg-sage-700 active:bg-sage-800 shadow-sm transition-all"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Task
        </span>
        <ChevronRight
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Flyout Sub-menu rendered via portal to prevent sidebar jumping & clipping */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999,
            }}
            className="w-72 rounded-2xl bg-white dark:bg-surface-card border border-surface-border shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsQuickAddOpen(true);
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-sage-50 dark:hover:bg-surface-subtle transition-colors flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200 group-hover:bg-sage-200 dark:group-hover:bg-sage-800 transition-colors shrink-0">
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
              className="w-full text-left p-3 rounded-xl hover:bg-sage-50 dark:hover:bg-surface-subtle transition-colors flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200 group-hover:bg-sage-200 dark:group-hover:bg-sage-800 transition-colors shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-content-primary">Guided Breakdown</p>
                <p className="text-xs text-content-secondary mt-0.5">
                  6-step process for large projects, confidence scoring, & subtasks.
                </p>
              </div>
            </button>
          </div>,
          document.body
        )}

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      <CreateTaskWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
};
