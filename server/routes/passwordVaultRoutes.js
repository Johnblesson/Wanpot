// routes/passwordVaultRoutes.js
import express from "express";
import { savePassword, getUserPasswords, deletePassword, renderPasswordGeneratorPage } from "../controllers/passwordVaultController.js";
import ensureAuthenticated from "../middlewares/auth.js";

const router = express.Router();

// password-generator route
router.get("/password-generator", ensureAuthenticated, renderPasswordGeneratorPage);

// Store generated password
router.post("/save-password", ensureAuthenticated, savePassword);

// Fetch all saved passwords for logged-in user
router.get("/my-passwords", ensureAuthenticated, getUserPasswords);

// Delete a saved password
router.delete("/delete/:id", ensureAuthenticated, deletePassword);

export default router;
