import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { SixDigitInput } from '../components/common/SixDigitInput';
import { Mail, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('alex.morgan@example.com');
  const [code, setCode] = useState('246810');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Request Code
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 400);
  };

  // Step 2: Verify Code
  const handleVerifyCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length < 6) {
      setError('Please enter all 6 digits of the code');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 400);
  };

  // Step 3: Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login?resetSuccess=true');
    }, 400);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Step Indicator Header */}
      <div className="mb-6">
        <div className="inline-block px-2.5 py-1 rounded-md bg-sage-100 text-sage-800 text-[11px] font-bold tracking-wider uppercase mb-3">
          {step === 1 && '1 REQUEST A CODE'}
          {step === 2 && '2 VERIFY YOUR CODE'}
          {step === 3 && '3 RESET YOUR PASSWORD'}
        </div>

        <h1 className="text-2xl font-bold text-content-primary tracking-tight">
          {step === 1 && 'Verify your email.'}
          {step === 2 && 'Verify your code.'}
          {step === 3 && 'Reset your password.'}
        </h1>

        <p className="mt-1 text-sm text-content-secondary">
          {step === 1 && "We'll send a verification code so you get your account back."}
          {step === 2 && 'Enter the 6 digit code we sent to your email.'}
          {step === 3 && 'Choose a new password and confirm it.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Step 1: Request Code Form */}
      {step === 1 && (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.morgan@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
            Send verification code
          </Button>
        </form>
      )}

      {/* Step 2: Verify Code Form */}
      {step === 2 && (
        <div className="space-y-6">
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
              onComplete={() => handleVerifyCode()}
            />
          </div>

          <Button
            type="button"
            fullWidth
            size="lg"
            isLoading={isLoading}
            onClick={() => handleVerifyCode()}
            className="mt-2"
          >
            Verify code
          </Button>
        </div>
      )}

      {/* Step 3: Reset Password Form */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="New password"
            type={showPassword ? 'text' : 'password'}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
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
            placeholder="Re-enter your new password"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
            Reset password
          </Button>
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
