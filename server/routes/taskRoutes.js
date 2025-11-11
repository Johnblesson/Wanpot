import express from 'express';
import { getTaskPlanner, addTask, deleteTask, editTask, reorderTasks } from '../controllers/taskController.js';
import ensureAuthenticated from '../middlewares/auth.js';

const router = express.Router();

router.get('/', ensureAuthenticated, getTaskPlanner);
router.post('/add', ensureAuthenticated, addTask);
router.get('/delete/:id', ensureAuthenticated, deleteTask);
router.put('/edit/:id', ensureAuthenticated, editTask);
router.post('/reorder', ensureAuthenticated, reorderTasks);

export default router;
