const express = require('express');
const User = require('../database/models/User');
const auth = require('../middleware/verify');
const { scheduleTasksForUser } = require('../utils/scheduler');

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

    if (settings.dailyCap !== undefined) {
      const val = Number(settings.dailyCap);
      if (!Number.isFinite(val) || val < 1 || val > 24) {
        return res.status(400).json({ error: 'dailyCap must be a number between 1 and 24' });
      }
      user.set('settings.dailyCap', Math.round(val));
    }

    if (settings.taskCap !== undefined) {
      const val = Number(settings.taskCap);
      if (!Number.isFinite(val) || val < 1 || val > 12) {
        return res.status(400).json({ error: 'taskCap must be a number between 1 and 12' });
      }
      user.set('settings.taskCap', Math.round(val));
    }

    if (settings.workDuration !== undefined) {
      const val = Number(settings.workDuration);
      if (!Number.isFinite(val) || val < 1 || val > 120) {
        return res.status(400).json({ error: 'workDuration must be a number between 1 and 120' });
      }
      user.set('settings.workDuration', Math.round(val));
    }

    if (settings.breakDuration !== undefined) {
      const val = Number(settings.breakDuration);
      if (!Number.isFinite(val) || val < 1 || val > 60) {
        return res.status(400).json({ error: 'breakDuration must be a number between 1 and 60' });
      }
      user.set('settings.breakDuration', Math.round(val));
    }

    if (settings.chimeEnabled !== undefined) {
      user.set('settings.chimeEnabled', Boolean(settings.chimeEnabled));
    }

    if (settings.invertConfidence !== undefined) {
      user.set('settings.invertConfidence', Boolean(settings.invertConfidence));
    }

    if (settings.dailyDigestEnabled !== undefined) {
      user.set('settings.dailyDigestEnabled', Boolean(settings.dailyDigestEnabled));
    }

    if (settings.emailDigestTime !== undefined) {
      if (typeof settings.emailDigestTime === 'string') {
        user.set('settings.emailDigestTime', settings.emailDigestTime);
      }
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

    if (settings.accessibility !== undefined) {
      const a = settings.accessibility;
      if (a && typeof a === 'object' && !Array.isArray(a)) {
        if (a.highContrast !== undefined) user.set('settings.accessibility.highContrast', Boolean(a.highContrast));
        if (a.dyslexiaFont !== undefined) user.set('settings.accessibility.dyslexiaFont', Boolean(a.dyslexiaFont));
        if (a.boldText !== undefined) user.set('settings.accessibility.boldText', Boolean(a.boldText));
        if (typeof a.fontScale === 'number' && Number.isFinite(a.fontScale)) {
          user.set('settings.accessibility.fontScale', Math.round(a.fontScale));
        }
        if (typeof a.font === 'string') user.set('settings.accessibility.font', a.font);
      }
    }
  }

  await user.save();
  await scheduleTasksForUser(user._id);
  const safe = await User.findById(user._id).select(SECRET_FIELDS);
  res.json(safe);
});

module.exports = router;
