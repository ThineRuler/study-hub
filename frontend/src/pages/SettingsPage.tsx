import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
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

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { settings: a11y, updateSettings: updateA11y, resetSettings: resetA11y } = useAccessibility();
  const { theme, setTheme } = useTheme();

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

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
    if (user?.settings?.theme && (user.settings.theme === 'dark' || user.settings.theme === 'light')) {
      setTheme(user.settings.theme);
    }
    const weights = (user?.settings as any)?.weights;
    if (weights) {
      if (typeof weights.importance === 'number') setConfidenceWeight(weights.importance);
      if (typeof weights.dueDate === 'number') setDueDateWeight(weights.dueDate);
      if (typeof weights.time === 'number') setPomodorosWeight(weights.time);
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('studyhub_jwt_token');
      if (token) {
        const res = await fetch('/api/users/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            displayName: displayName.trim(),
            settings: {
              theme,
              weights: {
                importance: Math.min(1, Math.max(0, confidenceWeight)),
                dueDate: Math.min(1, Math.max(0, dueDateWeight)),
                time: Math.min(1, Math.max(0, pomodorosWeight)),
              },
            },
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to save settings');
        }

        const updatedData = await res.json();
        updateUser({
          displayName: updatedData.displayName || displayName.trim(),
          settings: updatedData.settings || user?.settings,
        });
      }
      alert('Settings saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
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
            <h3 className="text-base font-bold text-content-primary">Task Prioritization Formula</h3>

            <div className="flex items-center justify-between p-4 rounded-xl border border-surface-border bg-surface-subtle/50">
              <div>
                <p className="text-sm font-bold text-content-primary">Invert Confidence (Flow State)</p>
                <p className="text-xs text-content-muted">
                  High confidence tasks are prioritized first to build momentum
                </p>
              </div>
              <input
                type="checkbox"
                checked={invertConfidence}
                onChange={(e) => setInvertConfidence(e.target.checked)}
                className="w-4 h-4 rounded text-sage-600 focus:ring-sage-500 accent-sage-600"
              />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
                    Importance / Confidence Weight
                  </label>
                  <span className="text-xs font-bold text-sage-700 dark:text-sage-300">{confidenceWeight.toFixed(2)}</span>
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
                  <label className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
                    Due Date Proximity Weight
                  </label>
                  <span className="text-xs font-bold text-sage-700 dark:text-sage-300">{dueDateWeight.toFixed(2)}</span>
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
                  <label className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
                    Effort / Duration Weight
                  </label>
                  <span className="text-xs font-bold text-sage-700 dark:text-sage-300">{pomodorosWeight.toFixed(2)}</span>
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
        <Button variant="primary" size="md" isLoading={isSaving} onClick={handleSave}>
          Save changes
        </Button>
      </div>
    </div>
  );
};
