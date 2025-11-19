import express from 'express';
import { renderAIPage, generateAIResponse, deleteChatMessage, clearAllChat, renderResumeBuilder, enhanceResume } from '../controllers/aiController.js';
import { getCodeExplainerPage, runCodeExplainer } from '../controllers/codeExplainerController.js'
import { generateCoverLetter, renderCoverLetter } from "../controllers/coverLetterController.js";
import { getGrammarPage, generateGrammar } from "../controllers/grammarController.js";
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

router.post("/cover-letter/run", ensureAuthenticated, generateCoverLetter);

router.get("/cover-letter-generator", ensureAuthenticated, renderCoverLetter)

// GET page
router.get("/grammar", ensureAuthenticated, getGrammarPage);

// POST grammar check
router.post("/grammar/run", ensureAuthenticated, generateGrammar);

export default router;
