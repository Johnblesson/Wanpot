import Task from '../models/task.js';

// Render Task Planner page
export const getTaskPlanner = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ dueDate: 1 });
    
    const totals = {
      pending: tasks.filter(t => t.status === 'Pending').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
    };

    res.render('taskPlanner', { user: req.user, tasks, totals });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

export const reorderTasks = async (req, res) => {
  try {
    const { order } = req.body; // array of task IDs in new order
    // Optionally, you can store an 'order' field in Task model for persistent ordering
    for (let i = 0; i < order.length; i++) {
      await Task.findByIdAndUpdate(order[i], { order: i });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};


// Add a new task
export const addTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    await Task.create({ user: req.user._id, title, description, dueDate });
    res.redirect('/task-planner');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.redirect('/task-planner');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Edit a task (PUT)
export const editTask = async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;
    await Task.findByIdAndUpdate(req.params.id, { title, description, dueDate, status });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
