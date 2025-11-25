import express from "express";
import { getSermonBuilderPage, generateSermon } from "../controllers/sermonController.js";
import ensureAuthenticated from "../middlewares/auth.js";

const router = express.Router();

router.get("/ai/sermon-builder", ensureAuthenticated, getSermonBuilderPage);
router.post("/ai/sermon-builder/run", ensureAuthenticated, generateSermon);

export default router;
