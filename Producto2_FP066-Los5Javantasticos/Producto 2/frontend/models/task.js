const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  yearweek: String,
  dayofweek: String,
  name: String,
  description: String,
  color: String,
  time_start: String,
  time_end: String,
  finished: Number,
  priority: Number
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
