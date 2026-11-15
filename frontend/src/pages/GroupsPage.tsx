import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { GroupActionsMenu } from '../components/groups/GroupActionsMenu';
import { Plus, ArrowRight, FolderPlus, GripVertical } from 'lucide-react';

export const GroupsPage: React.FC = () => {
  const { groups, tasks, completedTasks, createGroup, reorderGroups } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10B981');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await createGroup(name.trim(), color);
      setName('');
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drag-and-drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    const updated = [...groups];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setDraggedIndex(null);
    await reorderGroups(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 dark:text-sage-400 mb-1">
            <span>A LITTLE ORGANIZATION</span>
            <span>·</span>
            <span>GROUPS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            The different parts of your day.
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            Organize tasks into categories that match your personal and work life. Drag to reorder.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Group
        </Button>
      </div>

      {/* Groups Grid with Drag-and-Drop */}
      {groups.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-surface-card border border-dashed border-surface-border rounded-3xl space-y-3">
          <FolderPlus className="w-10 h-10 text-sage-600 mx-auto" />
          <h3 className="text-base font-bold text-content-primary">No groups created yet</h3>
          <p className="text-xs text-content-secondary max-w-sm mx-auto">
            Create groups like "Work", "Personal", or "Study" to organize your focus sessions.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
            Add your first group
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map((grp, index) => {
            const activeCount = tasks.filter((t) => t.groupId === grp._id).length;
            const finishedCount = completedTasks.filter((t) => t.groupId === grp._id).length;

            return (
              <div
                key={grp._id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  p-6 rounded-3xl border border-surface-border bg-white dark:bg-surface-card shadow-xs hover:border-sage-400 hover:shadow-md transition-all flex flex-col justify-between group relative cursor-grab active:cursor-grabbing
                  ${draggedIndex === index ? 'opacity-40 border-dashed border-sage-500 scale-95' : ''}
                `}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-content-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: grp.color || '#10B981' }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-sage-800 dark:text-sage-200 bg-sage-50 dark:bg-sage-900/40 px-2.5 py-1 rounded-full">
                        {activeCount} active
                      </span>
                      {/* Three dot actions menu */}
                      <GroupActionsMenu group={grp} align="right" />
                    </div>
                  </div>

                  <Link to={`/groups/${grp._id}`} className="block">
                    <h3 className="text-xl font-bold text-content-primary group-hover:text-sage-700 dark:group-hover:text-sage-300 transition-colors">
                      {grp.name}
                    </h3>
                  </Link>
                </div>

                <div className="pt-6 mt-4 border-t border-surface-border flex items-center justify-between text-xs text-content-muted">
                  <span>{finishedCount} completed</span>
                  <Link
                    to={`/groups/${grp._id}`}
                    className="flex items-center font-semibold text-sage-700 dark:text-sage-300 group-hover:translate-x-1 transition-transform"
                  >
                    Open group <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Group"
        subtitle="Group your tasks by context or project."
        maxWidth="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Group Name"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Design System, History 101..."
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-2">
              Color Tag
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#64748B'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-sage-600' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Create Group
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
