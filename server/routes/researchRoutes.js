import express from "express";
import { renderResearchPage, generateSummary } from "../controllers/researchController.js";
const router = express.Router();
import ensureAuthenticated from "../middlewares/auth.js";
// GET: Render Research Assistant page
router.get("/", ensureAuthenticated, renderResearchPage);

// POST: Generate research summary
router.post("/run", ensureAuthenticated, generateSummary);

export default router;
