import React, { useState } from 'react';
import { PersonStanding } from 'lucide-react';
import { AccessibilityModal } from './AccessibilityModal';

export const FloatingAccessibilityButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-sage-600 text-white shadow-lg hover:bg-sage-700 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 border border-white/20"
        title="Accessibility Settings"
        aria-label="Accessibility Settings"
      >
        <PersonStanding className="w-5 h-5" />
      </button>

      <AccessibilityModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
