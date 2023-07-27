const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

// Define the Notification schema
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
  },
  notificationText: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Define the Task schema
const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  deadline: {
    type: String,
    required: true,
  },
  assignedMembers: {
    type: String,
    required: true,
  },
  notes: String,
  completed: {
    type: Boolean,
    default: false,
  },
});

// Define the File schema
const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  filepath: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  upload_date: {
    type: Date,
    default: Date.now,
  },
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Create the Notification model
const Notification = mongoose.model('Notification', notificationSchema);

// Create the Task model
const Task = mongoose.model('Task', taskSchema);

// Create the File model
const File = mongoose.model('File', fileSchema);

module.exports = { User, Notification, Task, File };
