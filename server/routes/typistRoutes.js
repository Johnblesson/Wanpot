// routes/typistRoutes.js
import express from "express";
import { getLeaderboard, addTypist, getTypingGame } from "../controllers/typistController.js";
import ensureAuthenticated from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getLeaderboard); // GET /api/typists
router.post("/", addTypist);     // POST /api/typists
router.get("/game", ensureAuthenticated, getTypingGame); // GET /api/typists/game

export default router;
