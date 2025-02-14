import express from 'express';
import { body } from 'express-validator';
import Task from '../models/Task.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateTask = [
  body('title').trim().notEmpty(),
  body('dueDate').isISO8601(),
  body('priority').isIn(['Critical', 'Urgent', 'Important', 'Someday']),
  body('status').isIn(['Not Started', 'In Progress', 'Completed']),
  body('category').isIn(["Today's Tasks", 'Upcoming Week', 'Monthly Goals', 'Yearly Goals'])
];

// Get all tasks
router.get('/', auth, async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Create task
router.post('/', auth, validateTask, async (req, res, next) => {
  try {
    const task = new Task({
      ...req.body,
      user: req.userId
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// Update task
router.put('/:id', auth, validateTask, async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Delete task
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;