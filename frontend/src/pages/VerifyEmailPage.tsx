import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SixDigitInput } from '../components/common/SixDigitInput';
import { Button } from '../components/common/Button';
import { Mail, RefreshCw, AlertCircle } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pendingEmail, verifyEmail } = useAuth();

  const email = searchParams.get('email') || pendingEmail || 'alex.morgan@example.com';
  const [code, setCode] = useState('246810');
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendNotice, setResendNotice] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = (codeToVerify?: string) => {
    const finalCode = codeToVerify || code;
    if (finalCode.length < 6) {
      setError('Please enter all 6 digits of the code');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      verifyEmail(finalCode);
      setIsLoading(false);
      // Seamless auto-login and redirection to Daily Digest
      navigate('/dashboard');
    }, 400);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
    setResendNotice(true);
    setTimeout(() => setResendNotice(false), 3000);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-6">
        <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center mb-4">
          <Mail className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold text-content-primary tracking-tight">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm text-content-secondary leading-relaxed">
          We sent a six-digit verification code to{' '}
          <strong className="text-content-primary font-semibold">{email}</strong>. Once you're
          verified, you'll be redirected directly to your workspace.
        </p>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resendNotice && (
          <div className="p-3 rounded-lg bg-sage-50 border border-sage-200 text-xs text-sage-800 font-medium">
            A fresh verification code has been dispatched to your email.
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary text-center mb-3">
            Verification code
          </label>
          <SixDigitInput
            value={code}
            onChange={(val) => {
              setCode(val);
              setError('');
            }}
            onComplete={(val) => handleVerify(val)}
          />
        </div>

        <Button
          type="button"
          fullWidth
          size="lg"
          isLoading={isLoading}
          onClick={() => handleVerify()}
          className="mt-2"
        >
          Verify email
        </Button>

        {/* Resend & Change email controls */}
        <div className="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0}
            className={`
              flex items-center gap-1 font-medium transition-colors
              ${
                countdown > 0
                  ? 'text-content-muted cursor-not-allowed'
                  : 'text-sage-700 hover:text-sage-800 underline'
              }
            `}
          >
            <RefreshCw className={`w-3 h-3 ${countdown > 0 ? '' : 'hover:rotate-180 transition-transform'}`} />
            {countdown > 0 ? `Resend code (${countdown}s)` : 'Resend code'}
          </button>

          <Link
            to="/signup"
            className="text-content-secondary hover:text-content-primary transition-colors underline"
          >
            Change email
          </Link>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-subtle/70 border border-surface-border">
          <p className="text-xs text-content-muted text-center leading-relaxed">
            Can't find it? Check your spam folder before requesting a new code.
          </p>
        </div>
      </div>
    </div>
  );
};
