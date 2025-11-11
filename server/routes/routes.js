import { Router } from "express";
const router = Router();
import multer from "multer"; 
import { 
        getSolverPage,
        solveEquation, 
        scanEquation,
        getTranslatorPage, 
        translateText,
        renderPDFTools, processPDF,
        renderVoiceRecorder
    } from "../controllers/controllers.js"

    import ensureAuthenticated from "../middlewares/auth.js";

const upload = multer({ dest: "uploads/" });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const uploadPDF = multer({ storage });

// // login
// router.get('/login', (req, res) => {
//     res.render('login');
// });

// // Signup
// router.get('/signup', (req, res) => {
//     res.render('signup');
// });

router.get('/pdf-tools', renderPDFTools);
router.post('/pdf-tools/process', uploadPDF.array('pdfs'), processPDF);

// Define your routes here
router.get("/", (req, res) => {
  res.render("guest-page");
});

// dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
     const user = req.isAuthenticated() ? req.user : null;
  res.render("index", { user });
});

router.get("/calculator", ensureAuthenticated, (req, res) => {
  res.render("calculator");
});

router.get("/stopwatch", ensureAuthenticated, (req, res) => {
    res.render("stopwatch");
});

// quiz route
router.get("/quiz", ensureAuthenticated, (req, res) => {
    res.render("quiz");
})

// typing-game route
router.get("/typing-game", ensureAuthenticated, (req, res) => {
    res.render("typing-game");
});

// password-generator route
router.get("/password-generator", ensureAuthenticated, (req, res) => {
    res.render("password-generator");
});

// Qrcode generator route
router.get("/qrcode-generator", ensureAuthenticated, (req, res) => {
    res.render("qr-code");
}); 


// Gpa Calculator route
router.get("/gpa-calculator", ensureAuthenticated, (req, res) => {
    res.render("gpa-calculator");
});

// Dictionary route
router.get("/dictionary", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("dictionary", { user });
});

// Unit Converter route
router.get("/unit-converter", ensureAuthenticated, (req, res) => {
    res.render("unit-converter");
});

// flashcards route
router.get("/flashcards", ensureAuthenticated, (req, res) => {
    res.render("flashcards");
});

// equation-solver route
router.post("/equation", ensureAuthenticated, solveEquation)
router.get("/equation-solver", ensureAuthenticated, getSolverPage);
router.post("/scan", ensureAuthenticated, upload.single("equationImage"), scanEquation);

// Translation
router.get("/translator", ensureAuthenticated, getTranslatorPage);
router.post("/translate", ensureAuthenticated, translateText);
 router.get("/voice-recorder", ensureAuthenticated, renderVoiceRecorder);
// Pomodoro Timer
router.get("/pomodoro", ensureAuthenticated, (req, res) => {
    res.render("pomodoro");
});

// Email Signature Generator
router.get("/signature-generator", ensureAuthenticated, (req, res) => {
    res.render("signature-generator");
});

// Export the router
export default router;
