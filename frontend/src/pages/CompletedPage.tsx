import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Button } from '../components/common/Button';
import { CheckCircle2, RotateCcw, Trash2, Award } from 'lucide-react';

export const CompletedPage: React.FC = () => {
  const { completedTasks, groups, toggleTask, deleteTask } = useTasks();

  const groupMap = new Map(groups.map((g) => [g._id, g]));

  const totalPomodorosCompleted = completedTasks.reduce((sum, t) => sum + (t.estPomodoros || 1), 0);

  const handleRestore = async (id: string) => {
    await toggleTask(id, true);
  };

  const handleClearHistory = async () => {
    if (completedTasks.length === 0) return;
    if (confirm('Clear all completed task history?')) {
      for (const t of completedTasks) {
        await deleteTask(t._id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
            <span>COMPLETED</span>
            <span>·</span>
            <span>LOOK HOW FAR YOU'VE COME</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            Small wins add up.
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            Here's the work you've already made room for.
          </p>
        </div>

        {completedTasks.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearHistory}>
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear history
          </Button>
        )}
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
            Total Pomodoros Finished
          </span>
          <p className="text-3xl font-extrabold text-sage-700 mt-1">{totalPomodorosCompleted}</p>
          <p className="text-xs text-content-muted mt-0.5">Across all finished focus sessions</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
            Tasks Completed
          </span>
          <p className="text-3xl font-extrabold text-content-primary mt-1">{completedTasks.length}</p>
          <p className="text-xs text-content-muted mt-0.5">All time archive</p>
        </div>
      </div>

      {/* List of Finished Items */}
      {completedTasks.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-surface-border rounded-3xl space-y-3">
          <Award className="w-10 h-10 text-sage-600 mx-auto" />
          <h3 className="text-base font-bold text-content-primary">No completed tasks yet</h3>
          <p className="text-xs text-content-secondary max-w-sm mx-auto">
            Once you check off tasks in Daily Digest or Next 7 Days, they'll appear here as your personal history.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {completedTasks.map((t) => {
            const grp = t.groupId ? groupMap.get(t.groupId) : undefined;
            return (
              <div
                key={t._id}
                className="p-4 rounded-2xl border border-surface-border bg-white shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-content-primary line-through">{t.name}</p>
                    <div className="flex items-center gap-2 text-xs text-content-muted mt-0.5">
                      {grp && (
                        <span className="font-semibold text-xs" style={{ color: grp.color }}>
                          {grp.name}
                        </span>
                      )}
                      {t.completedAt && (
                        <span>· Finished {new Date(t.completedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-surface-subtle border border-surface-border">
                    {t.estPomodoros || 1} Pomodoros
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRestore(t._id)}
                    className="text-xs font-semibold text-sage-700 hover:text-sage-800 hover:underline flex items-center gap-1"
                    title="Return task to active plan"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
