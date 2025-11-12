import Todo from '../models/todo.js';

// Render Todo page
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
    const totals = {
      completed: todos.filter(t => t.completed).length,
      pending: todos.filter(t => !t.completed).length
    };
    res.render('features/todo', { user: req.user, todos, totals });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Add Todo
export const addTodo = async (req, res) => {
  try {
    const { title } = req.body;
    await Todo.create({ user: req.user._id, title });
    res.redirect('/todo');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Delete Todo
export const deleteTodo = async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.redirect('/todo');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Toggle Todo completed
export const toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    todo.completed = !todo.completed;
    await todo.save();
    res.redirect('/todo');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Edit Todo (via fetch API)
export const editTodo = async (req, res) => {
  try {
    const { title } = req.body;
    await Todo.findByIdAndUpdate(req.params.id, { title });
    res.status(200).json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update' });
  }
};
