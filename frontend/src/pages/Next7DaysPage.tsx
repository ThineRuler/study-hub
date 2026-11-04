import React from 'react';
import { CalendarDays, AlertTriangle, ArrowRight } from 'lucide-react';

export const Next7DaysPage: React.FC = () => {
  const days = [
    {
      date: '30',
      day: 'TODAY',
      used: 8,
      cap: 8,
      tasks: [
        { name: 'Outline case study', pomodoros: 2, completed: true, group: 'Work' },
        { name: 'Mindful walk', pomodoros: 1, completed: true, group: 'Personal' },
        { name: 'Grocery essentials', pomodoros: 1, completed: false, group: 'Personal' },
        { name: 'Read design notes', pomodoros: 1, completed: false, group: 'Learning' },
        { name: 'Clear client inbox', pomodoros: 2, completed: false, group: 'Work' },
        { name: 'Choose featured projects', pomodoros: 2, completed: false, group: 'Work' },
      ],
      breathingRoom: 0,
    },
    {
      date: '31',
      day: 'SAT',
      used: 4,
      cap: 8,
      tasks: [
        { name: 'Write project summaries', pomodoros: 3, completed: false, group: 'Work' },
        { name: 'Weekly reset', pomodoros: 1, completed: false, group: 'Personal' },
      ],
      breathingRoom: 4,
    },
    {
      date: '1',
      day: 'SUN',
      used: 4,
      cap: 8,
      tasks: [
        { name: 'Polish portfolio layout', pomodoros: 2, completed: false, group: 'Work' },
        { name: 'Course study', pomodoros: 2, completed: false, group: 'Learning' },
      ],
      breathingRoom: 4,
    },
    {
      date: '2',
      day: 'MON',
      used: 2,
      cap: 8,
      tasks: [
        { name: 'Review course chapter', pomodoros: 2, completed: false, group: 'Learning' },
      ],
      breathingRoom: 6,
    },
    {
      date: '3',
      day: 'TUE',
      used: 1,
      cap: 8,
      tasks: [
        { name: 'Publish portfolio', pomodoros: 1, completed: false, group: 'Work' },
      ],
      breathingRoom: 7,
    },
    {
      date: '4',
      day: 'WED',
      used: 2,
      cap: 8,
      tasks: [
        { name: 'Reconcile budget', pomodoros: 2, completed: false, group: 'Personal' },
      ],
      breathingRoom: 6,
    },
    {
      date: '5',
      day: 'THU',
      used: 2,
      cap: 8,
      tasks: [
        { name: 'Plan next sprint', pomodoros: 2, completed: false, group: 'Work' },
      ],
      breathingRoom: 6,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
          <span>YOUR ROLLING PLAN</span>
          <span>·</span>
          <span>OCT 30 – NOV 5, 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          Looking a week ahead.
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          A plan with room to breathe. 8 daily cap prevents burnout.
        </p>
      </div>

      {/* 7 Columns Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        {days.map((col) => (
          <div
            key={col.day + col.date}
            className={`
              flex flex-col rounded-2xl border p-3.5 transition-all
              ${
                col.day === 'TODAY'
                  ? 'border-sage-400 bg-sage-50/60 shadow-xs ring-1 ring-sage-300'
                  : 'border-surface-border bg-white shadow-xs'
              }
            `}
          >
            {/* Column Header */}
            <div className="border-b border-surface-border pb-2.5 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sage-800">
                  {col.day}
                </span>
                <span className="text-sm font-extrabold text-content-primary">
                  {col.date}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-content-muted mt-1">
                <span className="font-semibold text-content-primary">
                  {col.used} / {col.cap} ◷
                </span>
                {col.breathingRoom > 0 && (
                  <span className="text-[10px] text-sage-700 font-medium">
                    +{col.breathingRoom} free
                  </span>
                )}
              </div>
            </div>

            {/* Task Cards in Column */}
            <div className="space-y-2 flex-1">
              {col.tasks.map((t, idx) => (
                <div
                  key={idx}
                  className={`
                    p-2.5 rounded-xl border text-xs transition-colors
                    ${
                      t.completed
                        ? 'border-surface-border bg-surface-subtle/70 opacity-60'
                        : 'border-surface-border bg-white hover:border-sage-300'
                    }
                  `}
                >
                  <p className={`font-semibold ${t.completed ? 'line-through text-content-muted' : 'text-content-primary'}`}>
                    {t.name}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-content-muted">
                    <span className="text-sage-800 font-medium">{t.group}</span>
                    <span className="font-mono font-bold bg-surface-subtle px-1.5 py-0.5 rounded">
                      {t.pomodoros} ◷
                    </span>
                  </div>
                </div>
              ))}

              {/* Breathing Room Placeholder */}
              {col.breathingRoom > 0 && (
                <div className="p-2.5 rounded-xl border border-dashed border-sage-200 text-center">
                  <p className="text-[11px] font-medium text-sage-700">
                    {col.breathingRoom} sessions of breathing room
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer Box */}
      <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-content-primary">
            23 estimated Pomodoros across seven days
          </h4>
          <p className="text-xs text-content-secondary mt-0.5">
            Every task is at or below 4 sessions; every day stays within your 8-session target.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-sage-700">
          <span>Keep siblings on same day: Off</span>
        </div>
      </div>
    </div>
  );
};
