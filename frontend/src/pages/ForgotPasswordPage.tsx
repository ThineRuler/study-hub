import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { authApi } from '../api/authApi';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlToken = searchParams.get('token');
  const urlId = searchParams.get('id');

  // Steps: 'request' -> 'waiting' -> 'reset'
  const [step, setStep] = useState<'request' | 'waiting' | 'reset'>(urlToken ? 'reset' : 'request');

  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(urlId || '');
  const [token, setToken] = useState(urlToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 30s resend timer
  const [countdown, setCountdown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
      setStep('reset');
    }
    if (urlId) {
      setUserId(urlId);
    }
  }, [urlToken, urlId]);

  // Countdown timer for resend link
  useEffect(() => {
    if (step !== 'waiting' || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Polling for email link click while in 'waiting' step
  useEffect(() => {
    if (step !== 'waiting' || !email) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await authApi.checkResetStatus(email);
        if (res.isVerified && isMounted) {
          if (res.token) setToken(res.token);
          if (res.id) setUserId(res.id);
          clearInterval(interval);
          setStep('reset');
        }
      } catch {
        // Polling retry
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [step, email]);

  // Step 1: Submit Request Email
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await authApi.forgotPassword(email.trim());
      if (res.body?.user?._id) {
        setUserId(res.body.user._id);
      }
      setCountdown(30);
      setStep('waiting');
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend reset link
  const handleResend = async () => {
    if (countdown > 0 || isResending || !email) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      await authApi.forgotPassword(email.trim());
      setResendStatus('New reset link sent! Check your inbox.');
      setCountdown(30);
    } catch (err: any) {
      setResendStatus(err.message || 'Failed to resend link');
    } finally {
      setIsResending(false);
    }
  };

  // Step 3: Apply New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Missing reset token. Please click the reset link in your email.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({
        id: userId.trim(),
        token: token.trim(),
        newPassword,
      });
      navigate('/login?resetSuccess=true');
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Link may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-block px-2.5 py-1 rounded-md bg-sage-100 text-sage-800 text-[11px] font-bold tracking-wider uppercase mb-3">
          {step === 'request' && 'RESET PASSWORD'}
          {step === 'waiting' && 'CONFIRMATION PENDING'}
          {step === 'reset' && 'CHOOSE NEW PASSWORD'}
        </div>

        <h1 className="text-2xl font-bold text-content-primary tracking-tight">
          {step === 'request' && 'Forgot password?'}
          {step === 'waiting' && 'Check your inbox'}
          {step === 'reset' && 'Set new password'}
        </h1>

        <p className="mt-1 text-sm text-content-secondary leading-relaxed">
          {step === 'request' && "Enter your email address and we'll send a link to reset your password."}
          {step === 'waiting' && (
            <>
              We sent a password reset link to{' '}
              <strong className="text-content-primary font-semibold">{email}</strong>. Once you click the link in your email, you will be able to set your new password.
            </>
          )}
          {step === 'reset' && 'Create a strong, unique password for your account.'}
        </p>
      </div>

      {infoMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-900 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Request Email Form */}
      {step === 'request' && (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
            Send reset link
          </Button>
        </form>
      )}

      {/* Step 2: Waiting for link click */}
      {step === 'waiting' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-sage-50/70 border border-sage-200/90 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-sage-600 animate-spin shrink-0" />
            <div>
              <p className="text-xs font-bold text-sage-900">
                Waiting for reset link confirmation...
              </p>
              <p className="text-[11px] text-sage-700 mt-0.5">
                Click the link in your email on any tab or device.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              disabled={countdown > 0 || isResending}
              onClick={handleResend}
              className={`
                w-full text-xs font-semibold py-2.5 px-4 rounded-xl border transition-all flex items-center justify-center gap-1.5
                ${
                  countdown > 0 || isResending
                    ? 'border-surface-border bg-surface-subtle text-content-muted cursor-not-allowed'
                    : 'border-sage-300 bg-white text-sage-800 hover:bg-sage-50 hover:border-sage-400 cursor-pointer shadow-xs'
                }
              `}
            >
              {isResending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Resending...</span>
                </>
              ) : countdown > 0 ? (
                <span>Resend link in {countdown}s</span>
              ) : (
                <span>Resend reset link</span>
              )}
            </button>

            {resendStatus && (
              <p className="text-[11px] text-center text-sage-800 font-medium">
                {resendStatus}
              </p>
            )}
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setStep('request');
                setError('');
              }}
              className="text-xs text-content-secondary hover:text-content-primary underline"
            >
              Use a different email
            </button>
          </div>
        </div>
      )}

      {/* Step 3: New Password Form */}
      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="New password"
            type={showPassword ? 'text' : 'password'}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="At least 8 characters"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-content-muted hover:text-content-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Input
            label="Confirm new password"
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
            Reset password
          </Button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="text-xs text-content-secondary hover:text-content-primary underline"
            >
              Need a new link? Request again
            </button>
          </div>
        </form>
      )}

      {/* Back to Log In */}
      <div className="mt-6 pt-6 border-t border-surface-border text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-content-secondary hover:text-sage-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Log In
        </Link>
      </div>
    </div>
  );
};
