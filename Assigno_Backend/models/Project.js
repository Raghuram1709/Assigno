const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  progress: { type: Number, default: 0 },
  deadline: { type: String },
  proof: { type: String },
  status: { type: String, enum: ['unsubmitted', 'submitted', 'approved', 'rejected'], default: 'unsubmitted' },
});

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  // UPDATED: Removed 'user', added 'tester', 'analyst', 'architect'; default to 'developer'
  role: { type: String, enum: ['admin', 'lead', 'designer', 'developer', 'tester', 'analyst', 'architect'], default: 'developer' },
  progress: { type: Number, default: 0 },
  tasks: [taskSchema],
});

const requestSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  taskId: { type: String, required: true },
  taskTitle: { type: String, required: true },
  proof: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  role: String
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  deadline: { type: String, required: true },
  status: { type: String, enum: ['planning', 'in-progress', 'submitted', 'completed'], default: 'planning' },
  progress: { type: Number, default: 0 },
  members: [memberSchema],
  requests: [requestSchema],
  reportLink: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);

