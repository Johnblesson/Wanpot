// routes/meetingRoutes.js
import express from "express";
import { renderMeetingPage, generateSummary } from "../controllers/meetingSummarizer.js";
import ensureAuthenticated from "../middlewares/auth.js";

const router = express.Router();

router.get("/", ensureAuthenticated, renderMeetingPage);
router.post("/", ensureAuthenticated, generateSummary);

export default router;
