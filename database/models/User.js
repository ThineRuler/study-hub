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
  settings: {
    theme: { type: String, default: 'light' },
    weights: {
      importance: { type: Number, default: 0.5 },
      dueDate:    { type: Number, default: 0.35 },
      time:       { type: Number, default: 0.15 },
    },
  },
}, { timestamps: true });   // adds createdAt / updatedAt

module.exports = mongoose.model('User', userSchema);