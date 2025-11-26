import { Router } from "express";
const router = Router();
import multer from "multer"; 
import path from "path";

import { renderPDFTools, processPDF } from "../controllers/pdf-tools-controller.js"

import ensureAuthenticated from "../middlewares/auth.js";

// const upload = multer({ dest: "uploads/" });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const uploadPDF = multer({ storage });

router.get('/pdf-tools', ensureAuthenticated, renderPDFTools);
router.post('/pdf-tools/process', ensureAuthenticated, uploadPDF.array('pdfs'), processPDF);

// Export the router
export default router;
