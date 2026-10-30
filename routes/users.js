const express = require('express');
const User = require('../database/models/User');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const SECRET_FIELDS = '-passwordHash -verifyToken -resetToken -verifyTokenExpires -resetTokenExpires';
const WEIGHT_KEYS = ['importance', 'dueDate', 'time'];

router.get('/me', async (req, res) => {
  const user = await User.findById(req.user.id).select(SECRET_FIELDS);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.patch('/me', async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (req.body.displayName !== undefined) {
    if (typeof req.body.displayName !== 'string') {
      return res.status(400).json({ error: 'displayName must be a string' });
    }
    user.displayName = req.body.displayName;
  }

  if (req.body.settings !== undefined) {
    const settings = req.body.settings;
    if (settings === null || typeof settings !== 'object' || Array.isArray(settings)) {
      return res.status(400).json({ error: 'settings must be an object' });
    }

    if (settings.theme !== undefined) {
      if (typeof settings.theme !== 'string') {
        return res.status(400).json({ error: 'theme must be a string' });
      }
      user.set('settings.theme', settings.theme);
    }

    if (settings.weights !== undefined) {
      const weights = settings.weights;
      if (weights === null || typeof weights !== 'object' || Array.isArray(weights)) {
        return res.status(400).json({ error: 'weights must be an object' });
      }

      const nextWeights = {};
      for (const key of WEIGHT_KEYS) {
        if (weights[key] === undefined) continue;
        const value = weights[key];
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
          return res.status(400).json({ error: `Weight ${key} must be between 0 and 1` });
        }
        nextWeights[key] = value;
      }
      for (const [key, value] of Object.entries(nextWeights)) {
        user.set(`settings.weights.${key}`, value);
      }
    }
  }

  await user.save();
  const safe = await User.findById(user._id).select(SECRET_FIELDS);
  res.json(safe);
});

module.exports = router;
