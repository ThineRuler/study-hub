import React from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { Check } from 'lucide-react';

export const Next7DaysPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, groups, toggleTask } = useTasks();

  const dailyCap = user?.settings?.dailyCap || 8;
  const groupMap = new Map(groups.map((g) => [g._id, g]));

  // Build the next 7 days starting from today
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = new Date();

  const sevenDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;

    // Filter tasks due on this date (or unscheduled tasks mapped to today)
    const dayTasks = tasks.filter((t) => {
      if (t.dueDate) {
        return t.dueDate.startsWith(dateStr);
      }
      return isToday;
    });

    const usedPomodoros = dayTasks.reduce((sum, t) => sum + (t.estPomodoros || 1), 0);
    const breathingRoom = Math.max(0, dailyCap - usedPomodoros);

    return {
      dateNumber: d.getDate(),
      dayLabel: isToday ? 'TODAY' : dayNames[d.getDay()],
      dateStr,
      isToday,
      tasks: dayTasks,
      usedPomodoros,
      breathingRoom,
    };
  });

  const totalWeekPomodoros = sevenDays.reduce((sum, d) => sum + d.usedPomodoros, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
          <span>YOUR ROLLING PLAN</span>
          <span>·</span>
          <span>NEXT 7 DAYS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          Looking a week ahead.
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          A plan with room to breathe. {dailyCap} daily cap protects against burnout.
        </p>
      </div>

      {/* 7 Columns Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        {sevenDays.map((col) => (
          <div
            key={col.dateStr}
            className={`
              flex flex-col rounded-2xl border p-3.5 transition-all
              ${
                col.isToday
                  ? 'border-sage-400 bg-sage-50/60 shadow-xs ring-1 ring-sage-300'
                  : 'border-surface-border bg-white shadow-xs'
              }
            `}
          >
            {/* Column Header */}
            <div className="border-b border-surface-border pb-2.5 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sage-800">
                  {col.dayLabel}
                </span>
                <span className="text-sm font-extrabold text-content-primary">
                  {col.dateNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-content-muted mt-1">
                <span className="font-semibold text-content-primary">
                  {col.usedPomodoros} / {dailyCap} ◷
                </span>
                {col.breathingRoom > 0 && (
                  <span className="text-[10px] text-sage-700 font-medium">
                    +{col.breathingRoom} free
                  </span>
                )}
              </div>
            </div>

            {/* Task Cards in Column */}
            <div className="space-y-2 flex-1 min-h-[160px]">
              {col.tasks.map((t) => {
                const grp = t.groupId ? groupMap.get(t.groupId) : undefined;
                return (
                  <div
                    key={t._id}
                    onClick={() => toggleTask(t._id, false)}
                    className="p-2.5 rounded-xl border border-surface-border bg-white hover:border-sage-300 text-xs transition-colors cursor-pointer group"
                  >
                    <p className="font-semibold text-content-primary group-hover:text-sage-800 transition-colors">
                      {t.name}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-[11px] text-content-muted">
                      {grp && (
                        <span className="font-medium truncate max-w-[70px]" style={{ color: grp.color }}>
                          {grp.name}
                        </span>
                      )}
                      <span className="font-mono font-bold bg-surface-subtle px-1.5 py-0.5 rounded ml-auto">
                        {t.estPomodoros || 1} ◷
                      </span>
                    </div>
                  </div>
                );
              })}

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
            {totalWeekPomodoros} estimated Pomodoros across seven days
          </h4>
          <p className="text-xs text-content-secondary mt-0.5">
            Every day stays within your {dailyCap}-session target. Click any task to mark it complete.
          </p>
        </div>
      </div>
    </div>
  );
};
