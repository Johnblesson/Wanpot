import express from 'express';
import { renderAIPage, generateAIResponse } from '../controllers/aiController.js';
import ensureAuthenticated from '../middlewares/auth.js';

const router = express.Router();

router.get('/', ensureAuthenticated, renderAIPage);
router.post('/', ensureAuthenticated, generateAIResponse);

export default router;
