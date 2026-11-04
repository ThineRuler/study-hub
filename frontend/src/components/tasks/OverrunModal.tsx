import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle, SplitSquareVertical, ArrowRight } from 'lucide-react';

interface OverrunModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  currentSessions: number;
  onBreakDown: () => void;
  onKeepAnyway?: () => void;
}

export const OverrunModal: React.FC<OverrunModalProps> = ({
  isOpen,
  onClose,
  taskName,
  currentSessions,
  onBreakDown,
  onKeepAnyway,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Need a little more time?"
      subtitle="That's useful information, not a setback. Let's make the next step smaller."
      maxWidth="md"
    >
      <div className="space-y-5">
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-900">
              {currentSessions} sessions exceeds your 4-session focus cap
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              When <strong className="font-semibold">{taskName}</strong> takes more than 4 Pomodoros, breaking it into smaller next actions keeps your momentum fresh and prevents fatigue.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-surface-border bg-surface-subtle/50 space-y-2">
          <p className="text-xs font-bold text-content-primary uppercase tracking-wider">
            RECOMMENDED ACTION
          </p>
          <p className="text-xs text-content-secondary leading-relaxed">
            Convert <strong>{taskName}</strong> into a parent project and add 2-3 smaller actions. Your completed sessions stay credited toward today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
          {onKeepAnyway && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onKeepAnyway();
                onClose();
              }}
            >
              Keep 5 sessions anyway
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onBreakDown();
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            <SplitSquareVertical className="w-4 h-4 mr-1.5" />
            Break into Subtasks
          </Button>
        </div>
      </div>
    </Modal>
  );
};
