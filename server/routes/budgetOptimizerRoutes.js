import express from "express";
import {
  renderBudgetOptimizer,
  analyzeBudget,
  clearBudgetHistory
} from "../controllers/budgetOptimizerController.js";

import ensureAuthenticated from "../middlewares/auth.js";

const router = express.Router();

router.get("/", ensureAuthenticated, renderBudgetOptimizer);
router.post("/analyze", ensureAuthenticated, analyzeBudget);
router.post("/clear", ensureAuthenticated, clearBudgetHistory);

export default router;
