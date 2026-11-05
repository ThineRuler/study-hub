import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pendingEmail, autoLoginIfVerified } = useAuth();

  const email = searchParams.get('email') || pendingEmail || '';

  const [isVerified, setIsVerified] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // 30-second countdown for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Poll verification status every 2 seconds
  useEffect(() => {
    if (!email || isVerified) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await authApi.checkVerificationStatus(email);
        if (res.isVerified && isMounted) {
          setIsVerified(true);
          setIsRedirecting(true);
          clearInterval(interval);

          // Try automatic login into daily digest
          const loggedIn = await autoLoginIfVerified(email);
          setTimeout(() => {
            if (loggedIn) {
              navigate('/dashboard');
            } else {
              navigate('/login?verified=true');
            }
          }, 1200);
        }
      } catch {
        // Still pending or network poll retry
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [email, isVerified, autoLoginIfVerified, navigate]);

  const handleResend = async () => {
    if (countdown > 0 || isResending || !email) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      await authApi.resendVerification(email);
      setResendStatus('Verification email sent! Check your inbox.');
      setCountdown(30);
    } catch (err: any) {
      setResendStatus(err.message || 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-6">
        <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center mb-5 shadow-xs">
          {isVerified ? (
            <CheckCircle2 className="w-6 h-6 text-sage-700" />
          ) : (
            <Mail className="w-6 h-6" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-content-primary tracking-tight">
          {isVerified ? 'Email Verified!' : 'Check your inbox'}
        </h1>

        <p className="mt-2 text-sm text-content-secondary leading-relaxed">
          {isVerified ? (
            'Your account is confirmed. Redirecting you to your personal workspace...'
          ) : (
            <>
              We sent a verification link to{' '}
              <strong className="text-content-primary font-semibold">{email || 'your email'}</strong>. Once you click the link to verify, this page will automatically redirect you to your Daily Digest.
            </>
          )}
        </p>
      </div>

      <div className="space-y-5">
        {/* Verification Status Animation Box */}
        {isVerified || isRedirecting ? (
          <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-sage-700 shrink-0" />
            <div>
              <p className="text-xs font-bold text-sage-900">Verification successful!</p>
              <p className="text-[11px] text-sage-700 mt-0.5">
                Entering your Daily Digest...
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-sage-50/70 border border-sage-200/90 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-sage-600 animate-spin shrink-0" />
            <div>
              <p className="text-xs font-bold text-sage-900">
                Waiting for verification...
              </p>
            </div>
          </div>
        )}

        {/* Resend code timer button */}
        {!isVerified && (
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
                <span>Resend code in {countdown}s</span>
              ) : (
                <span>Resend code</span>
              )}
            </button>

            {resendStatus && (
              <p className="text-[11px] text-center text-sage-800 font-medium">
                {resendStatus}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs pt-2 border-t border-surface-border">
          <Link
            to="/login"
            className="text-sage-700 hover:text-sage-800 font-medium hover:underline"
          >
            Go to Log In →
          </Link>

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
