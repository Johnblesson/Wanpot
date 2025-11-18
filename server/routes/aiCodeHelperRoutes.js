import express from "express";
import { renderCodeHelper, runCodeAssistant } from "../controllers/aiCodeHelperController.js";
import ensureAuthenticated from '../middlewares/auth.js';

const router = express.Router();

router.get("/dev/ai-code-helper", ensureAuthenticated, renderCodeHelper);
router.post("/dev/ai-code-helper/run", ensureAuthenticated, runCodeAssistant);

export default router;
