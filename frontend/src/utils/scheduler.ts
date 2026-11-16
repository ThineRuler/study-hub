import { TaskItem } from '../api/taskApi';

export interface DayBucket {
  dayIndex: number;
  dateStr: string;
  dayLabel: string;
  dateNumber: number;
  isToday: boolean;
  usedPomodoros: number;
  breathingRoom: number;
  tasks: TaskItem[];
}

export interface ScheduleResult {
  dayBuckets: DayBucket[];
  todayTasks: TaskItem[];
  deferredTasks: TaskItem[];
  todayPomodoros: number;
  deferredPomodoros: number;
}

export function parseCalendarDate(dueDate?: string | Date): { year: number; month: number; day: number; dateStr: string } | null {
  if (!dueDate) return null;
  const str = typeof dueDate === 'string' ? dueDate : dueDate.toISOString();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10),
      day: parseInt(match[3], 10),
      dateStr: `${match[1]}-${match[2]}-${match[3]}`,
    };
  }
  const d = new Date(dueDate);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return {
    year,
    month,
    day,
    dateStr: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
}

export function isCompletedToday(completedAt?: string | Date, todayStr: string = getLocalDateString()): boolean {
  if (!completedAt) return false;
  const d = typeof completedAt === 'string' ? new Date(completedAt) : completedAt;
  if (isNaN(d.getTime())) return false;
  return getLocalDateString(d) === todayStr;
}

export function formatDueDate(dueDate?: string | Date): string {
  if (!dueDate) return '';
  const parsed = parseCalendarDate(dueDate);
  if (parsed) {
    return `${parsed.month}/${parsed.day}/${parsed.year}`;
  }
  return new Date(dueDate).toLocaleDateString();
}

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function computeClientSchedule(
  tasks: TaskItem[],
  settings: {
    dailyCap?: number;
    weights?: { importance: number; dueDate: number; time: number };
    invertConfidence?: boolean;
  },
  options: {
    now?: Date | string;
    completedTodayPomodoros?: number;
  } = {}
): ScheduleResult {
  const dailyCap = typeof settings?.dailyCap === 'number' && settings.dailyCap > 0 ? settings.dailyCap : 8;
  const weights = settings?.weights || { importance: 0.5, dueDate: 0.35, time: 0.15 };
  const invertConfidence = settings?.invertConfidence !== false; // default true
  const completedTodayPomodoros = typeof options.completedTodayPomodoros === 'number'
    ? options.completedTodayPomodoros
    : 0;

  const now = options.now ? new Date(options.now) : new Date();
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const dayBuckets: DayBucket[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dayBuckets.push({
      dayIndex: i,
      dateStr,
      dayLabel: i === 0 ? 'TODAY' : dayNames[d.getDay()],
      dateNumber: d.getDate(),
      isToday: i === 0,
      usedPomodoros: i === 0 ? completedTodayPomodoros : 0,
      breathingRoom: dailyCap,
      tasks: [],
    });
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // Filter only active uncompleted actionable tasks (exclude workspaces / parent tasks)
  const activeTasks = tasks.filter((t) => {
    if (t.completed) return false;
    if (t.isWorkspace) return false;
    if (tasks.some((other) => other.parentTaskId === t._id)) return false;
    return true;
  });

  // 1. Calculate priority score and due days
  const scored = activeTasks.map((task) => {
    let daysUntilDue = Infinity;
    if (task.dueDate) {
      const parts = parseCalendarDate(task.dueDate);
      if (parts) {
        const dueStart = new Date(parts.year, parts.month - 1, parts.day).getTime();
        daysUntilDue = Math.round((dueStart - todayStart) / 86400000);
      }
    }

    let urgency = 0;
    if (task.dueDate) {
      if (daysUntilDue < 0) {
        urgency = 1.0 + Math.min(1.0, Math.abs(daysUntilDue) * 0.1);
      } else if (daysUntilDue === 0) {
        urgency = 1.0;
      } else {
        urgency = 1 / (1 + daysUntilDue);
      }
    }

    const quickness = 1 / Math.max(1, task.estPomodoros || 1);
    const rawImportance = task.importance ?? 0.5;
    const importanceFactor = invertConfidence === false ? 1 - rawImportance : rawImportance;
    const priority =
      weights.importance * importanceFactor + weights.dueDate * urgency + weights.time * quickness;

    return {
      ...task,
      daysUntilDue,
      priorityScore: task.priorityScore ?? priority,
    };
  });

  // 2. Sort tasks by urgency and priority
  scored.sort((a, b) => {
    const aOverdueOrDueToday = a.daysUntilDue <= 0;
    const bOverdueOrDueToday = b.daysUntilDue <= 0;
    if (aOverdueOrDueToday && !bOverdueOrDueToday) return -1;
    if (!aOverdueOrDueToday && bOverdueOrDueToday) return 1;

    if (Math.abs((b.priorityScore || 0) - (a.priorityScore || 0)) > 0.0001) {
      return (b.priorityScore || 0) - (a.priorityScore || 0);
    }
    if (a.daysUntilDue !== b.daysUntilDue) {
      return a.daysUntilDue - b.daysUntilDue;
    }
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  // 3. Distribute tasks across 7 days
  // Tasks are packed into the earliest day where they fit within dailyCap.
  // Tasks CANNOT be pushed past their due date, and deferred tasks stay deferred.
  const todayTasks: TaskItem[] = [];
  const deferredTasks: TaskItem[] = [];

  for (const task of scored) {
    const cost = Math.max(1, task.estPomodoros || 1);
    let assignedDay = -1;

    // Determine the latest day this task can possibly be scheduled.
    // If dueDate is set, it CANNOT be pushed past its due date.
    const hasDueDate = task.dueDate != null && task.dueDate !== '';
    const latestAllowedDay = hasDueDate && isFinite(task.daysUntilDue)
      ? Math.max(0, task.daysUntilDue)
      : Infinity;

    // A task that was already deferred to a future day (scheduledDay > 0)
    // and is due in the future (daysUntilDue > 0) must NOT be pulled into Day 0.
    const isPreviouslyDeferred = typeof task.scheduledDay === 'number' && task.scheduledDay > 0;
    const minSearchDay = (isPreviouslyDeferred && task.daysUntilDue > 0) ? 1 : 0;
    const maxSearchDay = Math.min(6, latestAllowedDay);

    for (let d = minSearchDay; d <= maxSearchDay; d++) {
      const bucket = dayBuckets[d];
      if (bucket.usedPomodoros + cost <= dailyCap || bucket.usedPomodoros === 0) {
        bucket.usedPomodoros += cost;
        bucket.tasks.push(task);
        assignedDay = d;
        task.scheduledDay = d;
        task.scheduledDate = bucket.dateStr;
        break;
      }
    }

    // If it couldn't fit within dailyCap on any day up to latestAllowedDay:
    if (assignedDay === -1) {
      if (latestAllowedDay < 7) {
        // Find the day between minSearchDay and maxSearchDay with the least load
        let bestDay = minSearchDay;
        let minUsed = dayBuckets[minSearchDay].usedPomodoros;
        for (let d = minSearchDay + 1; d <= maxSearchDay; d++) {
          if (dayBuckets[d].usedPomodoros < minUsed) {
            minUsed = dayBuckets[d].usedPomodoros;
            bestDay = d;
          }
        }
        const bucket = dayBuckets[bestDay];
        bucket.usedPomodoros += cost;
        bucket.tasks.push(task);
        assignedDay = bestDay;
        task.scheduledDay = bestDay;
        task.scheduledDate = bucket.dateStr;
      } else {
        // Task has no due date or is due after Day 6.
        // It safely overflows past the 7-day window without violating its due date.
        assignedDay = -1;
        task.scheduledDay = undefined;
        task.scheduledDate = undefined;
      }
    }

    if (assignedDay === 0) {
      todayTasks.push(task);
    } else {
      deferredTasks.push(task);
    }
  }

  // Update breathing room for each bucket
  for (const bucket of dayBuckets) {
    bucket.breathingRoom = Math.max(0, dailyCap - bucket.usedPomodoros);
  }

  const todayPomodoros = todayTasks.reduce((sum, t) => sum + (t.estPomodoros || 1), 0);
  const deferredPomodoros = deferredTasks.reduce((sum, t) => sum + (t.estPomodoros || 1), 0);

  return {
    dayBuckets,
    todayTasks,
    deferredTasks,
    todayPomodoros,
    deferredPomodoros,
  };
}
