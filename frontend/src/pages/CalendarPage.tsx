import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Button } from '../components/common/Button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { tasks, completedTasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Compute days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Align to Monday-start (0 = Mon, 6 = Sun)
  const startOffset = (firstDayIndex + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const allTasks = [...tasks, ...completedTasks];

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
            <span>CALENDAR</span>
            <span>·</span>
            <span>DEADLINES AT A GLANCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            {monthName}
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            Final deadlines and scheduled due dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
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
        <div className="grid grid-cols-7 gap-2 pt-3">
          {/* Offset empty slots */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`offset-${i}`} className="p-2 rounded-xl bg-surface-subtle/30 min-h-[90px]" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;

            const dayTasks = allTasks.filter((t) => t.dueDate && t.dueDate.startsWith(dateStr));

            return (
              <div
                key={dayNum}
                className={`
                  p-2 rounded-xl border text-xs min-h-[90px] flex flex-col justify-between transition-colors
                  ${
                    isToday
                      ? 'border-sage-500 bg-sage-50/70 shadow-xs'
                      : 'border-surface-border/80 bg-white hover:border-sage-300'
                  }
                `}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className={isToday ? 'text-sage-900 font-extrabold' : 'text-content-secondary'}>
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-sage-200 text-sage-800">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-1 flex-1 overflow-y-auto">
                  {dayTasks.map((t) => (
                    <div
                      key={t._id}
                      className={`
                        text-[11px] p-1 rounded font-medium truncate flex items-center gap-1
                        ${
                          t.completed
                            ? 'bg-sage-100 text-sage-800 line-through'
                            : 'bg-surface-subtle text-content-primary font-semibold'
                        }
                      `}
                      title={t.name}
                    >
                      {t.completed && <Check className="w-3 h-3 text-sage-700 shrink-0" />}
                      <span className="truncate">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
