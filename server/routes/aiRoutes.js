import express from 'express';
import { renderAIPage, generateAIResponse, deleteChatMessage, clearAllChat, renderResumeBuilder, enhanceResume } from '../controllers/aiController.js';
import { getCodeExplainerPage, runCodeExplainer } from '../controllers/codeExplainerController.js'
import ensureAuthenticated from '../middlewares/auth.js';

const router = express.Router();

router.get('/', ensureAuthenticated, renderAIPage);
router.post('/', ensureAuthenticated, generateAIResponse);
router.post('/delete', ensureAuthenticated, deleteChatMessage);
router.post('/clear', ensureAuthenticated, clearAllChat);

router.get("/resume", renderResumeBuilder);
router.post("/api/enhance-resume", enhanceResume);


// Render page
router.get("/code-explainer", ensureAuthenticated, getCodeExplainerPage);

// Run code explainer
router.post("/code-explainer/run", ensureAuthenticated, runCodeExplainer);

export default router;
