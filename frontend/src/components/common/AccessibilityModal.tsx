import React from 'react';
import { Modal } from './Modal';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Button } from './Button';
import { Eye, Type, Sliders, RotateCcw } from 'lucide-react';

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
      <div className="space-y-6">
        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-surface-border bg-surface-subtle/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white text-sage-700 shadow-xs">
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

        {/* Reading Font Selection */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-content-secondary mb-2">
            <Type className="w-4 h-4 text-sage-600" />
            Reading Font
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'inter', label: 'Inter (Default)' },
              { id: 'dyslexic', label: 'Dyslexia Friendly' },
              { id: 'system', label: 'System Sans' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => updateSettings({ font: f.id as any })}
                className={`
                  p-3 rounded-xl border text-xs font-medium text-center transition-all
                  ${
                    settings.font === f.id
                      ? 'border-sage-600 bg-sage-50 text-sage-900 font-bold ring-1 ring-sage-600'
                      : 'border-surface-border bg-white text-content-secondary hover:border-sage-300'
                  }
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Scaling */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-content-secondary">
              <Sliders className="w-4 h-4 text-sage-600" />
              Global Font Scaling
            </label>
            <span className="text-xs font-bold text-sage-700 bg-sage-100 px-2 py-0.5 rounded-full">
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
        <div className="p-4 rounded-xl border border-sage-200 bg-sage-50/60">
          <p className="text-xs font-semibold text-sage-800 uppercase tracking-wider mb-1">
            Live Preview · {settings.fontScale}%
          </p>
          <p className="text-sm font-medium text-content-primary">
            "A little forward, Alex. You don't have to finish everything today. Start with one clear, manageable step."
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
