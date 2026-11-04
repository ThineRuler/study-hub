import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';

export const CompletedPage: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState([
    { id: '1', name: 'Outline case study', group: 'Work', date: 'Today · Oct 30', pomodoros: 2 },
    { id: '2', name: 'Take a mindful walk', group: 'Personal', date: 'Today · Oct 30', pomodoros: 1 },
    { id: '3', name: 'Update profile bio', group: 'Work', date: 'Yesterday · Oct 29', pomodoros: 1 },
    { id: '4', name: 'Organize reading list', group: 'Learning', date: 'Wed · Oct 28', pomodoros: 1 },
    { id: '5', name: 'Review project brief', group: 'Work', date: 'Mon · Oct 26', pomodoros: 2 },
    { id: '6', name: 'Set up weekly journal', group: 'Personal', date: 'Mon · Oct 26', pomodoros: 1 },
  ]);

  const handleRestore = (id: string) => {
    setCompletedTasks(completedTasks.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
            <span>COMPLETED</span>
            <span>·</span>
            <span>SMALL WINS ADD UP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            Look how far you've come.
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            Here's the work you've already made room for.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm('Clear completed history?')) setCompletedTasks([]);
          }}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Clear history
        </Button>
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
            Total Pomodoros
          </span>
          <p className="text-3xl font-extrabold text-content-primary mt-1">8</p>
          <p className="text-xs text-content-muted mt-0.5">Across all completed tasks</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
            Tasks completed
          </span>
          <p className="text-3xl font-extrabold text-content-primary mt-1">{completedTasks.length}</p>
          <p className="text-xs text-content-muted mt-0.5">All time · includes subtasks</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
            This week's Pomodoros
          </span>
          <p className="text-3xl font-extrabold text-sage-700 mt-1">8</p>
          <p className="text-xs text-content-muted mt-0.5">Oct 26 – Nov 1 · 6 tasks</p>
        </div>
      </div>

      {/* List of Finished Items */}
      <div className="space-y-2.5">
        {completedTasks.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-2xl border border-surface-border bg-white shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-content-primary">{t.name}</p>
                <div className="flex items-center gap-2 text-xs text-content-muted mt-0.5">
                  <span className="font-semibold text-sage-800">{t.group}</span>
                  <span>·</span>
                  <span>{t.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-surface-subtle border border-surface-border">
                {t.pomodoros} Pomodoros
              </span>
              <button
                type="button"
                onClick={() => handleRestore(t.id)}
                className="text-xs font-semibold text-sage-700 hover:text-sage-800 hover:underline flex items-center gap-1"
                title="Return task to active plan"
              >
                <RotateCcw className="w-3 h-3" />
                Restore
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border text-xs text-content-muted leading-relaxed">
        Restoring a task returns it to the active plan. Your history stays easy to review, without streaks or pressure.
      </div>
    </div>
  );
};
