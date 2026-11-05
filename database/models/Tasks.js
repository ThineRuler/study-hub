// tasks table model

// loading mongoose library
const mongoose = require('mongoose');

// defining the schema for the tasks model
const taskSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId:          {type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  parentTaskId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  name:             { type: String, required: true, trim: true },
  description:      { type: String, trim: true },
  importance:       { type: Number, default: 0.5, min: 0, max: 1},
  estPomodoros:     { type: Number, default: 1, min: 1, validate: Number.isInteger}, 
  dueDate:          { type: Date },
  priorityScore:    { type: Number, default: 0 },   
  sortOrder:        { type: Number, default: 0 },   
  completed:        { type: Boolean, default: false },
  completedAt:      { type: Date },
}, { timestamps: true });

taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ parentTaskId: 1 });

module.exports = mongoose.model('Task', taskSchema);
