import express from "express";
import {
  generateVideoScript,
  clearScriptHistory,
  renderVideoScriptPage,
} from "../controllers/videoScriptController.js";

import ensureAuthenticated from '../middlewares/auth.js';

const router = express.Router();

router.get("/", ensureAuthenticated, renderVideoScriptPage);
router.post("/ai/script-writer/generate", ensureAuthenticated, generateVideoScript);
router.delete("/ai/script-writer/clear", ensureAuthenticated, clearScriptHistory);

export default router;
