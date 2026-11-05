import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, Sliders } from 'lucide-react';
import { AccessibilityModal } from '../common/AccessibilityModal';

export const AuthLayout: React.FC = () => {
  const [isA11yOpen, setIsA11yOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-content-primary">
      {/* Top Navbar */}
      <header className="w-full border-b border-surface-border bg-surface-bg/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-sage-600 flex items-center justify-center text-white shadow-xs group-hover:bg-sage-700 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-content-primary tracking-tight">
              StudyHub
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsA11yOpen(true)}
              className="p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-subtle transition-colors"
              title="Accessibility Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <Link
              to="/"
              className="text-xs font-semibold uppercase tracking-wider text-content-secondary hover:text-sage-700 px-3 py-1.5 rounded-lg hover:bg-surface-subtle transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split Screen Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-surface-border bg-white shadow-lg overflow-hidden">
          {/* Left Hero Panel */}
          <div className="md:col-span-5 bg-gradient-to-b from-sage-100/90 via-sage-100/50 to-sage-50/80 p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-surface-border">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sage-600 text-white flex items-center justify-center mb-6 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight leading-tight mb-4">
                Make room for <br />
                <span className="text-sage-700">what matters.</span>
              </h2>

              <p className="text-sm text-content-secondary leading-relaxed">
                You don't have to do it all today. Start small, find your rhythm, and let your week take shape.
              </p>
            </div>

            <div className="pt-8">
              <div className="inline-block px-3 py-1 rounded-full bg-white/70 border border-sage-200 text-[11px] font-bold tracking-widest text-sage-800 uppercase mb-2">
                Small steps. Steadier days.
              </div>
              <p className="text-xs text-content-muted">
                StudyHub has your day planned, take it at your own pace.
              </p>
            </div>
          </div>

          {/* Right Interactive Form Panel */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-content-muted">
        StudyHub · Small steps, room to grow. Web & Android · A work in progress, like all good things.
      </footer>

      <AccessibilityModal isOpen={isA11yOpen} onClose={() => setIsA11yOpen(false)} />
    </div>
  );
};
