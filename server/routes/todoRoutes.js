import express from 'express';
import { getTodos, addTodo, deleteTodo, toggleTodo, editTodo } from '../controllers/todoController.js';
import ensureAuthenticated from '../middlewares/auth.js';

const router = express.Router();

router.get('/', ensureAuthenticated, getTodos);
router.post('/add', ensureAuthenticated, addTodo);
router.get('/delete/:id', ensureAuthenticated, deleteTodo);
router.get('/toggle/:id', ensureAuthenticated, toggleTodo);
router.put('/edit/:id', ensureAuthenticated, editTodo);

export default router;
