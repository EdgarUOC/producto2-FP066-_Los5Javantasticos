const Task = require('../models/task');

const taskController = {};

taskController.getTasks = async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
};

taskController.createTask = async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.status(201).json(newTask);
};

taskController.updateTask = async (req, res) => {
  const taskId = req.params.id;
  const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, { new: true });
  res.json(updatedTask);
};

taskController.updateTasks = async (req, res) => {
  const updatedTasks = await Task.updateMany({}, req.body);
  res.json(updatedTasks);
};

taskController.deleteTask = async (req, res) => {
  const taskId = req.params.id;
  await Task.findByIdAndDelete(taskId);
  res.status(204).json({ message: 'Task deleted' });
};

module.exports = taskController;
