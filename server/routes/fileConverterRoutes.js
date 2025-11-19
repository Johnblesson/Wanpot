import express from 'express';
import multer from 'multer';
import path from 'path';
import { renderFileConverter, convertFile } from '../controllers/fileConverterController.js';
import ensureAuthenticated from '../middlewares/auth.js'; 

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get('/file-converter', ensureAuthenticated, renderFileConverter);
router.post('/file-converter/convert', upload.single('file'), ensureAuthenticated, convertFile);

export default router;
