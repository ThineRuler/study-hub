import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTimer } from '../context/TimerContext';
import { Button } from '../components/common/Button';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { formatDueDate, getLocalDateString, isCompletedToday } from '../utils/scheduler';

export const PomodoroTimerPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, completedTasks, groups } = useTasks();
  const {
    mode,
    timeFormatted,
    isActive,
    chimeOn,
    selectedTaskId,
    workDuration,
    breakDuration,
    toggleTimer,
    resetTimer,
    setMode,
    setChimeOn,
    setSelectedTaskId,
  } = useTimer();

  const dailyCap = user?.settings?.dailyCap || 8;
  const groupMap = new Map(groups.map((g) => [g._id, g]));

  const actionableTasks = tasks.filter(
    (t) => !t.isWorkspace && !tasks.some((other) => other.parentTaskId === t._id)
  );
  const currentTaskId = selectedTaskId || actionableTasks[0]?._id;
  const currentTask = actionableTasks.find((t) => t._id === currentTaskId) || actionableTasks[0];
  const currentGroup = currentTask?.groupId ? groupMap.get(currentTask.groupId) : undefined;

  const todayStr = getLocalDateString();
  const pomodorosCompleted = completedTasks
    .filter((t) => {
      if (t.isWorkspace) return false;
      if (completedTasks.some((other) => other.parentTaskId === t._id)) return false;
      return isCompletedToday(t.completedAt || t.updatedAt, todayStr);
    })
    .reduce((sum, t) => sum + (t.estPomodoros || 1), 0);

  const toggleMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 dark:text-sage-400 mb-1">
          <span>POMODORO TIMER</span>
          <span>·</span>
          <span>ONE THING AT A TIME</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          A small stretch of focus.
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          Then a little space to recharge. Select a task to credit your sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Interactive Clock Panel */}
        <div className="lg:col-span-7 rounded-3xl border border-surface-border bg-white dark:bg-surface-card p-8 sm:p-10 shadow-lg text-center space-y-6">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl bg-surface-subtle p-1 border border-surface-border">
            <button
              type="button"
              onClick={() => toggleMode('work')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'work'
                  ? 'bg-white dark:bg-surface-card text-sage-900 dark:text-sage-100 shadow-xs'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              Work ({workDuration} min)
            </button>
            <button
              type="button"
              onClick={() => toggleMode('break')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'break'
                  ? 'bg-white dark:bg-surface-card text-sage-900 dark:text-sage-100 shadow-xs'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              Break ({breakDuration} min)
            </button>
          </div>

          {/* Active Task Tag */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-sage-700 dark:text-sage-400 uppercase tracking-wider">
              {currentGroup?.name || 'General Focus'}
            </span>
            <h3 className="text-lg font-bold text-content-primary">
              {currentTask?.name || 'No task selected'}
            </h3>
            {currentTask && (
              <p className="text-xs text-content-muted">
                {currentTask.estPomodoros || 1} Pomodoro session estimated
              </p>
            )}
          </div>

          {/* Clock Display */}
          <div className="py-4">
            <div className="text-6xl sm:text-7xl font-mono font-black text-content-primary tracking-tight">
              {timeFormatted}
            </div>
            <p className="text-xs font-semibold text-sage-700 dark:text-sage-400 uppercase tracking-widest mt-2">
              {isActive ? 'FOCUS IN PROGRESS' : 'READY FOR A FRESH SESSION'}
            </p>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              variant={isActive ? 'outline' : 'primary'}
              onClick={toggleTimer}
              className="px-8 shadow-sm"
            >
              {isActive ? <Pause className="w-4 h-4 mr-1.5" /> : <Play className="w-4 h-4 mr-1.5" />}
              {isActive ? 'Pause' : 'Start focus'}
            </Button>
            <Button size="lg" variant="ghost" onClick={resetTimer}>
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Reset
            </Button>
          </div>

          {/* Audio Chime Toggle */}
          <div className="pt-4 border-t border-surface-border flex items-center justify-between text-xs text-content-muted">
            <button
              type="button"
              onClick={() => setChimeOn(!chimeOn)}
              className="flex items-center gap-1.5 hover:text-content-primary transition-colors"
            >
              {chimeOn ? <Volume2 className="w-4 h-4 text-sage-600 dark:text-sage-400" /> : <VolumeX className="w-4 h-4" />}
              <span>Chime {chimeOn ? 'on' : 'muted'} (gentle bell at end)</span>
            </button>
            <span>Today: {pomodorosCompleted} / {dailyCap} counted</span>
          </div>
        </div>

        {/* Task Queue Selector */}
        <div className="lg:col-span-5 rounded-3xl border border-surface-border bg-white dark:bg-surface-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-content-primary">Today's queue</h4>
              <p className="text-xs text-content-secondary mt-0.5">
                Select a task to focus on.
              </p>
            </div>
            <span className="text-xs font-semibold text-sage-700 dark:text-sage-400">{actionableTasks.length} queued</span>
          </div>

          {actionableTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-content-muted border border-dashed border-surface-border rounded-xl">
              No active tasks right now. Click "Create Task" in the sidebar to add one.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {actionableTasks.map((t) => {
                const isSelected = t._id === currentTaskId;
                const grp = t.groupId ? groupMap.get(t.groupId) : undefined;
                return (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTaskId(t._id)}
                    className={`
                      p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                      ${
                        isSelected
                          ? 'border-sage-600 bg-sage-50/80 dark:bg-sage-900/40 ring-2 ring-sage-600/20'
                          : 'border-surface-border bg-white dark:bg-surface-card hover:border-sage-300 dark:hover:border-sage-700'
                      }
                    `}
                  >
                    <div>
                      <p className="text-xs font-bold text-content-primary">{t.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-content-muted mt-0.5">
                        {grp && <span className="font-semibold" style={{ color: grp.color }}>{grp.name}</span>}
                        {t.dueDate && <span>· Due {formatDueDate(t.dueDate)}</span>}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-subtle border border-surface-border">
                      {t.estPomodoros || 1} ◷
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border text-xs text-content-muted leading-relaxed">
            Timer sessions count toward your active daily capacity. Checking a task complete credits its full estimate.
          </div>
        </div>
      </div>
    </div>
  );
};
