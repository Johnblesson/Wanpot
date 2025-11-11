import express from "express";
import { renderNotesPage, createNote, updateNote, deleteNote, viewNote, renderEditNotePage } from "../controllers/noteController.js";
import ensureAuthenticated from "../middlewares/auth.js"; // optional if using auth middleware

const router = express.Router();

// 📄 Display all notes for logged-in user
router.get("/", ensureAuthenticated, renderNotesPage);

// ➕ Create new note
router.post("/add", ensureAuthenticated, createNote);

// ❌ Delete a note
router.get("/delete/:id", ensureAuthenticated, deleteNote);

// Update note (PUT)
router.post('/edit/:id', ensureAuthenticated, updateNote);

// View single note
router.get("/view/:id", ensureAuthenticated, viewNote);

// Render edit note page
router.get("/edit/:id", ensureAuthenticated, renderEditNotePage);

export default router;
