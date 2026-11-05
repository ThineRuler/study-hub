import React from 'react';

interface ConfidenceSliderProps {
  value: number; // 1 to 10
  onChange: (value: number) => void;
  label?: string;
}

export const ConfidenceSlider: React.FC<ConfidenceSliderProps> = ({
  value,
  onChange,
  label = 'How ready do you feel?',
}) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-content-primary">{label}</span>
          <span className="text-sm font-bold text-sage-700 bg-sage-100 px-2 py-0.5 rounded-full">
            {value} / 10
          </span>
        </div>
      )}

      {/* 1-10 Pill Buttons */}
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5 mb-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
          const isSelected = value === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`
                h-10 sm:h-11 rounded-lg text-sm font-semibold transition-all
                focus:outline-none focus:ring-2 focus:ring-sage-400
                ${
                  isSelected
                    ? 'bg-sage-600 text-white shadow-sm ring-2 ring-sage-600 ring-offset-1 scale-105'
                    : 'bg-white border border-surface-border text-content-secondary hover:bg-sage-50 hover:border-sage-300'
                }
              `}
            >
              {score}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-content-muted px-0.5">
        <span>1 · Not sure where to start</span>
        <span>10 · I've got this</span>
      </div>
    </div>
  );
};
