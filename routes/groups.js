const express = require('express');
const mongoose = require('mongoose');
const Group = require('../database/models/Groups');
const Task = require('../database/models/Tasks');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function duplicateName(err) {
  return err && err.code === 11000;
}

router.get('/', async (req, res) => {
  const groups = await Group.find({ userId: req.user.id }).sort({ sortOrder: 1, createdAt: 1 }).lean();
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const counts = await Task.aggregate([
    { $match: { userId } },
    { $group: { _id: '$groupId', count: { $sum: 1 } } },
  ]);
  const countByGroup = new Map(counts.map((row) => [String(row._id), row.count]));

  res.json(groups.map((group) => ({
    ...group,
    taskCount: countByGroup.get(String(group._id)) || 0,
  })));
});

router.post('/', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const group = await Group.create({
      userId: req.user.id,
      name,
      ...(req.body.color !== undefined ? { color: req.body.color } : {}),
    });
    res.status(201).json(group);
  } catch (err) {
    if (duplicateName(err)) return res.status(409).json({ error: 'Group name already exists' });
    throw err;
  }
});

router.patch('/:id', async (req, res) => {
  const group = await Group.findOne({ _id: req.params.id, userId: req.user.id });
  if (!group) return res.status(404).json({ error: 'Group not found' });

  if (req.body.name !== undefined) group.name = req.body.name;
  if (req.body.color !== undefined) group.color = req.body.color;
  if (req.body.sortOrder !== undefined) group.sortOrder = req.body.sortOrder;

  try {
    await group.save();
    res.json(group);
  } catch (err) {
    if (duplicateName(err)) return res.status(409).json({ error: 'Group name already exists' });
    throw err;
  }
});

router.delete('/:id', async (req, res) => {
  const group = await Group.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!group) return res.status(404).json({ error: 'Group not found' });

  await Task.updateMany(
    { groupId: group._id, userId: req.user.id },
    { $set: { groupId: null } }
  );

  res.status(204).end();
});

module.exports = router;
