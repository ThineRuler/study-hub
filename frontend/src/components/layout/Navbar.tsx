import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-surface-bg/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-sage-600 flex items-center justify-center text-white shadow-xs group-hover:bg-sage-700 transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold text-content-primary tracking-tight">
            StudyHub
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {[
            { path: '/', label: 'Welcome' },
            { path: '/about', label: 'About' },
            { path: '/credits', label: 'Credits' },
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive(link.path)
                    ? 'text-sage-800 bg-sage-100 dark:text-sage-100 dark:bg-sage-900 font-semibold'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-subtle transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-sage-700" />
            )}
          </button>

          <Link
            to="/login"
            className="px-3.5 py-1.5 text-sm font-medium text-content-primary hover:text-sage-700 hover:bg-surface-subtle rounded-lg transition-colors"
          >
            Log In
          </Link>

          <Link
            to="/signup"
            className="px-4 py-1.5 text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 active:bg-sage-800 rounded-lg shadow-xs transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};
