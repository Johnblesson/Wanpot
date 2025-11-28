// routes/resumeAnalyzerRoutes.js
import express from "express";
import multer from "multer";
import {
  renderResumeAnalyzer,
  analyzeResume,
  clearResumeHistory
} from "../controllers/ resumeAnalyzerController.js";

import ensureAuthenticated from "../middlewares/auth.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", ensureAuthenticated, renderResumeAnalyzer);

router.post("/analyze", upload.single("resumeFile"), ensureAuthenticated, analyzeResume);

router.post("/clear", ensureAuthenticated, clearResumeHistory);

export default router;
