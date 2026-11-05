import React, { useRef, useEffect } from 'react';

interface SixDigitInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
}

export const SixDigitInput: React.FC<SixDigitInputProps> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus first empty box or box 0 on mount
    const firstEmpty = digits.findIndex((d) => !d);
    const indexToFocus = firstEmpty === -1 ? 5 : firstEmpty;
    inputRefs.current[indexToFocus]?.focus();
  }, []);

  const handleChange = (index: number, char: string) => {
    // Only accept numeric digits
    const cleaned = char.replace(/\D/g, '');
    if (!cleaned) return;

    const newDigits = [...digits];
    newDigits[index] = cleaned[cleaned.length - 1]; // take last entered digit
    const nextVal = newDigits.join('').slice(0, 6);
    onChange(nextVal);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (nextVal.length === 6 && onComplete) {
      onComplete(nextVal);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      if (pasted.length === 6 && onComplete) {
        onComplete(pasted);
      }
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-sm mx-auto">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`
            w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono rounded-xl border bg-white shadow-sm transition-all
            focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent
            ${digits[index] ? 'border-sage-500 text-sage-900 bg-sage-50/50' : 'border-surface-border text-content-primary'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-sage-300'}
          `}
        />
      ))}
    </div>
  );
};
