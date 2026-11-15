import React from 'react';
import { Modal } from './Modal';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Button } from './Button';
import { Eye, Type, Sliders, RotateCcw, Bold } from 'lucide-react';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useAccessibility();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Accessibility Preferences"
      subtitle="Comfort and readability across the entire site, saved to this device."
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-surface-border bg-surface-subtle/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white dark:bg-surface-card text-sage-700 dark:text-sage-300 shadow-xs">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-content-primary">High Contrast</p>
              <p className="text-xs text-content-secondary">Stronger text, borders, and controls</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ highContrast: !settings.highContrast })}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
              ${settings.highContrast ? 'bg-sage-600' : 'bg-surface-border'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                ${settings.highContrast ? 'translate-x-5' : 'translate-x-0'}
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
              <p className="text-sm font-semibold text-content-primary">Dyslexia Mode</p>
              <p className="text-xs text-content-secondary">Switches to OpenDyslexic for distinct letter weighting</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              updateSettings({
                dyslexiaFont: !settings.dyslexiaFont,
                font: !settings.dyslexiaFont ? 'dyslexic' : 'inter',
              })
            }
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
              ${settings.dyslexiaFont ? 'bg-sage-600' : 'bg-surface-border'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                ${settings.dyslexiaFont ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        {/* Bold Text Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-surface-border bg-surface-subtle/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white dark:bg-surface-card text-sage-700 dark:text-sage-300 shadow-xs">
              <Bold className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-content-primary">Bold Text</p>
              <p className="text-xs text-content-secondary">Increases font weight for enhanced visual clarity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ boldText: !settings.boldText })}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
              ${settings.boldText ? 'bg-sage-600' : 'bg-surface-border'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                ${settings.boldText ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        {/* Font Scaling */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-content-secondary">
              <Sliders className="w-4 h-4 text-sage-600" />
              Global Font Scaling
            </label>
            <span className="text-xs font-bold text-sage-700 dark:text-sage-300 bg-sage-100 dark:bg-sage-900 px-2 py-0.5 rounded-full">
              {settings.fontScale}%
            </span>
          </div>
          <input
            type="range"
            min="90"
            max="150"
            step="5"
            value={settings.fontScale}
            onChange={(e) => updateSettings({ fontScale: Number(e.target.value) })}
            className="w-full accent-sage-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-content-muted mt-1">
            <span>90% (Compact)</span>
            <span>100% (Default)</span>
            <span>150% (Large)</span>
          </div>
        </div>

        {/* Live Reading Preview Box */}
        <div className="p-4 rounded-xl border border-sage-200 dark:border-sage-800 bg-sage-50/60 dark:bg-sage-900/30">
          <p className="text-xs font-semibold text-sage-800 dark:text-sage-300 uppercase tracking-wider mb-1">
            Live Preview · {settings.fontScale}% {settings.dyslexiaFont && '· OpenDyslexic'} {settings.boldText && '· Bold'}
          </p>
          <p className="text-sm font-medium text-content-primary">
            "A little forward. You don't have to finish everything today. Start with one clear, manageable step."
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-border">
          <Button variant="ghost" size="sm" onClick={resetSettings}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
