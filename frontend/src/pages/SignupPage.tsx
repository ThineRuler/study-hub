import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please provide a display name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signup(displayName.trim(), email.trim(), password);
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-content-primary tracking-tight">
          Create Account
        </h1>
        <p className="mt-1 text-sm text-content-secondary">
          This is the start of a productive beginning.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Display name"
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
        />

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
            helperText="Use at least 8 characters. Make it something unique."
          />
        </div>

        <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200">
          <p className="text-xs text-sage-800 leading-relaxed font-medium">
            Next, we'll email a verification link to confirm your address.
          </p>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="mt-2">
          Continue to verification
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-surface-border text-center">
        <p className="text-sm text-content-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-sage-700 hover:text-sage-800 hover:underline">
            Log In →
          </Link>
        </p>
      </div>
    </div>
  );
};
