import express from "express";
import { renderStoryPage, generateStory } from "../controllers/storyController.js";
import ensureAuthenticated from "../middlewares/auth.js";

const router = express.Router();

// Render story page
router.get("/", ensureAuthenticated, renderStoryPage);

// Generate story
router.post("/run", ensureAuthenticated, generateStory);

export default router;
