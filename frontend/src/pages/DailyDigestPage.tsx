import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { Button } from '../components/common/Button';
import { OverrunModal } from '../components/tasks/OverrunModal';
import { TaskActionsMenu } from '../components/tasks/TaskActionsMenu';
import { computeClientSchedule, formatDueDate, getLocalDateString, parseCalendarDate } from '../utils/scheduler';
import {
  Play,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const DailyDigestPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, completedTasks, groups, toggleTask } = useTasks();

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [showOverrunModal, setShowOverrunModal] = useState(false);
  const [overrunTaskName, setOverrunTaskName] = useState('');

  // Find overdue tasks
  const todayStr = getLocalDateString();
  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const parsed = parseCalendarDate(t.dueDate);
    return parsed ? parsed.dateStr < todayStr : false;
  });

  // Group Map for fast name lookup
  const groupMap = new Map(groups.map((g) => [g._id, g]));

  const dailyCap = user?.settings?.dailyCap || 8;

  // Combined tasks
  const allTasks = useMemo(() => [...tasks, ...completedTasks], [tasks, completedTasks]);

  // Actionable completed today metrics (exclude parent workspace containers to avoid double-counting pomodoros)
  const completedToday = useMemo(() => {
    return completedTasks.filter((t) => {
      if (!t.completedAt) return false;
      if (t.isWorkspace) return false;
      if (allTasks.some((other) => other.parentTaskId === t._id)) return false;
      const parts = parseCalendarDate(t.completedAt);
      return parts ? parts.dateStr === todayStr : false;
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

  const { todayTasks, todayPomodoros } = schedule;

  const activeWorkspaces = useMemo(() => {
    return tasks.filter((t) => t.isWorkspace || allTasks.some((other) => other.parentTaskId === t._id));
  }, [tasks, allTasks]);

  const actionableActiveTasks = useMemo(() => {
    return tasks.filter((t) => !t.isWorkspace && !allTasks.some((other) => other.parentTaskId === t._id));
  }, [tasks, allTasks]);

  const currentFocusTask = todayTasks[0] || actionableActiveTasks[0];

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggle = async (id: string, completed: boolean) => {
    await toggleTask(id, completed);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 dark:text-sage-300 mb-1">
          <span>DAILY DIGEST</span>
          <span>·</span>
          <span>{todayFormatted}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          A little forward, {user?.displayName ? user.displayName.split(' ')[0] : 'there'}.
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          {todayTasks.length > 0 || completedToday.length > 0
            ? `${todayTasks.length} steps scheduled for today (${todayPomodoros} ◷ planned).`
            : 'Your day is clear. Add a task or relax!'}
        </p>
      </div>

      {/* Past Due Alert Banner (if any tasks are overdue) */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-950 dark:text-amber-100">
                Past Due: {overdueTasks[0].name} was missed
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                Moved to today and your plan was recalculated. This is your one reminder—you can take it from here.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setOverrunTaskName(overdueTasks[0].name);
              setShowOverrunModal(true);
            }}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-200 transition-colors shrink-0"
          >
            Review task
          </button>
        </div>
      )}

      {/* Capacity Warning Banner (When tasks due today exceed daily target and can't be pushed back) */}
      {(pomodorosCompletedToday + todayPomodoros) > dailyCap && (
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-950 dark:text-amber-100">
              Focus target exceeded ({pomodorosCompletedToday + todayPomodoros} of {dailyCap} ◷ today)
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
              Because certain tasks are due today, you might have to go over your daily limit. The algorithm will not push tasks past their due date.
            </p>
          </div>
        </div>
      )}

      {/* Top 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Today's Task Completion */}
        <div className="p-5 rounded-2xl bg-white dark:bg-surface-card border border-surface-border shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
              Today's task completion
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-content-primary">
                {completedToday.length} of {completedToday.length + todayTasks.length}
              </span>
              <span className="text-xs text-content-secondary font-medium">scheduled done</span>
            </div>
            <p className="text-xs text-content-muted mt-0.5">
              {completedToday.length} completed · {todayTasks.length} planned today
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-subtle mt-4 overflow-hidden">
            <div
              className="h-full bg-sage-600 rounded-full transition-all duration-300"
              style={{
                width: `${
                  completedToday.length + todayTasks.length > 0
                    ? (completedToday.length / (completedToday.length + todayTasks.length)) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Today's Pomodoros Counter */}
        <div className="p-5 rounded-2xl bg-white dark:bg-surface-card border border-surface-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Today's Pomodoros
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-content-primary">
                {pomodorosCompletedToday} / {dailyCap}
              </span>
              <span className="text-xs text-content-secondary font-medium">sessions done</span>
            </div>
            <p className="text-xs text-sage-700 dark:text-sage-300 font-medium mt-0.5">
              {todayPomodoros} sessions planned for today
            </p>
          </div>
          <div className="flex gap-1.5 mt-4">
            {Array.from({ length: Math.max(dailyCap, pomodorosCompletedToday + todayPomodoros) }).map((_, i) => {
              const isCompleted = i < pomodorosCompletedToday;
              const isPlanned = !isCompleted && i < (pomodorosCompletedToday + todayPomodoros);
              const isOverCap = i >= dailyCap;
              return (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    isCompleted
                      ? 'bg-sage-600'
                      : isPlanned
                      ? isOverCap
                        ? 'bg-amber-500 dark:bg-amber-600'
                        : 'bg-sage-400 dark:bg-sage-600'
                      : 'bg-surface-subtle'
                  }`}
                  title={
                    isCompleted
                      ? `Session ${i + 1}: Done`
                      : isPlanned
                      ? isOverCap
                        ? `Session ${i + 1}: Planned (over target due to deadlines)`
                        : `Session ${i + 1}: Planned today`
                      : `Session ${i + 1}: Available`
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Mini Pomodoro Focus Widget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-surface-card border border-surface-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
              Ready when you are
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200">
              Work session
            </span>
          </div>
          <div className="flex items-center justify-between my-2">
            <div>
              <p className="text-3xl font-black font-mono text-content-primary">
                {formatTimer(timerSeconds)}
              </p>
              <p className="text-xs text-content-secondary truncate max-w-[150px]">
                {currentFocusTask?.name || 'No task selected'}
              </p>
            </div>
            <Button
              size="sm"
              variant={isTimerRunning ? 'outline' : 'primary'}
              disabled={!currentFocusTask}
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              {isTimerRunning ? 'Pause' : 'Start focus'}
            </Button>
          </div>
          <p className="text-[11px] text-content-muted">25 min work · 5 min recharge</p>
        </div>
      </div>

      {/* Main Task Queue & Parent Task Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ranked Queue (Left Column) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-content-primary">Today's next steps</h3>
              <p className="text-xs text-content-muted">
                Ranked by priority algorithm within your {dailyCap}-pomodoro daily capacity.
              </p>
            </div>
            <span className="text-xs font-semibold text-content-secondary">
              {todayTasks.length} planned today · {todayPomodoros} / {dailyCap} ◷
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-surface-border bg-white dark:bg-surface-card text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sage-100 dark:bg-sage-900 text-sage-700 dark:text-sage-300 flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-content-primary">You're all caught up!</h4>
              <p className="text-xs text-content-secondary max-w-sm mx-auto leading-relaxed">
                No active tasks in your queue right now. Click "Create Task" in the sidebar to add a new project or reminder.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((task, idx) => {
                const grp = task.groupId ? groupMap.get(task.groupId) : undefined;
                return (
                  <div
                    key={task._id}
                    onClick={() => handleToggle(task._id, false)}
                    className="p-4 rounded-2xl border border-surface-border bg-white dark:bg-surface-card hover:border-sage-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <button
                        type="button"
                        className="w-6 h-6 rounded-lg border border-surface-border group-hover:border-sage-500 bg-white dark:bg-surface-card flex items-center justify-center transition-colors"
                      >
                        <span className="text-[10px] font-bold text-content-muted">
                          0{idx + 1}
                        </span>
                      </button>

                      <div>
                        <p className="text-sm font-bold text-content-primary">{task.name}</p>
                        <div className="flex items-center gap-2 text-xs text-content-muted mt-0.5">
                          {grp && (
                            <span
                              className="font-semibold text-xs px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: `${grp.color}20`, color: grp.color }}
                            >
                              {grp.name}
                            </span>
                          )}
                          <span>Importance: {Math.round((task.importance ?? 0.5) * 10)}/10</span>
                          {task.dueDate && (() => {
                            const parsed = parseCalendarDate(task.dueDate);
                            const isDueOrOverdue = parsed ? parsed.dateStr <= todayStr : false;
                            return (
                              <>
                                <span>·</span>
                                <span className={isDueOrOverdue ? 'text-red-600 font-bold' : ''}>
                                  Due {formatDueDate(task.dueDate)}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-surface-subtle text-content-primary border border-surface-border">
                        {task.estPomodoros || 1} ◷
                      </span>
                      <TaskActionsMenu task={task} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Finished Today Summary Box */}
          <div className="p-4 rounded-xl border border-surface-border bg-white/70 dark:bg-surface-card/70">
            <p className="text-xs text-content-secondary">
              <strong className="text-content-primary">Done today:</strong>{' '}
              {completedToday.length > 0
                ? completedToday.map((t) => `${t.name} · ${t.estPomodoros || 1} ◷`).join(', ')
                : 'No tasks completed yet today. Start with a gentle work session!'}
            </p>
          </div>
        </div>

        {/* Active Workspaces (Right Column) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-surface-card border border-surface-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <span className="text-xs font-bold uppercase tracking-wider text-sage-700 dark:text-sage-300">
                ACTIVE WORKSPACE{activeWorkspaces.length > 1 ? 'S' : ''}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sage-50 dark:bg-sage-900/40 text-sage-800 dark:text-sage-200">
                {activeWorkspaces.length} active
              </span>
            </div>

            {activeWorkspaces.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-surface-border text-center space-y-2">
                <p className="text-xs font-semibold text-content-primary">No active workspaces</p>
                <p className="text-[11px] text-content-muted leading-relaxed">
                  Break larger goals into subtasks using the Guided Breakdown in Create Task.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-0.5">
                {activeWorkspaces.map((ws) => {
                  const wsSubtasks = allTasks.filter((t) => t.parentTaskId === ws._id);
                  const totalSub = wsSubtasks.length;
                  const doneSub = wsSubtasks.filter((t) => t.completed).length;
                  const pct = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;
                  const grp = ws.groupId ? groupMap.get(ws.groupId) : undefined;
                  const parsedDue = parseCalendarDate(ws.dueDate);

                  return (
                    <div
                      key={ws._id}
                      className="p-4 rounded-xl border border-surface-border bg-surface-subtle/30 dark:bg-surface-card/60 space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-content-primary truncate">{ws.name}</h4>
                            {grp && (
                              <span
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                                style={{ backgroundColor: `${grp.color}20`, color: grp.color }}
                              >
                                {grp.name}
                              </span>
                            )}
                          </div>
                          {parsedDue && (
                            <p className="text-[11px] text-content-muted mt-0.5">
                              Due {formatDueDate(ws.dueDate)}
                            </p>
                          )}
                        </div>
                        <TaskActionsMenu task={ws} />
                      </div>

                      {/* Progress bar like today's tasks completion bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-content-secondary font-medium">
                          <span>
                            {doneSub} of {totalSub} {totalSub === 1 ? 'subtask' : 'subtasks'} done
                          </span>
                          <span className="font-bold text-content-primary">{pct}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
                          <div
                            className="h-full bg-sage-600 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-sage-50/70 dark:bg-sage-900/40 border border-sage-200 dark:border-sage-800">
              <p className="text-xs text-sage-800 dark:text-sage-200 leading-relaxed font-medium">
                "A little progress is still progress. Every task is scored on its own."
              </p>
            </div>
          </div>
        </div>
      </div>

      <OverrunModal
        isOpen={showOverrunModal}
        onClose={() => setShowOverrunModal(false)}
        taskName={overrunTaskName}
        currentSessions={5}
        onBreakDown={() => setShowOverrunModal(false)}
      />
    </div>
  );
};
