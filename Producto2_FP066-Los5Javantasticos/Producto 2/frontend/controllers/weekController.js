const Week = require('../models/week');

const weekController = {};

weekController.getWeeks = async (req, res) => {
  const weeks = await Week.find();
  res.json(weeks);
};

weekController.createWeek = async (req, res) => {
  const newWeek = new Week(req.body);
  await newWeek.save();
  res.status(201).json(newWeek);
};

weekController.updateWeek = async (req, res) => {
  const weekId = req.params.id;
  const updateWeek = await Week.findByIdAndUpdate(weekId, req.body, { new: true });
  res.json(updateWeek);
};

weekController.deleteWeek = async (req, res) => {
  const weekId = req.params.id;
  await Week.findByIdAndDelete(weekId);
  res.status(204).json({ message: 'Week deleted' });
};

module.exports = weekController;
