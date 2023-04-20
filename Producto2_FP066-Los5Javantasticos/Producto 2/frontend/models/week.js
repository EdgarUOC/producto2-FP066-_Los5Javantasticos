const mongoose = require('mongoose');

const weekSchema = new mongoose.Schema({
  year: Number,
  numweek: Number,
  color: String,
  description: String,
  priority: Number,
  link: String
});

const Week = mongoose.model('Week', weekSchema);

module.exports = Week;
