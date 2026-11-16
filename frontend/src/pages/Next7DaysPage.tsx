import React, { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { computeClientSchedule, getLocalDateString, isCompletedToday } from '../utils/scheduler';
import { TaskActionsMenu } from '../components/tasks/TaskActionsMenu';
import { AlertCircle } from 'lucide-react';

export const Next7DaysPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, completedTasks, groups, toggleTask } = useTasks();

  const dailyCap = user?.settings?.dailyCap || 8;
  const groupMap = new Map(groups.map((g) => [g._id, g]));

  const todayStr = getLocalDateString();
  const allTasks = useMemo(() => [...tasks, ...completedTasks], [tasks, completedTasks]);

  // Exclude parent workspace containers from completed today so pomodoros are not double counted
  const completedToday = useMemo(() => {
    return completedTasks.filter((t) => {
      if (t.isWorkspace) return false;
      if (allTasks.some((other) => other.parentTaskId === t._id)) return false;
      return isCompletedToday(t.completedAt || t.updatedAt, todayStr);
    });
  }, [completedTasks, allTasks, todayStr]);

  const pomodorosCompletedToday = useMemo(() => {
    return completedToday.reduce((sum, t) => sum + (t.estPomodoros || 1), 0);
  }, [completedToday]);

  // Run the complete task scheduling algorithm across tasks and user settings
  const schedule = useMemo(() => {
    return computeClientSchedule(
      tasks,
      {
        dailyCap,
        weights: user?.settings?.weights,
        invertConfidence: user?.settings?.invertConfidence,
      },
      {
        completedTodayPomodoros: pomodorosCompletedToday,
      }
    );
  }, [tasks, dailyCap, user?.settings?.weights, user?.settings?.invertConfidence, pomodorosCompletedToday]);

  const sevenDays = schedule.dayBuckets;
  const totalWeekPomodoros = sevenDays.reduce((sum, d) => sum + d.usedPomodoros, 0);
  const overflowTasks = schedule.deferredTasks.filter((t) => t.scheduledDay == null || t.scheduledDay >= 7);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 dark:text-sage-400 mb-1">
          <span>YOUR ROLLING PLAN</span>
          <span>·</span>
          <span>NEXT 7 DAYS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          Looking a week ahead.
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          Tasks are balanced across the next 7 days within your {dailyCap}-pomodoro focus target.
        </p>
      </div>

      {/* Target exceeded warning if multiple tasks are due on the same day */}
      {sevenDays.some((col) => col.usedPomodoros > dailyCap) && (
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-950 dark:text-amber-100">
              Focus target exceeded on certain days
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
              Because certain tasks are due on specific dates, they cannot be pushed back past their due date and might exceed your daily {dailyCap}-pomodoro limit.
            </p>
          </div>
        </div>
      )}

      {/* 7 Columns Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        {sevenDays.map((col) => (
          <div
            key={col.dateStr}
            className={`
              flex flex-col rounded-2xl border p-3.5 transition-all
              ${
                col.usedPomodoros > dailyCap
                  ? col.isToday
                    ? 'border-amber-400 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-950/30 shadow-xs ring-1 ring-amber-300 dark:ring-amber-700'
                    : 'border-amber-300 dark:border-amber-800/80 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs'
                  : col.isToday
                  ? 'border-sage-400 bg-sage-50/60 dark:bg-sage-950/30 shadow-xs ring-1 ring-sage-300 dark:ring-sage-800'
                  : 'border-surface-border bg-white dark:bg-surface-card shadow-xs'
              }
            `}
          >
            {/* Column Header */}
            <div className="border-b border-surface-border pb-2.5 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sage-800 dark:text-sage-300">
                  {col.dayLabel}
                </span>
                <span className="text-sm font-extrabold text-content-primary">
                  {col.dateNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-content-muted mt-1">
                <span className="font-semibold text-content-primary">
                  {col.usedPomodoros} / {dailyCap} ◷
                </span>
                {col.usedPomodoros > dailyCap && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                    +{col.usedPomodoros - dailyCap} over
                  </span>
                )}
              </div>
            </div>

            {/* Task Cards in Column */}
            <div className="space-y-2 flex-1 min-h-[160px] flex flex-col">
              {col.tasks.map((t) => {
                const grp = t.groupId ? groupMap.get(t.groupId) : undefined;
                return (
                  <div
                    key={t._id}
                    onClick={() => toggleTask(t._id, false)}
                    className="p-2.5 rounded-xl border border-surface-border bg-white dark:bg-surface-card hover:border-sage-300 dark:hover:border-sage-700 text-xs transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-semibold text-content-primary group-hover:text-sage-800 dark:group-hover:text-sage-300 transition-colors flex-1">
                        {t.name}
                      </p>
                      <TaskActionsMenu task={t} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-xs text-content-muted">
                      {grp && (
                        <span className="font-medium truncate max-w-[70px]" style={{ color: grp.color }}>
                          {grp.name}
                        </span>
                      )}
                      <span className="font-mono font-bold bg-surface-subtle px-1.5 py-0.5 rounded ml-auto">
                        {t.estPomodoros || 1} ◷
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Empty day placeholder */}
              {col.tasks.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-3 rounded-xl border border-dashed border-surface-border text-center min-h-[120px]">
                  <p className="text-xs font-medium text-content-muted">
                    No tasks
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer Box */}
      <div className="p-5 rounded-2xl bg-white dark:bg-surface-card border border-surface-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-content-primary">
            {totalWeekPomodoros} estimated Pomodoros across the next 7 days
          </h4>
          <p className="text-xs text-content-secondary mt-0.5">
            Every day is capped at your {dailyCap}-session focus target to pace your effort and prevent burnout. Click any task to mark it complete.
          </p>
        </div>
      </div>

      {/* Overflow Tasks Beyond Day 6 */}
      {overflowTasks.length > 0 && (
        <div className="p-5 rounded-2xl bg-surface-subtle/50 dark:bg-surface-card/40 border border-dashed border-surface-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-content-primary">
                Deferred Beyond 7 Days ({overflowTasks.length} {overflowTasks.length === 1 ? 'task' : 'tasks'})
              </h4>
              <p className="text-xs text-content-secondary mt-0.5">
                These tasks will automatically roll into your schedule as earlier tasks are completed or days advance.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {overflowTasks.map((t) => {
              const grp = t.groupId ? groupMap.get(t.groupId) : undefined;
              return (
                <div
                  key={t._id}
                  onClick={() => toggleTask(t._id, false)}
                  className="p-3 rounded-xl border border-surface-border bg-white dark:bg-surface-card text-xs cursor-pointer hover:border-sage-300 transition-colors flex items-center justify-between group"
                >
                  <div className="truncate mr-2 flex-1">
                    <p className="font-semibold text-content-primary truncate">{t.name}</p>
                    {grp && (
                      <span className="text-xs font-medium" style={{ color: grp.color }}>
                        {grp.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono font-bold bg-surface-subtle px-1.5 py-0.5 rounded">
                      {t.estPomodoros || 1} ◷
                    </span>
                    <TaskActionsMenu task={t} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
