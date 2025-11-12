import express from 'express';
import { renderAIPage, generateAIResponse } from '../controllers/aiController.js';

const router = express.Router();

router.get('/', renderAIPage);
router.post('/', generateAIResponse);

export default router;
