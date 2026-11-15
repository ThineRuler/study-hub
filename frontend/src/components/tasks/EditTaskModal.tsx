import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ConfidenceSlider } from '../common/ConfidenceSlider';
import { useTasks } from '../../context/TaskContext';
import { TaskItem } from '../../api/taskApi';
import { parseCalendarDate } from '../../utils/scheduler';

interface EditTaskModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { groups, updateTask } = useTasks();
  const [name, setName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [estPomodoros, setEstPomodoros] = useState(1);
  const [confidence, setConfidence] = useState(8);
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task && isOpen) {
      setName(task.name || '');
      const validGroup = groups.some((g) => g._id === task.groupId)
        ? task.groupId
        : (groups[0]?._id ?? '');
      setSelectedGroupId(validGroup || '');
      setEstPomodoros(task.estPomodoros || 1);
      const conf = typeof task.importance === 'number'
        ? Math.round(task.importance * 10)
        : 8;
      setConfidence(Math.min(10, Math.max(1, conf)));
      const parsedDate = parseCalendarDate(task.dueDate);
      setDueDate(parsedDate ? parsedDate.dateStr : '');
      setError('');
    }
  }, [task, isOpen, groups]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !name.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await updateTask(task._id, {
        name: name.trim(),
        groupId: selectedGroupId || undefined,
        estPomodoros,
        importance: Math.min(1, Math.max(0, confidence / 10)),
        dueDate: dueDate || undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task"
      subtitle="Update details, group, pomodoro estimate, readiness, or due date."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-xs text-red-700 font-medium border border-red-200">
            {error}
          </div>
        )}

        <Input
          label="Task Name"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Groups selection */}
        {groups.length > 0 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-2">
              Assign Group
            </label>
            <div className="flex flex-wrap gap-2">
              {groups.map((grp) => {
                const active = selectedGroupId === grp._id;
                return (
                  <button
                    key={grp._id}
                    type="button"
                    onClick={() => setSelectedGroupId(grp._id)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5
                      ${
                        active
                          ? 'bg-sage-600 text-white border-sage-600 shadow-xs'
                          : 'bg-white dark:bg-surface-card border-surface-border text-content-secondary hover:border-sage-300'
                      }
                    `}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: grp.color || '#10B981' }}
                    />
                    <span>{grp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pomodoros and Due Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1.5">
              Sessions (25m)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setEstPomodoros(count)}
                  className={`
                    flex-1 py-2 rounded-lg text-xs font-bold border transition-all
                    ${
                      estPomodoros === count
                        ? 'bg-sage-100 dark:bg-sage-900 border-sage-600 text-sage-900 dark:text-sage-100 ring-1 ring-sage-600'
                        : 'border-surface-border bg-white dark:bg-surface-card text-content-secondary hover:bg-surface-subtle'
                    }
                  `}
                >
                  {count} ◷
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary">
                Due Date
              </label>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="text-[11px] text-content-muted hover:text-content-primary underline"
                >
                  Clear date
                </button>
              )}
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-surface-border bg-white dark:bg-surface-card px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>

        {/* Confidence rating */}
        <ConfidenceSlider
          value={confidence}
          onChange={setConfidence}
          label="Readiness (1-10)"
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
          <Button variant="ghost" size="md" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
