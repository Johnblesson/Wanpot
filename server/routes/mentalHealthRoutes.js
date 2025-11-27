import express from "express";
import { renderMentalHealthBuddy, handleMentalHealthPrompt } from "../controllers/mentalHealthController.js";

const router = express.Router();

import ensureAuthenticated from "../middlewares/auth.js";

router.get("/", ensureAuthenticated, renderMentalHealthBuddy);
router.post("/prompt", ensureAuthenticated, handleMentalHealthPrompt);

export default router;
