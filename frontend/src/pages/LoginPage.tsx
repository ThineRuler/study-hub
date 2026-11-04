import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('alex.morgan@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setIsLoading(true);
    // Simulate instantaneous client-side login per user request
    setTimeout(() => {
      login(email);
      setIsLoading(false);
      navigate('/dashboard');
    }, 300);
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex.morgan@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
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
