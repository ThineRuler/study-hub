const express = require('express');
const Task = require('../database/models/Tasks');
const Group = require('../database/models/Groups');
const auth = require('../middleware/verify');

const router = express.Router();
router.use(auth);

const MAX_QUERY_LENGTH = 100;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const TYPES = ['all', 'tasks', 'groups'];

// Escape regex special characters so user input is matched literally.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/search?q=calc&type=all&completed=false&limit=20
// Case-insensitive partial match on task name/description and group name,
// limited to the signed-in user's own data.
router.get('/', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!q) return res.status(400).json({ error: 'q is required' });
  if (q.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: `q must be at most ${MAX_QUERY_LENGTH} characters` });
  }

  const type = req.query.type === undefined ? 'all' : req.query.type;
  if (!TYPES.includes(type)) {
    return res.status(400).json({ error: 'type must be all, tasks or groups' });
  }

  let limit = DEFAULT_LIMIT;
  if (req.query.limit !== undefined) {
    limit = Number(req.query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      return res.status(400).json({ error: `limit must be an integer from 1 to ${MAX_LIMIT}` });
    }
  }

  const pattern = { $regex: escapeRegex(q), $options: 'i' };
  const userId = req.user.id;

  const taskFilter = {
    userId,
    $or: [{ name: pattern }, { description: pattern }],
  };
  if (req.query.completed !== undefined) {
    if (req.query.completed === 'true') taskFilter.completed = true;
    else if (req.query.completed === 'false') taskFilter.completed = false;
    else return res.status(400).json({ error: 'completed must be true or false' });
  }

  const [tasks, groups] = await Promise.all([
    type === 'groups'
      ? []
      : Task.find(taskFilter)
        .select('name description groupId parentTaskId dueDate completed priorityScore')
        .sort({ completed: 1, priorityScore: -1, updatedAt: -1 })
        .limit(limit)
        .lean(),
    type === 'tasks'
      ? []
      : Group.find({ userId, name: pattern })
        .select('name color sortOrder')
        .sort({ sortOrder: 1, name: 1 })
        .limit(limit)
        .lean(),
  ]);

  res.json({ query: q, tasks, groups });
});

module.exports = router;
