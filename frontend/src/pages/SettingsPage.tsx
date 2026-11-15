import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useBlocker } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { AccessibilitySettings } from '../types';
import {
  Type,
  Bold,
  RotateCcw,
  Sun,
  Moon,
  Palette,
  Clock,
  Mail,
} from 'lucide-react';

interface SettingsSnapshot {
  displayName: string;
  theme: string;
  dailyCap: number;
  taskCap: number;
  workDuration: number;
  breakDuration: number;
  chimeEnabled: boolean;
  invertConfidence: boolean;
  confidenceWeight: number;
  dueDateWeight: number;
  pomodorosWeight: number;
  desktopEnabled: boolean;
  dailyDigestEnabled: boolean;
  emailDigestTime: string;
  a11y: AccessibilitySettings;
}

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { settings: a11y, updateSettings: updateA11y, resetSettings: resetA11y } = useAccessibility();
  const { theme, setTheme } = useTheme();
  const { refreshData } = useTasks();

  const [activeTab, setActiveTab] = useState<
    'customization' | 'scheduling' | 'algorithm' | 'notifications' | 'accessibility'
  >('customization');

  // Scheduling State
  const [dailyCap, setDailyCap] = useState(8);
  const [taskCap, setTaskCap] = useState(4);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [chimeEnabled, setChimeEnabled] = useState(true);

  // Algorithm State
  const [invertConfidence, setInvertConfidence] = useState(true);
  const [confidenceWeight, setConfidenceWeight] = useState(1.0);
  const [pomodorosWeight, setPomodorosWeight] = useState(1.0);
  const [dueDateWeight, setDueDateWeight] = useState(1.0);

  // Notification State
  const [desktopEnabled, setDesktopEnabled] = useState(false);
  const [dailyDigestEnabled, setDailyDigestEnabled] = useState(true);
  const [emailDigestTime, setEmailDigestTime] = useState('08:00');

  // Account State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  // Unsaved changes tracking
  const [initialSettings, setInitialSettings] = useState<SettingsSnapshot | null>(null);
  const isInitializedRef = useRef(false);
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    const s = (user.settings || {}) as any;
    const weights = s.weights || {};

    const loadedDisplayName = user.displayName || '';
    const loadedTheme = s.theme === 'dark' || s.theme === 'light' ? s.theme : theme;
    const loadedDailyCap = typeof s.dailyCap === 'number' ? s.dailyCap : 8;
    const loadedTaskCap = typeof s.taskCap === 'number' ? s.taskCap : 4;
    const loadedWorkDuration = typeof s.workDuration === 'number' ? s.workDuration : 25;
    const loadedBreakDuration = typeof s.breakDuration === 'number' ? s.breakDuration : 5;
    const loadedChimeEnabled = typeof s.chimeEnabled === 'boolean' ? s.chimeEnabled : true;
    const loadedInvertConfidence = typeof s.invertConfidence === 'boolean' ? s.invertConfidence : true;
    const loadedConfidenceWeight = typeof weights.importance === 'number' ? weights.importance : 1.0;
    const loadedDueDateWeight = typeof weights.dueDate === 'number' ? weights.dueDate : 1.0;
    const loadedPomodorosWeight = typeof weights.time === 'number' ? weights.time : 1.0;
    const loadedDailyDigestEnabled = typeof s.dailyDigestEnabled === 'boolean' ? s.dailyDigestEnabled : true;
    const loadedEmailDigestTime = typeof s.emailDigestTime === 'string' ? s.emailDigestTime : '08:00';
    const loadedA11y = s.accessibility;
    const initialA11y: AccessibilitySettings = {
      highContrast: typeof loadedA11y?.highContrast === 'boolean' ? loadedA11y.highContrast : a11y.highContrast,
      dyslexiaFont: typeof loadedA11y?.dyslexiaFont === 'boolean' ? loadedA11y.dyslexiaFont : a11y.dyslexiaFont,
      boldText: typeof loadedA11y?.boldText === 'boolean' ? loadedA11y.boldText : a11y.boldText,
      fontScale: typeof loadedA11y?.fontScale === 'number' ? loadedA11y.fontScale : a11y.fontScale,
      font: loadedA11y?.font ?? a11y.font,
    };

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      setDisplayName(loadedDisplayName);
      setTheme(loadedTheme as any);
      setDailyCap(loadedDailyCap);
      setTaskCap(loadedTaskCap);
      setWorkDuration(loadedWorkDuration);
      setBreakDuration(loadedBreakDuration);
      setChimeEnabled(loadedChimeEnabled);
      setInvertConfidence(loadedInvertConfidence);
      setConfidenceWeight(loadedConfidenceWeight);
      setDueDateWeight(loadedDueDateWeight);
      setPomodorosWeight(loadedPomodorosWeight);
      setDailyDigestEnabled(loadedDailyDigestEnabled);
      setEmailDigestTime(loadedEmailDigestTime);
      if (loadedA11y) {
        updateA11y(initialA11y);
      }

      setInitialSettings({
        displayName: loadedDisplayName,
        theme: loadedTheme,
        dailyCap: loadedDailyCap,
        taskCap: loadedTaskCap,
        workDuration: loadedWorkDuration,
        breakDuration: loadedBreakDuration,
        chimeEnabled: loadedChimeEnabled,
        invertConfidence: loadedInvertConfidence,
        confidenceWeight: loadedConfidenceWeight,
        dueDateWeight: loadedDueDateWeight,
        pomodorosWeight: loadedPomodorosWeight,
        desktopEnabled: false,
        dailyDigestEnabled: loadedDailyDigestEnabled,
        emailDigestTime: loadedEmailDigestTime,
        a11y: initialA11y,
      });
    }
  }, [user]);

  const hasUnsavedChanges = useMemo(() => {
    if (!initialSettings) return false;
    return (
      displayName.trim() !== initialSettings.displayName.trim() ||
      theme !== initialSettings.theme ||
      dailyCap !== initialSettings.dailyCap ||
      taskCap !== initialSettings.taskCap ||
      workDuration !== initialSettings.workDuration ||
      breakDuration !== initialSettings.breakDuration ||
      chimeEnabled !== initialSettings.chimeEnabled ||
      invertConfidence !== initialSettings.invertConfidence ||
      Math.abs(confidenceWeight - initialSettings.confidenceWeight) > 0.001 ||
      Math.abs(dueDateWeight - initialSettings.dueDateWeight) > 0.001 ||
      Math.abs(pomodorosWeight - initialSettings.pomodorosWeight) > 0.001 ||
      desktopEnabled !== initialSettings.desktopEnabled ||
      dailyDigestEnabled !== initialSettings.dailyDigestEnabled ||
      emailDigestTime !== initialSettings.emailDigestTime ||
      a11y.highContrast !== initialSettings.a11y.highContrast ||
      a11y.dyslexiaFont !== initialSettings.a11y.dyslexiaFont ||
      a11y.boldText !== initialSettings.a11y.boldText ||
      a11y.fontScale !== initialSettings.a11y.fontScale ||
      a11y.font !== initialSettings.a11y.font
    );
  }, [
    initialSettings,
    displayName,
    theme,
    dailyCap,
    taskCap,
    workDuration,
    breakDuration,
    chimeEnabled,
    invertConfidence,
    confidenceWeight,
    dueDateWeight,
    pomodorosWeight,
    desktopEnabled,
    dailyDigestEnabled,
    emailDigestTime,
    a11y,
  ]);

  // Block in-app navigation when changes are unsaved
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isLeavingRef.current && hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // Warn on browser tab close/refresh when changes are unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async (silent?: boolean): Promise<boolean> => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('studyhub_jwt_token');
      if (token) {
        const payload = {
          displayName: displayName.trim(),
          settings: {
            theme,
            dailyCap,
            taskCap,
            workDuration,
            breakDuration,
            chimeEnabled,
            invertConfidence,
            dailyDigestEnabled,
            emailDigestTime,
            weights: {
              importance: Math.min(1, Math.max(0, confidenceWeight)),
              dueDate: Math.min(1, Math.max(0, dueDateWeight)),
              time: Math.min(1, Math.max(0, pomodorosWeight)),
            },
            accessibility: {
              highContrast: a11y.highContrast,
              dyslexiaFont: a11y.dyslexiaFont,
              boldText: a11y.boldText,
              fontScale: a11y.fontScale,
              font: a11y.font,
            },
          },
        };

        const res = await fetch('/api/users/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to save settings');
        }

        const updatedData = await res.json();
        updateUser({
          displayName: updatedData.displayName || displayName.trim(),
          settings: updatedData.settings || {
            ...(user?.settings),
            ...payload.settings,
          },
        });
        await refreshData();
      }

      setInitialSettings({
        displayName: displayName.trim(),
        theme,
        dailyCap,
        taskCap,
        workDuration,
        breakDuration,
        chimeEnabled,
        invertConfidence,
        confidenceWeight,
        dueDateWeight,
        pomodorosWeight,
        desktopEnabled,
        dailyDigestEnabled,
        emailDigestTime,
        a11y: {
          highContrast: a11y.highContrast,
          dyslexiaFont: a11y.dyslexiaFont,
          boldText: a11y.boldText,
          fontScale: a11y.fontScale,
          font: a11y.font,
        },
      });

      if (!silent) {
        alert('Settings saved successfully!');
      }
      return true;
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardAndLeave = () => {
    isLeavingRef.current = true;
    if (initialSettings) {
      setTheme(initialSettings.theme as any);
      updateA11y(initialSettings.a11y);
      setDisplayName(initialSettings.displayName);
      setDailyCap(initialSettings.dailyCap);
      setTaskCap(initialSettings.taskCap);
      setWorkDuration(initialSettings.workDuration);
      setBreakDuration(initialSettings.breakDuration);
      setChimeEnabled(initialSettings.chimeEnabled);
      setInvertConfidence(initialSettings.invertConfidence);
      setConfidenceWeight(initialSettings.confidenceWeight);
      setDueDateWeight(initialSettings.dueDateWeight);
      setPomodorosWeight(initialSettings.pomodorosWeight);
      setDesktopEnabled(initialSettings.desktopEnabled);
      setDailyDigestEnabled(initialSettings.dailyDigestEnabled);
      setEmailDigestTime(initialSettings.emailDigestTime);
    }
    blocker.proceed?.();
  };

  const handleSaveAndLeave = async () => {
    const success = await handleSave(true);
    if (success) {
      isLeavingRef.current = true;
      blocker.proceed?.();
    }
  };

  const handleCancelLeave = () => {
    isLeavingRef.current = false;
    blocker.reset?.();
  };

  const handleResetDefaults = () => {
    setDailyCap(8);
    setTaskCap(4);
    setWorkDuration(25);
    setBreakDuration(5);
    setChimeEnabled(true);
    setInvertConfidence(true);
    setConfidenceWeight(1.0);
    setPomodorosWeight(1.0);
    setDueDateWeight(1.0);
    setDailyDigestEnabled(true);
    setEmailDigestTime('08:00');
    setTheme('light');
    resetA11y();
    alert('Defaults restored');
  };

  const tabs = [
    { id: 'customization', label: 'Customization' },
    { id: 'scheduling', label: 'Scheduling & Timer' },
    { id: 'algorithm', label: 'Advanced Algorithm' },
    { id: 'notifications', label: 'Notifications & Account' },
    { id: 'accessibility', label: 'Accessibility' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 dark:text-sage-400 mb-1">
          <span>SETTINGS & PREFERENCES</span>
          <span>·</span>
          <span>A RHYTHM THAT WORKS FOR YOU</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          Thoughtful defaults. Flexible for real life.
        </h1>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-surface-border overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-t-xl transition-colors border-b-2
              ${
                activeTab === tab.id
                  ? 'border-sage-600 text-sage-800 dark:text-sage-200 bg-surface-subtle font-bold'
                  : 'border-transparent text-content-secondary hover:text-content-primary hover:bg-surface-subtle/50'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Customization (Theme Toggle) */}
      {activeTab === 'customization' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-surface-border bg-white dark:bg-surface-card shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-content-primary">Theme & Appearance</h3>
                <p className="text-xs text-content-secondary">
                  Choose a calm botanical appearance that matches your visual comfort.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`
                  p-5 rounded-2xl border text-left transition-all flex items-start gap-4
                  ${
                    theme === 'light'
                      ? 'border-sage-600 bg-sage-50/80 dark:bg-sage-900/40 ring-2 ring-sage-600 shadow-sm'
                      : 'border-surface-border bg-white dark:bg-surface-card hover:border-sage-300'
                  }
                `}
              >
                <div className="p-3 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-content-primary">Light Mode</p>
                  <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                    Clean botanical sage accents on crisp, bright paper tones.
                  </p>
                </div>
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`
                  p-5 rounded-2xl border text-left transition-all flex items-start gap-4
                  ${
                    theme === 'dark'
                      ? 'border-sage-600 bg-sage-50/80 dark:bg-sage-900/40 ring-2 ring-sage-600 shadow-sm'
                      : 'border-surface-border bg-white dark:bg-surface-card hover:border-sage-300'
                  }
                `}
              >
                <div className="p-3 rounded-xl bg-sage-800 text-sage-200 shrink-0">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-content-primary">Dark Mode</p>
                  <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                    Gentle deep forest tones designed for low-glare nighttime study.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Scheduling & Timer */}
      {activeTab === 'scheduling' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-surface-border bg-white dark:bg-surface-card shadow-xs space-y-6">
            <h3 className="text-base font-bold text-content-primary">Capacity Caps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
                    Daily Pomodoro Cap
                  </label>
                  <span className="text-xs font-bold text-sage-700 dark:text-sage-300 bg-sage-100 dark:bg-sage-900 px-2 py-0.5 rounded-full">
                    {dailyCap} sessions ({dailyCap * 0.5} hrs)
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  step="1"
                  value={dailyCap}
                  onChange={(e) => setDailyCap(Number(e.target.value))}
                  className="w-full accent-sage-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
                    Max Active Focus Tasks
                  </label>
                  <span className="text-xs font-bold text-sage-700 dark:text-sage-300 bg-sage-100 dark:bg-sage-900 px-2 py-0.5 rounded-full">
                    {taskCap} tasks
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={taskCap}
                  onChange={(e) => setTaskCap(Number(e.target.value))}
                  className="w-full accent-sage-600"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-surface-border bg-white dark:bg-surface-card shadow-xs space-y-6">
            <h3 className="text-base font-bold text-content-primary">Timer Intervals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-2">
                  Work Duration (Minutes)
                </label>
                <Input
                  type="number"
                  min="5"
                  max="90"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-2">
                  Short Break (Minutes)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-surface-border">
              <div>
                <p className="text-sm font-bold text-content-primary">Audible Session Chime</p>
                <p className="text-xs text-content-muted">Soft chime when timer intervals complete</p>
              </div>
              <input
                type="checkbox"
                checked={chimeEnabled}
                onChange={(e) => setChimeEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-sage-600 focus:ring-sage-500 accent-sage-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Advanced Algorithm */}
      {activeTab === 'algorithm' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-surface-border bg-white dark:bg-surface-card shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-content-primary">Priority Score Formula</h3>
              <p className="text-xs text-content-secondary mt-0.5">
                Lower score schedules earlier. Flow state mode schedules high confidence tasks first to build momentum.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-subtle font-mono text-sm font-bold text-sage-900 dark:text-sage-100 border border-surface-border">
              {invertConfidence ? '(11 - Confidence)' : 'Confidence'} + Pomodoros + Days_Until_Due
            </div>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-border bg-surface-subtle/50 cursor-pointer">
              <input
                type="checkbox"
                checked={invertConfidence}
                onChange={(e) => setInvertConfidence(e.target.checked)}
                className="w-4 h-4 rounded text-sage-600 focus:ring-sage-500 accent-sage-600"
              />
              <div>
                <p className="text-xs font-semibold text-content-primary">Flow State Inversion (11 - Confidence)</p>
                <p className="text-[11px] text-content-muted">
                  On: higher confidence yields smaller scores, scheduling ready tasks first to establish flow.
                </p>
              </div>
            </label>

            <div className="space-y-4 pt-2 border-t border-surface-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content-primary">
                Algorithm Factor Weights
              </h4>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-content-secondary">
                    Importance / Confidence Weight
                  </span>
                  <span className="text-xs font-mono font-bold text-sage-700 dark:text-sage-300">
                    {confidenceWeight.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={confidenceWeight}
                  onChange={(e) => setConfidenceWeight(Number(e.target.value))}
                  className="w-full accent-sage-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-content-secondary">
                    Due Date Urgency Weight
                  </span>
                  <span className="text-xs font-mono font-bold text-sage-700 dark:text-sage-300">
                    {dueDateWeight.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={dueDateWeight}
                  onChange={(e) => setDueDateWeight(Number(e.target.value))}
                  className="w-full accent-sage-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-content-secondary">
                    Pomodoros / Effort Weight
                  </span>
                  <span className="text-xs font-mono font-bold text-sage-700 dark:text-sage-300">
                    {pomodorosWeight.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={pomodorosWeight}
                  onChange={(e) => setPomodorosWeight(Number(e.target.value))}
                  className="w-full accent-sage-600"
                />
              </div>
            </div>

            {/* Live Algorithm Visualizer & Score Preview */}
            <div className="p-5 rounded-2xl border border-sage-200 dark:border-sage-800 bg-sage-50/70 dark:bg-sage-900/30 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-sage-800 dark:text-sage-200 uppercase tracking-wider">
                  Live Algorithm Visualizer
                </p>
                <span className="text-[11px] font-semibold text-content-secondary">
                  Lower score = scheduled earlier
                </span>
              </div>

              {/* Formula calculation breakdown */}
              <div className="space-y-1.5">
                <p className="text-xs text-content-primary font-medium">
                  Example Task: "Design Review" · Due in 4 days · Confidence 8/10 · 2 Pomodoros
                </p>
                <div className="font-mono text-xs font-bold text-sage-900 dark:text-sage-100 bg-white dark:bg-surface-card p-3 rounded-xl border border-sage-200 dark:border-sage-800 break-all">
                  {invertConfidence ? `(11 - 8) × ${confidenceWeight.toFixed(2)}` : `8 × ${confidenceWeight.toFixed(2)}`} + (2 × {pomodorosWeight.toFixed(2)}) + (4 × {dueDateWeight.toFixed(2)}) = {((invertConfidence ? 3 : 8) * confidenceWeight + 2 * pomodorosWeight + 4 * dueDateWeight).toFixed(1)} score
                </div>
              </div>

              {/* Interactive task ranking simulation */}
              <div className="pt-2 border-t border-sage-200/60 dark:border-sage-800/60 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-content-muted">
                  Simulated Queue Order With Current Weights:
                </p>
                <div className="space-y-1.5">
                  {[
                    { name: 'Fix broken tests', confidence: 9, pomodoros: 1, daysDue: 1 },
                    { name: 'Research project outline', confidence: 6, pomodoros: 4, daysDue: 5 },
                    { name: 'Quick email reply', confidence: 10, pomodoros: 1, daysDue: 3 },
                  ]
                    .map((sample) => {
                      const confScore = invertConfidence ? (11 - sample.confidence) : sample.confidence;
                      const score = confScore * confidenceWeight + sample.pomodoros * pomodorosWeight + sample.daysDue * dueDateWeight;
                      return { ...sample, score };
                    })
                    .sort((a, b) => a.score - b.score)
                    .map((item, idx) => (
                      <div
                        key={item.name}
                        className="p-2.5 rounded-xl bg-white dark:bg-surface-card border border-surface-border flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200 font-bold text-[10px] flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold text-content-primary">{item.name}</span>
                          <span className="text-content-muted text-[11px]">
                            ({item.pomodoros} ◷ · Due in {item.daysDue}d)
                          </span>
                        </div>
                        <span className="font-mono font-bold text-sage-700 dark:text-sage-300">
                          Score: {item.score.toFixed(1)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Notifications & Account */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-surface-border bg-white dark:bg-surface-card shadow-xs space-y-4">
            <h3 className="text-base font-bold text-content-primary">Notifications</h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-surface-border">
              <div>
                <p className="text-sm font-bold text-content-primary">Desktop Notifications</p>
                <p className="text-xs text-content-muted">Task reminders and session end alerts</p>
              </div>
              <Button
                size="sm"
                variant={desktopEnabled ? 'outline' : 'secondary'}
                onClick={() => setDesktopEnabled(!desktopEnabled)}
              >
                {desktopEnabled ? 'Enabled' : 'Enable'}
              </Button>
            </div>

            {/* Daily Digest Email Toggle with Grayed Out Time Input */}
            <div className="p-3.5 rounded-xl border border-surface-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-content-primary">Daily Digest Email</p>
                    <p className="text-xs text-content-muted">Morning summary of today's focused plan</p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={dailyDigestEnabled}
                  onClick={() => setDailyDigestEnabled(!dailyDigestEnabled)}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
                    ${dailyDigestEnabled ? 'bg-sage-600' : 'bg-surface-border'}
                  `}
                  aria-label="Toggle Daily Digest Email"
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                      ${dailyDigestEnabled ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              {/* Digest Time Input: Grayed out and disabled when toggle is off */}
              <div
                className={`
                  flex items-center justify-between pt-2 border-t border-surface-border transition-opacity
                  ${dailyDigestEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}
                `}
              >
                <label className="flex items-center gap-2 text-xs font-medium text-content-secondary">
                  <Clock className="w-3.5 h-3.5 text-sage-600" />
                  Delivery Time
                </label>
                <input
                  type="time"
                  disabled={!dailyDigestEnabled}
                  value={emailDigestTime}
                  onChange={(e) => setEmailDigestTime(e.target.value)}
                  className="text-xs font-bold rounded-lg border border-surface-border p-2 focus:ring-sage-500 bg-surface-subtle/50 disabled:bg-surface-subtle disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-surface-border bg-white dark:bg-surface-card shadow-xs space-y-4">
            <h3 className="text-base font-bold text-content-primary">Account Profile</h3>
            <Input
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input
              label="Email address"
              disabled
              value={user?.email || ''}
              helperText="Verified address"
            />
          </div>
        </div>
      )}

      {/* Tab 5: Accessibility */}
      {activeTab === 'accessibility' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-surface-border bg-white dark:bg-surface-card shadow-xs space-y-6">
            <h3 className="text-base font-bold text-content-primary">Reading Preferences</h3>

            {/* High Contrast */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-surface-border bg-surface-subtle/50">
              <div>
                <p className="text-sm font-bold text-content-primary">High Contrast</p>
                <p className="text-xs text-content-secondary">Stronger text, borders, and controls</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={a11y.highContrast}
                onClick={() => updateA11y({ highContrast: !a11y.highContrast })}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
                  ${a11y.highContrast ? 'bg-sage-600' : 'bg-surface-border'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${a11y.highContrast ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            {/* Dyslexia Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-surface-border bg-surface-subtle/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-surface-card text-sage-700 dark:text-sage-300 shadow-xs">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-content-primary">Dyslexia Mode</p>
                  <p className="text-xs text-content-secondary">
                    Switches font to OpenDyslexic for higher character distinction
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={a11y.dyslexiaFont}
                onClick={() =>
                  updateA11y({
                    dyslexiaFont: !a11y.dyslexiaFont,
                    font: !a11y.dyslexiaFont ? 'dyslexic' : 'inter',
                  })
                }
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
                  ${a11y.dyslexiaFont ? 'bg-sage-600' : 'bg-surface-border'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${a11y.dyslexiaFont ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            {/* Bold Text Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-surface-border bg-surface-subtle/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-surface-card text-sage-700 dark:text-sage-300 shadow-xs">
                  <Bold className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-content-primary">Bold Text</p>
                  <p className="text-xs text-content-secondary">
                    Increases letter weight across the interface for greater visual weight
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={a11y.boldText}
                onClick={() => updateA11y({ boldText: !a11y.boldText })}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
                  ${a11y.boldText ? 'bg-sage-600' : 'bg-surface-border'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${a11y.boldText ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            {/* Font Scaling */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
                  Global Font Scaling
                </label>
                <span className="text-xs font-bold text-sage-800 dark:text-sage-200 bg-sage-100 dark:bg-sage-900 px-2 py-0.5 rounded-full">
                  {a11y.fontScale}%
                </span>
              </div>
              <input
                type="range"
                min="90"
                max="150"
                step="5"
                value={a11y.fontScale}
                onChange={(e) => updateA11y({ fontScale: Number(e.target.value) })}
                className="w-full accent-sage-600 cursor-pointer"
              />
            </div>

            {/* Live Reading Preview */}
            <div className="p-5 rounded-2xl border border-sage-200 dark:border-sage-800 bg-sage-50/70 dark:bg-sage-900/40 space-y-1">
              <p className="text-xs font-bold text-sage-800 dark:text-sage-300 uppercase tracking-wider">
                Live Reading Preview · {a11y.fontScale}% {a11y.dyslexiaFont && '· OpenDyslexic'} {a11y.boldText && '· Bold'}
              </p>
              <p className="text-sm font-medium text-content-primary">
                A little forward{displayName ? `, ${displayName.split(' ')[0]}` : ''}. You don't have to finish everything today. Start with one clear, manageable step.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-border">
        <Button variant="ghost" size="sm" onClick={handleResetDefaults}>
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset Defaults
        </Button>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 animate-in fade-in duration-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              You have unsaved changes
            </span>
          )}
          <Button variant="primary" size="md" isLoading={isSaving} onClick={() => handleSave()}>
            Save changes
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      <Modal
        isOpen={blocker.state === 'blocked'}
        onClose={handleCancelLeave}
        title="Be careful, you have unsaved changes"
        subtitle="You have unsaved changes that will be lost if you leave without saving."
        maxWidth="md"
      >
        <div className="space-y-6 pt-1">
          <p className="text-sm text-content-secondary leading-relaxed">
            Would you like to discard your changes or save them before leaving?
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-surface-border">
            <Button
              variant="outline"
              size="md"
              onClick={handleDiscardAndLeave}
              className="w-full sm:w-auto"
            >
              Discard changes
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={isSaving}
              onClick={handleSaveAndLeave}
              className="w-full sm:w-auto"
            >
              Save changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
