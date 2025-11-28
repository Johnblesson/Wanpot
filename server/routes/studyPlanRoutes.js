import express from "express";
import { generateStudyPlan, clearStudyHistory, renderStudyPlanner } from "../controllers/studyPlannerController.js";
import ensureAuthenticated from "../middlewares/auth.js";

const router = express.Router();

router.get("/", ensureAuthenticated, renderStudyPlanner)
router.post("/generate", ensureAuthenticated, generateStudyPlan);
router.post("/clear", ensureAuthenticated, clearStudyHistory);

export default router;
