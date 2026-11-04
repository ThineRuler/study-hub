import React, { useState, useEffect } from 'react';
import { Button } from '../components/common/Button';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle, Clock } from 'lucide-react';

export const PomodoroTimerPage: React.FC = () => {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [chimeOn, setChimeOn] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState('1');

  const taskQueue = [
    { id: '1', name: 'Read design notes', group: 'Learning', pomodoros: 1, confidence: 7, dueDate: 'Oct 31' },
    { id: '2', name: 'Clear client inbox', group: 'Work', pomodoros: 2, confidence: 5, dueDate: 'Today' },
    { id: '3', name: 'Launch portfolio / subtask: Choose featured projects', group: 'Work & Personal', pomodoros: 2, confidence: 8, dueDate: 'Nov 3' },
  ];

  const currentTask = taskQueue.find((t) => t.id === selectedTaskId) || taskQueue[0];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      // Play gentle chime simulation
      if (chimeOn) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.value = mode === 'work' ? 587.33 : 880; // D5 / A5
          gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
          osc.start();
          osc.stop(audioCtx.currentTime + 1.2);
        } catch {
          // AudioCtx restricted or unsupported
        }
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, chimeOn, mode]);

  const toggleMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setSecondsLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
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
        {/* Main Interactive Clock Panel (Left 7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-surface-border bg-white p-8 sm:p-10 shadow-lg text-center space-y-6">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl bg-surface-subtle p-1 border border-surface-border">
            <button
              type="button"
              onClick={() => toggleMode('work')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'work' ? 'bg-white text-sage-900 shadow-xs' : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              Work (25 min)
            </button>
            <button
              type="button"
              onClick={() => toggleMode('break')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'break' ? 'bg-white text-sage-900 shadow-xs' : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              Break (5 min)
            </button>
          </div>

          {/* Active Task Tag */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-sage-700 uppercase tracking-wider">
              {currentTask.group}
            </span>
            <h3 className="text-lg font-bold text-content-primary">{currentTask.name}</h3>
            <p className="text-xs text-content-muted">
              Session 1 of {currentTask.pomodoros} estimated · Confidence {currentTask.confidence}/10 · Due {currentTask.dueDate}
            </p>
          </div>

          {/* Clock Display */}
          <div className="py-4">
            <div className="text-6xl sm:text-7xl font-mono font-black text-content-primary tracking-tight">
              {timeFormatted}
            </div>
            <p className="text-xs font-semibold text-sage-700 uppercase tracking-widest mt-2">
              {isActive ? 'FOCUS IN PROGRESS' : 'READY FOR A FRESH SESSION'}
            </p>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              variant={isActive ? 'outline' : 'primary'}
              onClick={() => setIsActive(!isActive)}
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
              {chimeOn ? <Volume2 className="w-4 h-4 text-sage-600" /> : <VolumeX className="w-4 h-4" />}
              <span>Chime {chimeOn ? 'on' : 'muted'} (gentle bell at end)</span>
            </button>
            <span>Today: 3 / 8 counted</span>
          </div>
        </div>

        {/* Task Queue Selector (Right 5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-surface-border bg-white p-6 shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-content-primary">Today's queue</h4>
            <p className="text-xs text-content-secondary mt-0.5">
              Select a task to focus on. Sessions will automatically count toward it.
            </p>
          </div>

          <div className="space-y-2">
            {taskQueue.map((t) => {
              const isSelected = t.id === selectedTaskId;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className={`
                    p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                    ${
                      isSelected
                        ? 'border-sage-600 bg-sage-50/80 ring-2 ring-sage-600/20'
                        : 'border-surface-border bg-white hover:border-sage-300'
                    }
                  `}
                >
                  <div>
                    <p className="text-xs font-bold text-content-primary">{t.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-content-muted mt-0.5">
                      <span className="font-semibold text-sage-800">{t.group}</span>
                      <span>·</span>
                      <span>Due {t.dueDate}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-subtle border border-surface-border">
                    {t.pomodoros} ◷
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border text-xs text-content-muted leading-relaxed">
            Checking a task complete counts its full estimate. Timer sessions are credited separately without duplicate addition.
          </div>
        </div>
      </div>
    </div>
  );
};
