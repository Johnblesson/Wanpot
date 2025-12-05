import express from "express";
import multer from "multer";
import ensureAuthenticated from "../middlewares/auth.js";
import { generateQrCode, scanQrCode, viewGenerator } from "../controllers/qrController.js";

const router = express.Router();

// Multer Upload Setup
const upload = multer({
  dest: "uploads/"
});

// View Generator Page
router.get("/qrcode-generator", ensureAuthenticated, viewGenerator);

// Generate QR (with optional image)
router.post("/qrcode-generator", ensureAuthenticated, upload.single("qrImage"), generateQrCode);

// Scan Page
router.get("/qrcode-scan", ensureAuthenticated, scanQrCode);

export default router;
