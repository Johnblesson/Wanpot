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

// admin dashboard
router.get("/admin-dashboard", ensureAuthenticated, (req, res) => {
     const user = req.isAuthenticated() ? req.user : null;
  res.render("index", { user });
});

router.get("/calculator", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
  res.render("features/calculator", { user });
});

router.get("/stopwatch", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/stopwatch", { user });
});

// quiz route
router.get("/quiz", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/quiz", { user });
})

// typing-game route
// router.get("/typing-game", ensureAuthenticated, (req, res) => {
//     const user = req.isAuthenticated() ? req.user : null;
//     res.render("features/typing-game", { user });
// });

// password-generator route
router.get("/password-generator", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/password-generator", { user });
});

// Qrcode generator route
router.get("/qrcode-generator", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/qr-code", { user });
}); 


// Gpa Calculator route
router.get("/gpa-calculator", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/gpa-calculator", { user });
});

// Dictionary route
router.get("/dictionary", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/dictionary", { user });
});

// Unit Converter route
router.get("/unit-converter", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/unit-converter", { user });
});

// flashcards route
router.get("/flashcards", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/flashcards", { user });
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
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/pomodoro", { user });
});

// Email Signature Generator
router.get("/signature-generator", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("features/signature-generator", { user });
});

// Export the router
export default router;
