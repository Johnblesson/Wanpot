import express from 'express';
import { getExpenseTracker, addExpense, deleteExpense } from '../controllers/expenseController.js';
import ensureAuthenticated from '../middlewares/auth.js'; 

const router = express.Router();

// Render Expense Tracker
router.get('/', ensureAuthenticated, getExpenseTracker);

// Add new expense
router.post('/add', ensureAuthenticated, addExpense);

// Delete expense
router.get('/delete/:id', ensureAuthenticated, deleteExpense);

export default router;
