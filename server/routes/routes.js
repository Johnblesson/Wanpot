import { Router } from "express";
const router = Router();
import multer from "multer"; 
import path from "path";
import { 
        getSolverPage,
        solveEquation, 
        scanEquation,
        getTranslatorPage, 
        translateText,
        renderVoiceRecorder,
    } from "../controllers/controllers.js"
    import { redirectIfLoggedIn } from '../middlewares/redirectIfLoggedIn.js';
    
    import ensureAuthenticated from "../middlewares/auth.js";

const upload = multer({ dest: "uploads/" });

// Define your routes here
router.get("/", redirectIfLoggedIn, (req, res) => {
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

router.get("/subscription-plan", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("subscribe", { user });
});

router.get("/billing", ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render("billing", { user });
});


// Export the router
export default router;
