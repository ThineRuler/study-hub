import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { OverrunModal } from '../components/tasks/OverrunModal';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Layers,
  ArrowRight,
  MoreVertical,
  Check,
} from 'lucide-react';

export const DailyDigestPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([
    {
      id: '1',
      name: 'Read design notes',
      group: 'Learning',
      confidence: 7,
      pomodoros: 1,
      dueDate: 'Oct 31',
      completed: false,
    },
    {
      id: '2',
      name: 'Clear client inbox',
      group: 'Work',
      confidence: 5,
      pomodoros: 2,
      dueDate: 'Today',
      isOverdue: true,
      completed: false,
    },
    {
      id: '3',
      name: 'Launch portfolio / subtask: Choose featured projects',
      group: 'Work & Personal',
      confidence: 8,
      pomodoros: 2,
      dueDate: 'Nov 3',
      completed: false,
    },
  ]);

  const [completedCount, setCompletedCount] = useState(2);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [showOverrunModal, setShowOverrunModal] = useState(false);

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const next = !t.completed;
          setCompletedCount((c) => (next ? c + 1 : c - 1));
          return { ...t, completed: next };
        }
        return t;
      })
    );
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
          <span>DAILY DIGEST</span>
          <span>·</span>
          <span>FRIDAY, OCTOBER 30</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          A little forward, {user?.displayName?.split(' ')[0] || 'Alex'}.
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          Three manageable steps. A clearer end to your day.
        </p>
      </div>

      {/* Past Due Alert Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-950">
              Past Due: Clear client inbox was missed yesterday
            </p>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Moved to today and your plan was recalculated. This is your one reminder—you can take it from here.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowOverrunModal(true)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors shrink-0"
        >
          Review task
        </button>
      </div>

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
                {completedCount} of {tasks.length + 2}
              </span>
              <span className="text-xs text-content-secondary font-medium">tasks done</span>
            </div>
            <p className="text-xs text-content-muted mt-0.5">
              {completedCount} completed · {tasks.length + 2 - completedCount} remaining
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-subtle mt-4 overflow-hidden">
            <div
              className="h-full bg-sage-600 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / (tasks.length + 2)) * 100}%` }}
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
              <span className="text-2xl font-black text-content-primary">3 / 8</span>
              <span className="text-xs text-content-secondary font-medium">sessions</span>
            </div>
            <p className="text-xs text-sage-700 font-medium mt-0.5">
              5 to go. One small step at a time.
            </p>
          </div>
          <div className="flex gap-1.5 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < 3 ? 'bg-sage-600' : 'bg-surface-subtle'
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
                Read design notes
              </p>
            </div>
            <Button
              size="sm"
              variant={isTimerRunning ? 'outline' : 'primary'}
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
                Your order is a guide, not a judgment. High readiness comes first to enter flow state.
              </p>
            </div>
            <span className="text-xs font-semibold text-content-secondary">
              3 tasks · 5 Pomodoros
            </span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task, idx) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`
                  p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group
                  ${
                    task.completed
                      ? 'border-surface-border bg-surface-subtle/50 opacity-60'
                      : 'border-surface-border bg-white hover:border-sage-300 hover:shadow-xs'
                  }
                `}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    className={`
                      w-6 h-6 rounded-lg border flex items-center justify-center transition-colors
                      ${
                        task.completed
                          ? 'border-sage-600 bg-sage-600 text-white'
                          : 'border-surface-border group-hover:border-sage-400 bg-white'
                      }
                    `}
                  >
                    {task.completed ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold text-content-muted">
                        0{idx + 1}
                      </span>
                    )}
                  </button>

                  <div>
                    <p
                      className={`text-sm font-bold ${
                        task.completed
                          ? 'line-through text-content-muted'
                          : 'text-content-primary'
                      }`}
                    >
                      {task.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-content-muted mt-0.5">
                      <span className="font-semibold text-sage-800">{task.group}</span>
                      <span>·</span>
                      <span>Confidence {task.confidence}/10</span>
                      <span>·</span>
                      <span
                        className={
                          task.dueDate === 'Today' ? 'text-red-600 font-bold' : ''
                        }
                      >
                        Due {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-surface-subtle text-content-primary border border-surface-border">
                    {task.pomodoros} ◷
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Finished Today Summary Box */}
          <div className="p-4 rounded-xl border border-surface-border bg-white/70">
            <p className="text-xs text-content-secondary">
              <strong className="text-content-primary">Done today:</strong> Outline case study · 2 ◷, Take a mindful walk · 1 ◷
            </p>
          </div>
        </div>

        {/* Parent Task Overview (Right Column) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <span className="text-xs font-bold uppercase tracking-wider text-sage-700">
                TODAY'S PARENT TASK
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sage-50 text-sage-800">
                Work + Personal
              </span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-content-primary">Launch portfolio</h4>
              <p className="text-xs text-content-muted mt-0.5">
                8 estimated Pomodoros · Shared deadline Nov 3
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-content-secondary font-medium">
                <span>0 of 4 subtasks done</span>
                <span>0%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
                <div className="h-full bg-sage-600 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sage-50/70 border border-sage-200">
              <p className="text-xs text-sage-800 leading-relaxed font-medium">
                "A little progress is still progress. Every subtask is scored on its own."
              </p>
            </div>
          </div>
        </div>
      </div>

      <OverrunModal
        isOpen={showOverrunModal}
        onClose={() => setShowOverrunModal(false)}
        taskName="Clear client inbox"
        currentSessions={5}
        onBreakDown={() => {
          setShowOverrunModal(false);
        }}
      />
    </div>
  );
};
