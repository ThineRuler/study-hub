function parseCalendarDate(dueDate) {
  if (!dueDate) return null;
  const str = typeof dueDate === 'string' ? dueDate : (dueDate.toISOString ? dueDate.toISOString() : String(dueDate));
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

function priorityScore(task, weights, options = {}) {
  const w = weights || { importance: 0.5, dueDate: 0.35, time: 0.15 };
  let urgency = 0;

  if (task.dueDate) {
    const now = options.now ? new Date(options.now) : new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const parts = parseCalendarDate(task.dueDate);
    if (parts) {
      const dueDay = new Date(parts.year, parts.month - 1, parts.day);
      const days = Math.round((dueDay.getTime() - today.getTime()) / 86400000);

      if (days < 0) {
        // Overdue: maximum urgency plus overdue increment
        urgency = 1.0 + Math.min(1.0, Math.abs(days) * 0.1);
      } else if (days === 0) {
        // Due today: critical urgency
        urgency = 1.0;
      } else {
        // Due in future days
        urgency = 1 / (1 + days);
      }
    }
  }

  const quickness = 1 / Math.max(1, task.estPomodoros || 1);
  const rawImportance = task.importance ?? 0.5;
  // If invertConfidence is false (Eat the frog), lower confidence is scheduled earlier
  // If invertConfidence is true (Flow state), higher confidence is scheduled earlier
  const importanceFactor = options.invertConfidence === false ? (1 - rawImportance) : rawImportance;

  return (w.importance * importanceFactor) + (w.dueDate * urgency) + (w.time * quickness);
}

module.exports = { priorityScore, parseCalendarDate };
