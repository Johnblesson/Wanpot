import Expense from '../models/expense.js';
import User from '../models/auth.js';

// controllers/expenseController.js

// Render the expense tracker page for a logged-in user with totals
export const getExpenseTracker = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all expenses
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

    const now = new Date();

    // Helper function to calculate total
    const calcTotal = (startDate) =>
      expenses
        .filter(exp => exp.date >= startDate)
        .reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate date ranges
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday start
    weekStart.setHours(0,0,0,0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Totals
    const dailyTotal = calcTotal(todayStart);
    const weeklyTotal = calcTotal(weekStart);
    const monthlyTotal = calcTotal(monthStart);
    const yearlyTotal = calcTotal(yearStart);

    res.render('features/expenseTracker', {
      title: 'Expense Tracker',
      user: req.user,
      expenses,
      totals: { dailyTotal, weeklyTotal, monthlyTotal, yearlyTotal }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


// Add a new expense
export const addExpense = async (req, res) => {
  try {
    const { title, amount, category, notes } = req.body;
    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      notes,
    });
    res.redirect('/expense-tracker');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Delete an expense
export const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.redirect('/expense-tracker');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
