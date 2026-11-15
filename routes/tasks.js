const express = require('express');
const Task = require('../database/models/Tasks');
const Group = require('../database/models/Groups');
const User = require('../database/models/User');
const auth = require('../middleware/verify');
const { priorityScore } = require('../utils/priority');
const { scheduleTasksForUser } = require('../utils/scheduler');

const router = express.Router();
router.use(auth);

const PATCH_FIELDS = ['name', 'description', 'groupId', 'importance', 'estPomodoros', 'dueDate', 'completed', 'sortOrder', 'isWorkspace'];

async function algorithmSettingsFor(userId) {
  const user = await User.findById(userId).select('settings.weights settings.invertConfidence').lean();
  return {
    weights: user?.settings?.weights,
    invertConfidence: user?.settings?.invertConfidence,
  };
}

function applyScores(tasks, algoSettings) {
  const weights = algoSettings?.weights;
  const options = { invertConfidence: algoSettings?.invertConfidence };
  for (const task of tasks) {
    task.priorityScore = priorityScore(task, weights, options);
  }
}

function parseRangeBound(value, endOfDay) {
  if (typeof value !== 'string' || !value) return null;
  const date = endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T23:59:59.999Z`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

// Defined before /:id so "reorder" is not captured as a task id.
router.patch('/reorder', async (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Body must be an array of { id, sortOrder }' });
  }

  const ops = [];
  for (const item of req.body) {
    if (!item || item.id == null || typeof item.sortOrder !== 'number' || Number.isNaN(item.sortOrder)) {
      return res.status(400).json({ error: 'Each item needs an id and a numeric sortOrder' });
    }
    ops.push({
      updateOne: {
        filter: { _id: item.id, userId: req.user.id },
        update: { $set: { sortOrder: item.sortOrder } },
      },
    });
  }

  if (ops.length === 0) return res.json({ updated: 0 });
  const result = await Task.bulkWrite(ops);
  await scheduleTasksForUser(req.user.id);
  res.json({ updated: result.matchedCount });
});

router.get('/', async (req, res) => {
  const filter = { userId: req.user.id };

  if (req.query.completed !== undefined) {
    if (req.query.completed === 'true') filter.completed = true;
    else if (req.query.completed === 'false') filter.completed = false;
    else return res.status(400).json({ error: 'completed must be true or false' });
  }

  if (req.query.groupId) filter.groupId = req.query.groupId;

  if (req.query.parentTaskId === 'none') filter.parentTaskId = null;
  else if (req.query.parentTaskId) filter.parentTaskId = req.query.parentTaskId;

  if (req.query.from || req.query.to) {
    filter.dueDate = {};
    if (req.query.from) {
      const from = parseRangeBound(req.query.from, false);
      if (!from) return res.status(400).json({ error: 'Invalid from date' });
      filter.dueDate.$gte = from;
    }
    if (req.query.to) {
      const to = parseRangeBound(req.query.to, true);
      if (!to) return res.status(400).json({ error: 'Invalid to date' });
      filter.dueDate.$lte = to;
    }
  }

  // Recalculate schedule rolling window for active tasks so it is always current
  if (req.query.completed !== 'true') {
    await scheduleTasksForUser(req.user.id);
  }

  const tasks = await Task.find(filter).lean();

  if (req.query.completed === 'true') {
    tasks.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
  } else {
    // Sort primarily by scheduledDay ascending (Day 0 today, Day 1 tomorrow, ..., nulls deferred),
    // and secondarily by priorityScore descending.
    tasks.sort((a, b) => {
      const dayA = a.scheduledDay != null ? a.scheduledDay : 999;
      const dayB = b.scheduledDay != null ? b.scheduledDay : 999;
      if (dayA !== dayB) return dayA - dayB;
      return (b.priorityScore || 0) - (a.priorityScore || 0);
    });
  }

  res.json(tasks);
});

router.get('/:id', async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user.id }).lean();
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const [subtasks, algoSettings] = await Promise.all([
    Task.find({ parentTaskId: task._id, userId: req.user.id }).lean(),
    algorithmSettingsFor(req.user.id),
  ]);

  applyScores([task, ...subtasks], algoSettings);
  task.subtasks = subtasks;
  res.json(task);
});

router.post('/', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const { description, groupId, parentTaskId, importance, estPomodoros, dueDate, isWorkspace } = req.body;

  if (groupId) {
    const group = await Group.findOne({ _id: groupId, userId: req.user.id }).select('_id');
    if (!group) return res.status(400).json({ error: 'Group not found' });
  }

  if (parentTaskId) {
    const parent = await Task.findOne({ _id: parentTaskId, userId: req.user.id }).select('_id');
    if (!parent) return res.status(400).json({ error: 'Parent task not found' });
  }

  const draft = {
    userId: req.user.id,
    name,
    ...(description !== undefined ? { description } : {}),
    ...(groupId ? { groupId } : {}),
    ...(parentTaskId ? { parentTaskId } : {}),
    ...(isWorkspace !== undefined ? { isWorkspace } : {}),
    ...(importance !== undefined ? { importance } : {}),
    ...(estPomodoros !== undefined ? { estPomodoros } : {}),
    ...(dueDate !== undefined ? { dueDate } : {}),
  };

  const algoSettings = await algorithmSettingsFor(req.user.id);
  draft.priorityScore = priorityScore(draft, algoSettings.weights, { invertConfidence: algoSettings.invertConfidence });
  const task = await Task.create(draft);

  // Run the complete scheduling algorithm on task creation
  await scheduleTasksForUser(req.user.id);
  const scheduledTask = await Task.findById(task._id).lean();

  res.status(201).json(scheduledTask || task);
});

router.patch('/:id', async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const $set = {};
  for (const field of PATCH_FIELDS) {
    if (req.body[field] !== undefined) $set[field] = req.body[field];
  }

  if (Object.prototype.hasOwnProperty.call($set, 'completed') && typeof $set.completed !== 'boolean') {
    return res.status(400).json({ error: 'completed must be true or false' });
  }

  if ($set.groupId) {
    const group = await Group.findOne({ _id: $set.groupId, userId: req.user.id }).select('_id');
    if (!group) return res.status(400).json({ error: 'Group not found' });
  }

  const $unset = {};
  if ($set.completed === true && task.completed !== true) {
    $set.completedAt = new Date();
  } else if ($set.completed === false) {
    $unset.completedAt = 1;
  }

  const merged = task.toObject();
  Object.assign(merged, $set);
  if ($set.completed === false) delete merged.completedAt;

  const algoSettings = await algorithmSettingsFor(req.user.id);
  $set.priorityScore = priorityScore(merged, algoSettings.weights, { invertConfidence: algoSettings.invertConfidence });

  const update = { $set };
  if (Object.keys($unset).length) update.$unset = $unset;

  const updated = await Task.findOneAndUpdate(
    { _id: task._id, userId: req.user.id },
    update,
    { new: true, runValidators: true }
  );

  // If this task has a parentTaskId, sync parent workspace completion state
  const targetParentId = updated.parentTaskId || task.parentTaskId;
  if (targetParentId) {
    const siblings = await Task.find({ parentTaskId: targetParentId, userId: req.user.id });
    if (siblings.length > 0) {
      const allDone = siblings.every((s) => s.completed === true);
      await Task.updateOne(
        { _id: targetParentId, userId: req.user.id },
        allDone
          ? { $set: { completed: true, completedAt: new Date() } }
          : { $set: { completed: false }, $unset: { completedAt: 1 } }
      );
    }
  }

  // Run the complete scheduling algorithm on task edit / completion toggle
  await scheduleTasksForUser(req.user.id);
  const scheduledTask = await Task.findById(updated._id).lean();

  res.json(scheduledTask || updated);
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const targetParentId = task.parentTaskId;
  await Task.deleteOne({ _id: task._id, userId: req.user.id });
  await Task.deleteMany({ parentTaskId: task._id, userId: req.user.id });

  if (targetParentId) {
    const siblings = await Task.find({ parentTaskId: targetParentId, userId: req.user.id });
    if (siblings.length > 0) {
      const allDone = siblings.every((s) => s.completed === true);
      await Task.updateOne(
        { _id: targetParentId, userId: req.user.id },
        allDone
          ? { $set: { completed: true, completedAt: new Date() } }
          : { $set: { completed: false }, $unset: { completedAt: 1 } }
      );
    }
  }

  // Run the complete scheduling algorithm on task deletion
  await scheduleTasksForUser(req.user.id);

  res.status(204).end();
});

module.exports = router;
