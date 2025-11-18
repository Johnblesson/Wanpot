// routes/brainstormRoutes.js
import express from 'express';
import { getBrainstormPage, runBrainstorm } from '../controllers/brainstormController.js';
import ensureAuthenticated from '../middlewares/auth.js'; // optional, if login required

const router = express.Router();

router.get('/', ensureAuthenticated, getBrainstormPage);
router.post('/run', ensureAuthenticated, runBrainstorm);

export default router;
