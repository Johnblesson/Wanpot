// routes/searchRoutes.js
import express from 'express';
import { addSearch, getSearchHistory, clearSearchHistory } from '../controllers/searchController.js';
import ensureAuthenticated from '../middlewares/auth.js';

const router = express.Router();

router.post('/add', ensureAuthenticated, addSearch);
router.get('/history', ensureAuthenticated, getSearchHistory);
router.delete('/clear', ensureAuthenticated, clearSearchHistory);

export default router;
