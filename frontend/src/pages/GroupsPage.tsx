import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Plus, ArrowRight, Trash2, FolderPlus } from 'lucide-react';

export const GroupsPage: React.FC = () => {
  const { groups, tasks, completedTasks, createGroup, deleteGroup } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10B981');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleDelete = async (e: React.MouseEvent, id: string, grpName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete group "${grpName}"? Tasks in this group will not be deleted.`)) {
      await deleteGroup(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
            <span>A LITTLE ORGANIZATION</span>
            <span>·</span>
            <span>GROUPS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            The different parts of your day.
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            Organize tasks into categories that match your personal and work life.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Group
        </Button>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-surface-border rounded-3xl space-y-3">
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
          {groups.map((grp) => {
            const activeCount = tasks.filter((t) => t.groupId === grp._id).length;
            const finishedCount = completedTasks.filter((t) => t.groupId === grp._id).length;

            return (
              <Link
                key={grp._id}
                to={`/groups/${grp._id}`}
                className="p-6 rounded-3xl border border-surface-border bg-white shadow-xs hover:border-sage-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: grp.color || '#10B981' }}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sage-800 bg-sage-50 px-2.5 py-1 rounded-full">
                        {activeCount} active
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, grp._id, grp.name)}
                        className="text-content-muted hover:text-red-600 p-1 rounded transition-colors"
                        title="Delete Group"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-content-primary group-hover:text-sage-700 transition-colors">
                    {grp.name}
                  </h3>
                </div>

                <div className="pt-6 mt-4 border-t border-surface-border flex items-center justify-between text-xs text-content-muted">
                  <span>{finishedCount} completed</span>
                  <span className="flex items-center font-semibold text-sage-700 group-hover:translate-x-1 transition-transform">
                    Open group <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal */}
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
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-2">
              Color Accent
            </label>
            <div className="flex gap-2">
              {['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-110 border-content-primary' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Create Group
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
