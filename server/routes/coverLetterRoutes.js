import express from "express";
import { renderCoverLetterPage, generateCoverLetter } from "../controllers/coverLetterController.js";
import ensureAuthenticated from '../middlewares/auth.js';

const router = express.Router();

router.get("/", ensureAuthenticated, renderCoverLetterPage);
router.post("/run", ensureAuthenticated, generateCoverLetter);

export default router;
