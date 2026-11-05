function priorityScore(task, weights) {
  const w = weights || { importance: 0.5, dueDate: 0.35, time: 0.15 };
  let urgency = 0;
  if (task.dueDate) {
    const days = (new Date(task.dueDate) - Date.now()) / 86400000;
    urgency = days <= 0 ? 1 : 1 / (1 + days);
  }
  const quickness = 1 / (task.estPomodoros || 1);
  return w.importance * (task.importance ?? 0.5) + w.dueDate * urgency + w.time * quickness;
}
module.exports = { priorityScore };
