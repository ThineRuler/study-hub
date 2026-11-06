import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { Button } from '../components/common/Button';
import { OverrunModal } from '../components/tasks/OverrunModal';
import {
  Check,
  Play,
  Pause,
  AlertCircle,
  Plus,
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
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < todayStr);

  // Group Map for fast name lookup
  const groupMap = new Map(groups.map((g) => [g._id, g]));

  // Metrics
  const totalTasks = tasks.length + completedTasks.length;
  const completedCount = completedTasks.length;
  const pomodorosCompleted = completedTasks.reduce((sum, t) => sum + (t.estPomodoros || 1), 0);
  const pomodorosRemaining = tasks.reduce((sum, t) => sum + (t.estPomodoros || 1), 0);
  const dailyCap = user?.settings?.dailyCap || 8;

  const currentFocusTask = tasks[0];

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
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
          <span>DAILY DIGEST</span>
          <span>·</span>
          <span>{todayFormatted}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          A little forward, {user?.displayName ? user.displayName.split(' ')[0] : 'there'}.
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          {tasks.length > 0
            ? `${tasks.length} manageable steps queued. A clearer end to your day.`
            : 'Your day is clear. Add a task or relax!'}
        </p>
      </div>

      {/* Past Due Alert Banner (if any tasks are overdue) */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-950">
                Past Due: {overdueTasks[0].name} was missed
              </p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
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
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors shrink-0"
          >
            Review task
          </button>
        </div>
      )}

      {/* Top 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Today's Task Completion */}
        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
              Today's task completion
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-content-primary">
                {completedCount} of {totalTasks}
              </span>
              <span className="text-xs text-content-secondary font-medium">tasks done</span>
            </div>
            <p className="text-xs text-content-muted mt-0.5">
              {completedCount} completed · {tasks.length} remaining
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-subtle mt-4 overflow-hidden">
            <div
              className="h-full bg-sage-600 rounded-full transition-all duration-300"
              style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Today's Pomodoros Counter */}
        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
              Today's Pomodoros
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-content-primary">
                {pomodorosCompleted} / {dailyCap}
              </span>
              <span className="text-xs text-content-secondary font-medium">sessions</span>
            </div>
            <p className="text-xs text-sage-700 font-medium mt-0.5">
              {pomodorosRemaining > 0
                ? `${pomodorosRemaining} sessions to go. One small step at a time.`
                : 'All queued sessions finished!'}
            </p>
          </div>
          <div className="flex gap-1.5 mt-4">
            {Array.from({ length: dailyCap }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < pomodorosCompleted ? 'bg-sage-600' : 'bg-surface-subtle'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mini Pomodoro Focus Widget */}
        <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
              Ready when you are
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sage-100 text-sage-800">
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
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-content-primary">Today's next steps</h3>
              <p className="text-xs text-content-muted">
                Your order is a guide, not a judgment. Ranked by priority and readiness.
              </p>
            </div>
            <span className="text-xs font-semibold text-content-secondary">
              {tasks.length} tasks · {pomodorosRemaining} Pomodoros
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-surface-border bg-white text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-content-primary">You're all caught up!</h4>
              <p className="text-xs text-content-secondary max-w-sm mx-auto leading-relaxed">
                No active tasks in your queue right now. Click "Create Task" in the sidebar to add a new project or reminder.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((task, idx) => {
                const grp = task.groupId ? groupMap.get(task.groupId) : undefined;
                return (
                  <div
                    key={task._id}
                    onClick={() => handleToggle(task._id, false)}
                    className="p-4 rounded-2xl border border-surface-border bg-white hover:border-sage-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <button
                        type="button"
                        className="w-6 h-6 rounded-lg border border-surface-border group-hover:border-sage-500 bg-white flex items-center justify-center transition-colors"
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
                          {task.dueDate && (
                            <>
                              <span>·</span>
                              <span className={task.dueDate <= todayStr ? 'text-red-600 font-bold' : ''}>
                                Due {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-surface-subtle text-content-primary border border-surface-border">
                        {task.estPomodoros || 1} ◷
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Finished Today Summary Box */}
          <div className="p-4 rounded-xl border border-surface-border bg-white/70">
            <p className="text-xs text-content-secondary">
              <strong className="text-content-primary">Done today:</strong>{' '}
              {completedTasks.length > 0
                ? completedTasks.map((t) => `${t.name} · ${t.estPomodoros || 1} ◷`).join(', ')
                : 'No tasks completed yet today. Start with a gentle work session!'}
            </p>
          </div>
        </div>

        {/* Parent Task Overview (Right Column) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <span className="text-xs font-bold uppercase tracking-wider text-sage-700">
                ACTIVE WORKSPACE
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sage-50 text-sage-800">
                {groups.length} categories
              </span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-content-primary">
                {currentFocusTask ? currentFocusTask.name : 'Ready to begin'}
              </h4>
              <p className="text-xs text-content-muted mt-0.5">
                {tasks.length} total tasks scheduled in queue
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-content-secondary font-medium">
                <span>{completedCount} finished</span>
                <span>{totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
                <div
                  className="h-full bg-sage-600 rounded-full transition-all"
                  style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-sage-50/70 border border-sage-200">
              <p className="text-xs text-sage-800 leading-relaxed font-medium">
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
