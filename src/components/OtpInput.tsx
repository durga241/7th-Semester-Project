import React, { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ length = 6, onComplete, disabled = false }) => {
  const [digits, setDigits] = useState<string[]>(Array.from({ length }, () => ''));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!disabled) inputsRef.current[0]?.focus();
  }, [disabled]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // allow single digit or empty
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    const code = newDigits.join('');
    if (code.length === length && !code.includes('')) onComplete(code);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        // clear current
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!text) return;
    const newDigits = Array.from({ length }, (_, i) => text[i] || '');
    setDigits(newDigits);
    const code = newDigits.join('');
    const lastIndex = Math.min(text.length, length) - 1;
    inputsRef.current[lastIndex]?.focus();
    if (code.length === length && !code.includes('')) onComplete(code);
  };

  return (
    <div className="flex justify-center gap-2">
      {digits.map((d, i) => (
        <React.Fragment key={i}>
          <input
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={
              'w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg ' +
              'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ' +
              'border-gray-300 ' +
              (disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text hover:border-green-400')
            }
            style={{
              backgroundImage: d ? 'none' : 'repeating-linear-gradient(90deg, transparent, transparent 3px, #9ca3af 3px, #9ca3af 6px)',
              backgroundSize: '12px 2px',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          {i < length - 1 && (
            <span className="text-gray-400 text-xl font-bold self-center">—</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default OtpInput;


