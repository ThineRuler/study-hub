import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isNotVerified, setIsNotVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetSuccess = searchParams.get('resetSuccess');
  const verifiedSuccess = searchParams.get('verified');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsNotVerified(false);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Failed to sign in';
      setError(msg);
      if (err.status === 403 || msg.toLowerCase().includes('not verified')) {
        setIsNotVerified(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-content-primary tracking-tight">
          Welcome back!
        </h1>
        <p className="mt-1 text-sm text-content-secondary">
          StudyHub has your day planned, take it at your own pace.
        </p>
      </div>

      {verifiedSuccess && (
        <div className="mb-4 p-3.5 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-900 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0" />
          <span>Email successfully verified! You can now log in below.</span>
        </div>
      )}

      {resetSuccess && (
        <div className="mb-4 p-3.5 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-900 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0" />
          <span>Password reset successful! You can now log in with your new password.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>{error}</p>
              {isNotVerified && (
                <Link
                  to={`/verify-email?email=${encodeURIComponent(email)}`}
                  className="font-bold underline block text-red-800"
                >
                  Click here to verify your email address →
                </Link>
              )}
            </div>
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <div className="flex justify-end mt-1.5">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-sage-700 hover:text-sage-800 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="mt-2">
          Log In
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-surface-border text-center">
        <p className="text-sm text-content-secondary">
          New to StudyHub?{' '}
          <Link to="/signup" className="font-semibold text-sage-700 hover:text-sage-800 hover:underline">
            Sign Up →
          </Link>
        </p>
      </div>

      <div className="mt-6 p-3.5 rounded-xl bg-surface-subtle/70 border border-surface-border">
        <p className="text-xs text-content-muted text-center">
          Your login opens <strong className="text-content-secondary font-medium">Daily Digest</strong>, a focused view of today's plan.
        </p>
      </div>
    </div>
  );
};
