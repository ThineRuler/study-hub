import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ConfidenceSlider } from '../common/ConfidenceSlider';
import { Calendar, Tag, Clock } from 'lucide-react';
import { Task } from '../../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Partial<Task>) => void;
  availableGroups?: string[];
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  availableGroups = ['Work', 'Personal', 'Learning'],
}) => {
  const [name, setName] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['Work']);
  const [estPomodoros, setEstPomodoros] = useState(1);
  const [confidence, setConfidence] = useState(8);
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  const toggleGroup = (grp: string) => {
    setSelectedGroups((prev) =>
      prev.includes(grp) ? prev.filter((g) => g !== grp) : [...prev, grp]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddTask({
      id: `task_${Date.now()}`,
      name: name.trim(),
      groupIds: selectedGroups,
      estPomodoros,
      confidence,
      dueDate,
      completed: false,
    });

    setName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Add Task"
      subtitle="Capture an errand, note, or quick step in seconds."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Task Name"
          placeholder="e.g. Clear client inbox or Reply to feedback"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Groups selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-2">
            Assign Groups
          </label>
          <div className="flex flex-wrap gap-2">
            {availableGroups.map((grp) => {
              const active = selectedGroups.includes(grp);
              return (
                <button
                  key={grp}
                  type="button"
                  onClick={() => toggleGroup(grp)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                    ${
                      active
                        ? 'bg-sage-600 text-white border-sage-600 shadow-xs'
                        : 'bg-white border-surface-border text-content-secondary hover:border-sage-300'
                    }
                  `}
                >
                  {grp}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pomodoros and Due Date row */}
        <div className="grid grid-cols-2 gap-4">
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
                        ? 'bg-sage-100 border-sage-600 text-sage-900 ring-1 ring-sage-600'
                        : 'border-surface-border bg-white text-content-secondary hover:bg-surface-subtle'
                    }
                  `}
                >
                  {count} ◷
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-surface-border bg-white px-3 py-2 text-content-primary focus:outline-none focus:ring-2 focus:ring-sage-500"
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
          <Button variant="ghost" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit">
            Add Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
