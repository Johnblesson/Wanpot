import express from 'express';
import { renderAIPage, generateAIResponse, deleteChatMessage, clearAllChat, getJournal, postJournal } from '../controllers/aiController.js';
import { getCodeExplainerPage, runCodeExplainer } from '../controllers/codeExplainerController.js'
import { renderResumeBuilder, enhanceResume } from '../controllers/resumeBuilderController.js'
import { getGrammarPage, runGrammarAI } from "../controllers/grammarController.js";
import ensureAuthenticated from '../middlewares/auth.js';

const router = express.Router();

router.get('/', ensureAuthenticated, renderAIPage);
router.post('/', ensureAuthenticated, generateAIResponse);
router.post('/delete', ensureAuthenticated, deleteChatMessage);
router.post('/clear', ensureAuthenticated, clearAllChat);

router.get("/resume", ensureAuthenticated, renderResumeBuilder);
router.post("/api/enhance-resume", ensureAuthenticated, enhanceResume);


// Render page
router.get("/code-explainer", ensureAuthenticated, getCodeExplainerPage);

// Run code explainer
router.post("/code-explainer/run", ensureAuthenticated, runCodeExplainer);

router.get("/grammar", ensureAuthenticated, getGrammarPage);
router.post("/grammar/run", ensureAuthenticated, runGrammarAI);

router.get("/personal-journal", ensureAuthenticated, getJournal);
router.post("/personal-journal/analyze", ensureAuthenticated, postJournal);

export default router;
