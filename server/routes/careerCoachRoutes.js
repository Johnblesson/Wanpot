// routes/careerCoachRoutes.js
import express from "express";
import {
  renderCareerCoach,
  careerCoachPrompt,
  clearCareerCoachHistory
} from "../controllers/careerCoachController.js";

const router = express.Router();

import ensureAuthenticated from "../middlewares/auth.js";

router.get("/", ensureAuthenticated, renderCareerCoach);
router.post("/prompt", ensureAuthenticated, careerCoachPrompt);
router.post("/clear", ensureAuthenticated, clearCareerCoachHistory);

export default router;
