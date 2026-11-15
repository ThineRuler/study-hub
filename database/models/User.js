//User table model//

// loading mongoose library
const mongoose = require('mongoose');

// defining the schema for the User model
const userSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  displayName:  { type: String, trim: true },
  isVerified:   { type: Boolean, default: false },   // must be true before login is allowed
  verifyToken:  String,
  verifyTokenExpires: Date,
  resetToken:   String,
  resetTokenExpires:  Date,
  resetTokenVerified: { type: Boolean, default: false },
  settings: {
    theme: { type: String, default: 'light' },
    dailyCap: { type: Number, default: 8, min: 1, max: 24 },
    taskCap: { type: Number, default: 4, min: 1, max: 12 },
    workDuration: { type: Number, default: 25, min: 1, max: 120 },
    breakDuration: { type: Number, default: 5, min: 1, max: 60 },
    chimeEnabled: { type: Boolean, default: true },
    invertConfidence: { type: Boolean, default: true },
    dailyDigestEnabled: { type: Boolean, default: true },
    emailDigestTime: { type: String, default: '08:00' },
    weights: {
      importance: { type: Number, default: 0.5 },
      dueDate:    { type: Number, default: 0.35 },
      time:       { type: Number, default: 0.15 },
    },
    accessibility: {
      highContrast: { type: Boolean, default: false },
      dyslexiaFont: { type: Boolean, default: false },
      boldText:     { type: Boolean, default: false },
      fontScale:    { type: Number, default: 100 },
      font:         { type: String, default: 'inter' },
    },
  },
}, { timestamps: true });   // adds createdAt / updatedAt

module.exports = mongoose.model('User', userSchema);