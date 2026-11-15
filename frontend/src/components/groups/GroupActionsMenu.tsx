import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { GroupItem } from '../../api/groupApi';
import { useTasks } from '../../context/TaskContext';
import { EditGroupModal } from './EditGroupModal';

interface GroupActionsMenuProps {
  group: GroupItem;
  className?: string;
  align?: 'left' | 'right';
}

export const GroupActionsMenu: React.FC<GroupActionsMenuProps> = ({
  group,
  className = '',
  align = 'right',
}) => {
  const { deleteGroup } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    setIsEditOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (window.confirm(`Delete group "${group.name}"? Tasks in this group will not be deleted.`)) {
      await deleteGroup(group._id);
    }
  };

  return (
    <>
      <div className={`relative inline-block ${className}`} ref={menuRef}>
        <button
          type="button"
          onClick={handleToggle}
          className="p-1 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-subtle transition-colors focus:outline-none"
          title="Group options"
          aria-label="Group options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isOpen && (
          <div
            className={`
              absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1 w-40 rounded-xl bg-white dark:bg-surface-card border border-surface-border shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleEditClick}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-content-primary hover:bg-surface-subtle transition-colors text-left"
            >
              <Pencil className="w-3.5 h-3.5 text-sage-600" />
              <span>Edit Group</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Delete Group</span>
            </button>
          </div>
        )}
      </div>

      <EditGroupModal
        group={group}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
};
