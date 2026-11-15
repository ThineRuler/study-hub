const Task = require('../database/models/Tasks');
const User = require('../database/models/User');
const { priorityScore, parseCalendarDate } = require('./priority');

function getLocalDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Pure scheduling logic that takes active tasks and user settings,
 * prioritizes them, and distributes them across a 7-day rolling window
 * respecting dailyCap, algorithm weights, and confidence inversion.
 */
function computeSchedule(tasks, settings, options = {}) {
  const dailyCap = typeof settings?.dailyCap === 'number' && settings.dailyCap > 0 ? settings.dailyCap : 8;
  const weights = settings?.weights || { importance: 0.5, dueDate: 0.35, time: 0.15 };
  const invertConfidence = settings?.invertConfidence !== false; // default true
  const now = options.now ? new Date(options.now) : new Date();
  const completedTodayPomodoros = typeof options.completedTodayPomodoros === 'number'
    ? options.completedTodayPomodoros
    : 0;

  // Generate 7-day window (Day 0 = Today, Day 1 = Tomorrow, ..., Day 6 = Today + 6)
  const dayBuckets = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    dayBuckets.push({
      dayIndex: i,
      dateStr: getLocalDateString(d),
      usedPomodoros: i === 0 ? completedTodayPomodoros : 0,
      tasks: [],
    });
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // Separate workspace / parent tasks from actionable tasks
  const workspaceTasks = [];
  const actionableTasks = [];

  for (const task of tasks) {
    const t = typeof task.toObject === 'function' ? task.toObject() : { ...task };
    const tId = t._id?.toString?.() || String(t._id);
    const isParent = t.isWorkspace || tasks.some((other) => {
      const pId = other.parentTaskId?.toString?.() || (other.parentTaskId ? String(other.parentTaskId) : null);
      return pId && pId === tId;
    });

    if (isParent) {
      t.scheduledDay = null;
      t.scheduledDate = null;
      workspaceTasks.push(t);
    } else {
      actionableTasks.push(t);
    }
  }

  // 1. Calculate priorityScore and daysUntilDue for each actionable task
  const scoredTasks = actionableTasks.map((t) => {
    let daysUntilDue = Infinity;

    if (t.dueDate) {
      const parts = parseCalendarDate(t.dueDate);
      if (parts) {
        const dueStart = new Date(parts.year, parts.month - 1, parts.day).getTime();
        daysUntilDue = Math.round((dueStart - todayStart) / 86400000);
      }
    }

    t.daysUntilDue = daysUntilDue;
    t.priorityScore = priorityScore(t, weights, { invertConfidence, now });
    return t;
  });

  // 2. Sort tasks by urgency and priorityScore
  scoredTasks.sort((a, b) => {
    const aOverdueOrDueToday = a.daysUntilDue <= 0;
    const bOverdueOrDueToday = b.daysUntilDue <= 0;

    // Overdue and Due Today tasks take precedence
    if (aOverdueOrDueToday && !bOverdueOrDueToday) return -1;
    if (!aOverdueOrDueToday && bOverdueOrDueToday) return 1;

    // Sort by priorityScore descending
    if (Math.abs(b.priorityScore - a.priorityScore) > 0.0001) {
      return b.priorityScore - a.priorityScore;
    }

    // Earlier due date first
    if (a.daysUntilDue !== b.daysUntilDue) {
      return a.daysUntilDue - b.daysUntilDue;
    }

    // Manual sort order
    if ((a.sortOrder || 0) !== (b.sortOrder || 0)) {
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    }

    // Older tasks first
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });

  // 3. Distribute tasks into the 7-day window
  // Tasks are packed into the earliest day where they fit within dailyCap.
  // Tasks CANNOT be pushed past their due date, and deferred tasks stay deferred.
  const scheduledTasks = [];
  const deferredTasks = [];

  for (const task of scoredTasks) {
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
      } else {
        // Task has no due date or is due after Day 6.
        // It safely overflows past the 7-day window without violating its due date.
        assignedDay = -1;
      }
    }

    if (assignedDay >= 0) {
      task.scheduledDay = assignedDay;
      task.scheduledDate = dayBuckets[assignedDay].dateStr;
      scheduledTasks.push(task);
    } else {
      // Overflows past the 7-day window
      task.scheduledDay = null;
      task.scheduledDate = null;
      deferredTasks.push(task);
    }
  }

  return {
    dayBuckets,
    scheduledTasks,
    deferredTasks,
    workspaceTasks,
    allTasks: [...scheduledTasks, ...deferredTasks, ...workspaceTasks],
  };
}

/**
 * Runs the algorithm for a user, recalculates priority scores,
 * scheduledDate, and scheduledDay for all uncompleted tasks,
 * and persists the results to MongoDB.
 */
async function scheduleTasksForUser(userId, options = {}) {
  if (!userId) return [];

  const now = options.now ? new Date(options.now) : new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [user, tasks, completedTodayTasks, allParentIds] = await Promise.all([
    User.findById(userId).select('settings').lean(),
    Task.find({ userId, completed: false }),
    Task.find({
      userId,
      completed: true,
      isWorkspace: { $ne: true },
      completedAt: { $gte: todayStart },
    }).select('_id estPomodoros parentTaskId'),
    Task.distinct('parentTaskId', { userId, parentTaskId: { $ne: null } }),
  ]);

  const parentIdSet = new Set(allParentIds.map((id) => id.toString()));
  const completedTodayPomodoros = completedTodayTasks
    .filter((t) => !parentIdSet.has(t._id.toString()))
    .reduce((sum, t) => sum + (t.estPomodoros || 1), 0);

  const settings = user?.settings || {};
  const { allTasks } = computeSchedule(tasks, settings, {
    now,
    completedTodayPomodoros,
  });

  const ops = allTasks.map((t) => ({
    updateOne: {
      filter: { _id: t._id, userId },
      update: {
        $set: {
          priorityScore: t.priorityScore,
          scheduledDate: t.scheduledDate,
          scheduledDay: t.scheduledDay,
        },
      },
    },
  }));

  if (ops.length > 0) {
    await Task.bulkWrite(ops);
  }

  return allTasks;
}

module.exports = {
  getLocalDateString,
  computeSchedule,
  scheduleTasksForUser,
};
