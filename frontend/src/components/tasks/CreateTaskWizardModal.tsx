import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ConfidenceSlider } from '../common/ConfidenceSlider';
import { useTasks } from '../../context/TaskContext';
import { Plus, Trash2, ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface CreateTaskWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LocalSubtask {
  id: string;
  name: string;
  confidence: number;
  estPomodoros: number;
}

export const CreateTaskWizardModal: React.FC<CreateTaskWizardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { groups, createTask } = useTasks();
  const [step, setStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState('');
  const [subtasks, setSubtasks] = useState<LocalSubtask[]>([]);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [linkSubtaskDates, setLinkSubtaskDates] = useState(true);
  const [mainConfidence, setMainConfidence] = useState(8);
  const [mainPomodoros, setMainPomodoros] = useState(1);
  const [activeSubtaskIndex, setActiveSubtaskIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const activeGroupId = selectedGroupId || (groups[0]?._id ?? '');

  const handleAddSubtask = () => {
    if (!newSubtaskName.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: String(Date.now()),
        name: newSubtaskName.trim(),
        confidence: 8,
        estPomodoros: 1,
      },
    ]);
    setNewSubtaskName('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const updateSubtask = (index: number, partial: Partial<LocalSubtask>) => {
    const updated = [...subtasks];
    updated[index] = { ...updated[index], ...partial };
    setSubtasks(updated);
  };

  const totalPomodoros =
    subtasks.length > 0
      ? subtasks.reduce((sum, s) => sum + s.estPomodoros, 0)
      : mainPomodoros;

  const handleFinalSubmit = async () => {
    if (!name.trim()) {
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Create Parent Task
      const parent = await createTask({
        name: name.trim(),
        groupId: activeGroupId || undefined,
        dueDate,
        importance: Math.min(1, Math.max(0, mainConfidence / 10)),
        estPomodoros: totalPomodoros,
      });

      // 2. Create subtasks if any
      if (subtasks.length > 0 && parent._id) {
        for (const st of subtasks) {
          await createTask({
            name: st.name,
            parentTaskId: parent._id,
            groupId: activeGroupId || undefined,
            dueDate: linkSubtaskDates ? dueDate : undefined,
            importance: Math.min(1, Math.max(0, st.confidence / 10)),
            estPomodoros: st.estPomodoros,
          });
        }
      }

      // Reset
      setName('');
      setSubtasks([]);
      setStep(1);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task wizard items');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    'Name your task',
    'Create subtasks',
    'Assign Group',
    'Set a due date',
    'Set confidence',
    'Set time to complete',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`CREATE TASK · Step ${step} of 6`}
      subtitle={stepTitles[step - 1]}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-xs text-red-700 font-medium border border-red-200">
            {error}
          </div>
        )}

        {/* Wizard Step Breadcrumbs */}
        <div className="flex items-center justify-between text-xs text-content-muted border-b border-surface-border pb-3 overflow-x-auto">
          {stepTitles.map((title, idx) => {
            const num = idx + 1;
            const isCurrent = step === num;
            const isPast = step > num;
            return (
              <span
                key={num}
                className={`font-semibold shrink-0 px-2 py-1 rounded-md ${
                  isCurrent
                    ? 'text-sage-800 bg-sage-100'
                    : isPast
                    ? 'text-sage-600'
                    : 'text-content-muted'
                }`}
              >
                {num} · {title.split(' ')[0]}
              </span>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[280px]">
          {/* STEP 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-content-primary">What's on your mind?</h4>
                <p className="text-sm text-content-secondary">
                  Start with the thing you want to move forward. It doesn't have to be perfectly defined.
                </p>
              </div>
              <Input
                label="Task Name"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                helperText="Keep it clear and personal. You'll break it into steps next."
              />
              <div className="p-4 rounded-xl bg-sage-50 border border-sage-200">
                <p className="text-xs text-sage-800 font-medium">
                  💡 Big is okay here. If this feels too much for one sitting, we'll help you give it a few smaller tasks.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Subtasks */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-content-primary">
                  What would make this easier to start?
                </h4>
                <p className="text-sm text-content-secondary">
                  Break <strong className="text-content-primary">{name || 'your task'}</strong> into smaller actions. This step is optional.
                </p>
              </div>

              {subtasks.length > 0 ? (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {subtasks.map((st, i) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-surface-border bg-surface-bg"
                    >
                      <span className="text-sm font-medium text-content-primary">
                        {i + 1}. {st.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(st.id)}
                        className="text-content-muted hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-surface-border text-center text-xs text-content-muted">
                  No subtasks added yet. Type below to add bite-sized steps, or skip to continue.
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newSubtaskName}
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                />
                <Button type="button" variant="secondary" onClick={handleAddSubtask}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Assign Group */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-content-primary">Where does this belong?</h4>
                <p className="text-sm text-content-secondary">
                  Choose a category for your project.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {groups.map((grp) => {
                  const selected = activeGroupId === grp._id;
                  return (
                    <div
                      key={grp._id}
                      onClick={() => setSelectedGroupId(grp._id)}
                      className={`
                        p-4 rounded-xl border cursor-pointer transition-all
                        ${
                          selected
                            ? 'border-sage-600 bg-sage-50/80 ring-2 ring-sage-600/20'
                            : 'border-surface-border bg-white hover:border-sage-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-content-primary">{grp.name}</span>
                        {selected && <Check className="w-4 h-4 text-sage-700" />}
                      </div>
                      <span className="text-xs text-content-muted">
                        {grp.taskCount || 0} active tasks
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Due Date */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-content-primary">When does it need to be done?</h4>
                <p className="text-sm text-content-secondary">
                  Choose the finish line, not the work sessions. StudyHub will plan the steps before it.
                </p>
              </div>

              <div className="max-w-xs">
                <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1">
                  Due date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-sm font-medium rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-content-primary focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>

              {subtasks.length > 0 && (
                <label className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-border bg-surface-subtle/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkSubtaskDates}
                    onChange={(e) => setLinkSubtaskDates(e.target.checked)}
                    className="w-4 h-4 text-sage-600 rounded border-surface-border focus:ring-sage-500"
                  />
                  <div>
                    <p className="text-xs font-semibold text-content-primary">Link subtask due dates to parent</p>
                    <p className="text-[11px] text-content-muted">
                      When on, all subtasks inherit the parent due date automatically.
                    </p>
                  </div>
                </label>
              )}
            </div>
          )}

          {/* STEP 5: Confidence */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-content-primary">How ready do you feel?</h4>
                <p className="text-sm text-content-secondary">
                  An honest starting point helps StudyHub build momentum. High readiness tasks schedule first to spark flow state.
                </p>
              </div>

              {subtasks.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-surface-border bg-white shadow-xs">
                    <p className="text-xs font-bold text-sage-700 uppercase tracking-wider mb-2">
                      Subtask {activeSubtaskIndex + 1} of {subtasks.length}: {subtasks[activeSubtaskIndex]?.name}
                    </p>
                    <ConfidenceSlider
                      value={subtasks[activeSubtaskIndex]?.confidence || 8}
                      onChange={(val) => updateSubtask(activeSubtaskIndex, { confidence: val })}
                    />
                  </div>

                  <div className="flex gap-1 overflow-x-auto py-1">
                    {subtasks.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActiveSubtaskIndex(idx)}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 border
                          ${
                            activeSubtaskIndex === idx
                              ? 'bg-sage-600 text-white border-sage-600'
                              : 'bg-white border-surface-border text-content-secondary hover:border-sage-300'
                          }
                        `}
                      >
                        {s.name.slice(0, 16)}... ({s.confidence}/10)
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <ConfidenceSlider value={mainConfidence} onChange={setMainConfidence} />
              )}
            </div>
          )}

          {/* STEP 6: Pomodoros */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-content-primary">How much focus might each step need?</h4>
                <p className="text-sm text-content-secondary">
                  Sessions are 25-minute Pomodoros. Keep tasks within your 4-session focus cap.
                </p>
              </div>

              {subtasks.length > 0 ? (
                <div className="space-y-3">
                  {subtasks.map((st, i) => (
                    <div
                      key={st.id}
                      className="p-3 rounded-xl border border-surface-border bg-white flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-content-primary">{st.name}</p>
                        <span className="text-xs text-content-muted">Confidence: {st.confidence}/10</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4].map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => updateSubtask(i, { estPomodoros: count })}
                            className={`
                              w-8 h-8 rounded-lg text-xs font-bold border transition-all
                              ${
                                st.estPomodoros === count
                                  ? 'bg-sage-600 text-white border-sage-600'
                                  : 'bg-white border-surface-border text-content-secondary hover:bg-surface-subtle'
                              }
                            `}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setMainPomodoros(count)}
                      className={`
                        flex-1 py-3 rounded-xl text-sm font-bold border transition-all
                        ${
                          mainPomodoros === count
                            ? 'bg-sage-600 text-white border-sage-600'
                            : 'bg-white border-surface-border text-content-secondary hover:bg-surface-subtle'
                        }
                      `}
                    >
                      {count} Pomodoros
                    </button>
                  ))}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-between">
                <span className="text-xs font-bold text-sage-800">
                  Total: {totalPomodoros} Pomodoro sessions
                </span>
                <span className="text-xs text-sage-700 font-medium">
                  ✓ Within healthy focus capacity
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-border">
          {step > 1 ? (
            <Button variant="ghost" size="md" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          ) : (
            <Button variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
          )}

          {step < 6 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (step === 1 && !name.trim()) return;
                setStep(step + 1);
              }}
            >
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleFinalSubmit} isLoading={isSubmitting}>
              <Check className="w-4 h-4 mr-1" /> Create Task
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
