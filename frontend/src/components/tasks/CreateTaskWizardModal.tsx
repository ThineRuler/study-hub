import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ConfidenceSlider } from '../common/ConfidenceSlider';
import { Task, Subtask } from '../../types';
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, Calendar, Tag, ShieldCheck } from 'lucide-react';

interface CreateTaskWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Partial<Task>) => void;
}

export const CreateTaskWizardModal: React.FC<CreateTaskWizardModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState('Launch portfolio');
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: '1', name: 'Choose featured projects', confidence: 8, estPomodoros: 2, completed: false },
    { id: '2', name: 'Write project summaries', confidence: 6, estPomodoros: 3, completed: false },
    { id: '3', name: 'Polish portfolio layout', confidence: 3, estPomodoros: 2, completed: false },
    { id: '4', name: 'Publish portfolio', confidence: 1, estPomodoros: 1, completed: false },
  ]);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['Work', 'Personal']);
  const [dueDate, setDueDate] = useState('2026-11-03');
  const [linkSubtaskDates, setLinkSubtaskDates] = useState(true);
  const [mainConfidence, setMainConfidence] = useState(8);
  const [mainPomodoros, setMainPomodoros] = useState(2);
  const [activeSubtaskIndex, setActiveSubtaskIndex] = useState(0);

  const availableGroups = ['Work', 'Personal', 'Learning'];

  const handleAddSubtask = () => {
    if (!newSubtaskName.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: String(Date.now()),
        name: newSubtaskName.trim(),
        confidence: 8,
        estPomodoros: 2,
        completed: false,
      },
    ]);
    setNewSubtaskName('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const updateSubtask = (index: number, partial: Partial<Subtask>) => {
    const updated = [...subtasks];
    updated[index] = { ...updated[index], ...partial };
    setSubtasks(updated);
  };

  const totalPomodoros =
    subtasks.length > 0
      ? subtasks.reduce((sum, s) => sum + s.estPomodoros, 0)
      : mainPomodoros;

  const handleFinalSubmit = () => {
    onSaveTask({
      id: `task_${Date.now()}`,
      name,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      groupIds: selectedGroups,
      dueDate,
      confidence: mainConfidence,
      estPomodoros: totalPomodoros,
      linkSubtaskDueDates: linkSubtaskDates,
      completed: false,
    });
    onClose();
    setStep(1);
  };

  const stepTitles = [
    'Name your task',
    'Create subtasks',
    'Assign Groups',
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Launch portfolio"
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
                  Break <strong className="text-content-primary">{name}</strong> into smaller actions. This step is optional.
                </p>
              </div>

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

              <div className="flex gap-2">
                <Input
                  placeholder="Name a bite-sized action..."
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

          {/* STEP 3: Assign Groups */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-content-primary">Where does this belong?</h4>
                <p className="text-sm text-content-secondary">
                  Choose any groups that fit. You don't have to pick just one.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableGroups.map((grp) => {
                  const selected = selectedGroups.includes(grp);
                  return (
                    <div
                      key={grp}
                      onClick={() => {
                        setSelectedGroups((prev) =>
                          prev.includes(grp) ? prev.filter((g) => g !== grp) : [...prev, grp]
                        );
                      }}
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
                        <span className="font-bold text-sm text-content-primary">{grp}</span>
                        {selected && <Check className="w-4 h-4 text-sage-700" />}
                      </div>
                      <p className="text-xs text-content-muted">
                        {grp === 'Work' && 'Professional projects and everyday work'}
                        {grp === 'Personal' && 'Life outside the task list'}
                        {grp === 'Learning' && 'Ideas, skills and curiosity'}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-content-muted">
                {selectedGroups.length} groups selected ({selectedGroups.join(', ')}). All subtasks inherit these tags.
              </p>
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
                  Parent task due date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-sm font-medium rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-content-primary focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>

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
            <Button variant="primary" size="md" onClick={() => setStep(step + 1)}>
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleFinalSubmit}>
              <Check className="w-4 h-4 mr-1" /> Create Task
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
