import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, ArrowRight, Clock, BookOpen, Briefcase } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Your personal workspace, on Web and Android
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-content-primary tracking-tight leading-[1.15]">
            Big things. <br />
            <span className="text-sage-700">Small steps.</span> <br />
            Steadier days.
          </h1>

          <p className="text-base sm:text-lg text-content-secondary leading-relaxed max-w-lg">
            Turn the tasks you've been avoiding into something you can begin. StudyHub breaks it down and makes room for it in your week.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-xl bg-sage-600 text-white font-semibold hover:bg-sage-700 active:bg-sage-800 shadow-sm transition-all flex items-center gap-2 text-sm"
            >
              Sign Up <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl border border-surface-border bg-white text-content-primary font-semibold hover:bg-surface-subtle transition-all text-sm"
            >
              Log In
            </Link>
          </div>
        </div>

        {/* Hero Interactive Wireframe Card */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sage-700">
                  DAILY DIGEST · FRIDAY, OCTOBER 30
                </p>
                <h3 className="text-xl font-bold text-content-primary">A little forward.</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-sage-50 border border-sage-200 text-xs font-medium text-sage-800">
                2 of 5 tasks done
              </span>
            </div>

            {/* Completion Bar */}
            <div className="my-4">
              <div className="flex justify-between text-xs text-content-muted mb-1.5 font-medium">
                <span>2 completed</span>
                <span>3 remaining</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
                <div className="h-full bg-sage-600 rounded-full transition-all" style={{ width: '40%' }} />
              </div>
            </div>

            {/* Task Cards Preview */}
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl border border-surface-border bg-surface-bg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-sage-100 text-sage-800 text-xs font-bold flex items-center justify-center">
                    01
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-content-primary">Read design notes</p>
                    <div className="flex items-center gap-2 text-xs text-content-muted mt-0.5">
                      <span className="text-sage-700 font-medium">Learning</span>
                      <span>·</span>
                      <span>Confidence 7/10</span>
                      <span>·</span>
                      <span>Due Oct 31</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-white px-2 py-1 rounded border border-surface-border">
                  1 ◷
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-surface-border bg-surface-bg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-sage-100 text-sage-800 text-xs font-bold flex items-center justify-center">
                    02
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-content-primary">Clear client inbox</p>
                    <div className="flex items-center gap-2 text-xs text-content-muted mt-0.5">
                      <span className="text-amber-700 font-medium">Work</span>
                      <span>·</span>
                      <span>Confidence 5/10</span>
                      <span>·</span>
                      <span className="text-red-600 font-medium">Due Today</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-white px-2 py-1 rounded border border-surface-border">
                  2 ◷
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-surface-border bg-surface-bg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-sage-100 text-sage-800 text-xs font-bold flex items-center justify-center">
                    03
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-content-primary">Launch portfolio / subtask</p>
                    <p className="text-xs text-content-secondary">Choose featured projects</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-white px-2 py-1 rounded border border-surface-border">
                  2 ◷
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-border text-center">
              <p className="text-xs font-medium text-sage-700">
                A realistic plan. Not an endless to-do list.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
