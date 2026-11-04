import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Sliders, Bell, User, Eye, Type, Sparkles, Check, RotateCcw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { settings: a11y, updateSettings: updateA11y, resetSettings: resetA11y } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'scheduling' | 'algorithm' | 'notifications' | 'accessibility'>('scheduling');

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
  const [emailDigestTime, setEmailDigestTime] = useState('08:00');

  // Account State
  const [displayName, setDisplayName] = useState(user?.displayName || 'Alex Morgan');

  const tabs = [
    { id: 'scheduling', label: 'Scheduling & Timer' },
    { id: 'algorithm', label: 'Advanced Algorithm' },
    { id: 'notifications', label: 'Notifications & Account' },
    { id: 'accessibility', label: 'Accessibility' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
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
              px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all
              ${
                activeTab === tab.id
                  ? 'bg-sage-600 text-white shadow-xs'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Scheduling & Timer */}
      {activeTab === 'scheduling' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-surface-border bg-white shadow-xs space-y-5">
            <h3 className="text-base font-bold text-content-primary">Plan within your capacity</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1">
                  Daily Pomodoro Cap
                </label>
                <input
                  type="number"
                  min="2"
                  max="16"
                  value={dailyCap}
                  onChange={(e) => setDailyCap(Number(e.target.value))}
                  className="w-full text-sm font-bold rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
                <p className="text-[11px] text-content-muted mt-1">Recommended: 8 sessions (4 hours focus)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1">
                  Per-Task Pomodoro Cap
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={taskCap}
                  onChange={(e) => setTaskCap(Number(e.target.value))}
                  className="w-full text-sm font-bold rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
                <p className="text-[11px] text-content-muted mt-1">Tasks over 4 prompt a subtask breakdown</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-surface-border">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1">
                  Work Duration (min)
                </label>
                <input
                  type="number"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(Number(e.target.value))}
                  className="w-full text-sm font-bold rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1">
                  Break Duration (min)
                </label>
                <input
                  type="number"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  className="w-full text-sm font-bold rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-border bg-surface-subtle/50 cursor-pointer">
              <input
                type="checkbox"
                checked={chimeEnabled}
                onChange={(e) => setChimeEnabled(e.target.checked)}
                className="w-4 h-4 text-sage-600 rounded focus:ring-sage-500"
              />
              <div>
                <p className="text-xs font-semibold text-content-primary">Session end chime</p>
                <p className="text-[11px] text-content-muted">Gentle audio alert when it's time to pause or resume</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Tab 2: Advanced Algorithm */}
      {activeTab === 'algorithm' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-surface-border bg-white shadow-xs space-y-5">
            <h3 className="text-base font-bold text-content-primary">Priority Score Formula</h3>
            <p className="text-xs text-content-secondary">
              Lower score schedules earlier. Flow state mode schedules high confidence tasks first to build momentum.
            </p>

            <div className="p-4 rounded-2xl bg-surface-subtle font-mono text-sm font-bold text-sage-900 border border-surface-border">
              (11 - Confidence) + Pomodoros + Days_Until_Due
            </div>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-border bg-surface-subtle/50 cursor-pointer">
              <input
                type="checkbox"
                checked={invertConfidence}
                onChange={(e) => setInvertConfidence(e.target.checked)}
                className="w-4 h-4 text-sage-600 rounded focus:ring-sage-500"
              />
              <div>
                <p className="text-xs font-semibold text-content-primary">Flow State Inversion (11 - Confidence)</p>
                <p className="text-[11px] text-content-muted">
                  On: higher confidence yields smaller scores, scheduling ready tasks first to establish flow.
                </p>
              </div>
            </label>

            {/* Live illustrative preview */}
            <div className="p-4 rounded-2xl border border-sage-200 bg-sage-50/70 space-y-2">
              <p className="text-xs font-bold text-sage-800 uppercase tracking-wider">
                Live Illustrative Score Preview
              </p>
              <p className="text-xs text-content-primary font-medium">
                Choose featured projects · Due in 4 days · Confidence 8/10 · 2 Pomodoros
              </p>
              <div className="font-mono text-xs font-bold text-sage-900 bg-white p-2.5 rounded-lg border border-sage-200">
                (11 - 8) + 2 + 4 = 9 score
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notifications & Account */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-surface-border bg-white shadow-xs space-y-4">
            <h3 className="text-base font-bold text-content-primary">Notification Channels</h3>

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

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-surface-border">
              <div>
                <p className="text-sm font-bold text-content-primary">Daily Digest Email</p>
                <p className="text-xs text-content-muted">Morning summary of today's focused plan</p>
              </div>
              <input
                type="time"
                value={emailDigestTime}
                onChange={(e) => setEmailDigestTime(e.target.value)}
                className="text-xs font-bold rounded-lg border border-surface-border p-2 focus:ring-sage-500"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-surface-border bg-white shadow-xs space-y-4">
            <h3 className="text-base font-bold text-content-primary">Account Profile</h3>
            <Input
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input
              label="Email address"
              disabled
              value={user?.email || 'alex.morgan@example.com'}
              helperText="Verified address"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Accessibility */}
      {activeTab === 'accessibility' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-surface-border bg-white shadow-xs space-y-6">
            <h3 className="text-base font-bold text-content-primary">Reading Preferences</h3>

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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-2">
                Reading Font
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'inter', label: 'Inter (Default)' },
                  { id: 'dyslexic', label: 'Dyslexia Friendly' },
                  { id: 'system', label: 'System Sans' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => updateA11y({ font: f.id as any })}
                    className={`
                      p-3.5 rounded-xl border text-xs font-semibold transition-all
                      ${
                        a11y.font === f.id
                          ? 'border-sage-600 bg-sage-50 text-sage-900 ring-1 ring-sage-600'
                          : 'border-surface-border bg-white text-content-secondary hover:border-sage-300'
                      }
                    `}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
                  Global Font Scaling
                </label>
                <span className="text-xs font-bold text-sage-800 bg-sage-100 px-2 py-0.5 rounded-full">
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
                className="w-full accent-sage-600"
              />
            </div>

            {/* Live Reading Preview */}
            <div className="p-5 rounded-2xl border border-sage-200 bg-sage-50/70 space-y-1">
              <p className="text-xs font-bold text-sage-800 uppercase tracking-wider">
                Live Reading Preview · {a11y.fontScale}%
              </p>
              <p className="text-sm font-medium text-content-primary">
                A little forward, Alex. You don't have to finish everything today. Start with one clear, manageable step.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-border">
        <Button variant="ghost" size="sm" onClick={() => alert('Defaults restored')}>
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset Defaults
        </Button>
        <Button variant="primary" size="md" onClick={() => alert('Settings saved successfully!')}>
          Save changes
        </Button>
      </div>
    </div>
  );
};
