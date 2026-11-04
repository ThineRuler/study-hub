import React from 'react';
import { Button } from '../components/common/Button';
import { Calendar as CalendarIcon, ExternalLink, Check } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
            <span>CALENDAR</span>
            <span>·</span>
            <span>OCTOBER 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            Deadlines, at a glance.
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            Final due dates only. Scheduled work sessions stay in Next 7 Days.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => alert('Calendar synced!')}>
          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
          Send to Google Calendar
        </Button>
      </div>

      {/* Calendar Grid Representation */}
      <div className="rounded-3xl border border-surface-border bg-white p-6 shadow-xs overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 pb-3 border-b border-surface-border text-center text-xs font-bold text-content-muted">
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
          <span>SUN</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 pt-3 min-h-[360px]">
          {/* Prior days */}
          <div className="p-2 rounded-xl bg-surface-subtle/40 text-xs text-content-muted">
            <span className="font-bold">26</span>
            <p className="text-[11px] text-sage-700 mt-1 flex items-center gap-1 font-medium">
              <Check className="w-3 h-3" /> Project brief
            </p>
          </div>
          <div className="p-2 rounded-xl bg-surface-subtle/40 text-xs text-content-muted">
            <span className="font-bold">27</span>
          </div>
          <div className="p-2 rounded-xl bg-surface-subtle/40 text-xs text-content-muted">
            <span className="font-bold">28</span>
            <p className="text-[11px] text-sage-700 mt-1 flex items-center gap-1 font-medium">
              <Check className="w-3 h-3" /> Reading list
            </p>
          </div>
          <div className="p-2 rounded-xl bg-surface-subtle/40 text-xs text-content-muted">
            <span className="font-bold">29</span>
            <p className="text-[11px] text-sage-700 mt-1 flex items-center gap-1 font-medium">
              <Check className="w-3 h-3" /> Profile bio
            </p>
          </div>

          {/* Today - 30 */}
          <div className="p-2 rounded-xl border border-sage-500 bg-sage-50 text-xs shadow-xs">
            <div className="flex items-center justify-between font-bold text-sage-900">
              <span>30</span>
              <span className="text-[9px] uppercase px-1 rounded bg-sage-200">Today</span>
            </div>
            <p className="text-[11px] text-red-600 font-semibold mt-1">Clear client inbox</p>
            <p className="text-[11px] text-sage-700 mt-0.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> Outline case study
            </p>
            <p className="text-[11px] text-sage-700 mt-0.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> Mindful walk
            </p>
          </div>

          <div className="p-2 rounded-xl border border-surface-border bg-white text-xs">
            <span className="font-bold text-content-primary">31</span>
            <p className="text-[11px] text-content-secondary mt-1 font-medium">Read design notes</p>
          </div>

          <div className="p-2 rounded-xl border border-surface-border bg-white text-xs">
            <span className="font-bold text-content-primary">1</span>
            <p className="text-[11px] text-content-secondary mt-1 font-medium">Grocery essentials</p>
          </div>
        </div>
      </div>

      {/* Upcoming notice */}
      <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200">
        <p className="text-xs text-sage-900 font-medium leading-relaxed">
          <strong>Coming up:</strong> Launch portfolio is due Tuesday, Nov 3. Its four subtasks share this final deadline. Their work sessions are planned separately across Oct 30 – Nov 3.
        </p>
      </div>
    </div>
  );
};
