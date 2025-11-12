import express from 'express';
import { renderAIPage, generateAIResponse, deleteChatMessage, clearAllChat } from '../controllers/aiController.js';
import ensureAuthenticated from '../middlewares/auth.js';

const router = express.Router();

router.get('/', ensureAuthenticated, renderAIPage);
router.post('/', ensureAuthenticated, generateAIResponse);
router.post('/delete', ensureAuthenticated, deleteChatMessage);
router.post('/clear', ensureAuthenticated, clearAllChat);

export default router;
