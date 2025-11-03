import { Router } from "express";
const router = Router();

// Define your routes here
router.get("/", (req, res) => {
  res.render("index");
});

router.get("/calculator", (req, res) => {
  res.render("calculator");
});

router.get("/stopwatch", (req, res) => {
    res.render("stopwatch");
});

// quiz route
router.get("/quiz", (req, res) => {
    res.render("quiz");
})

// typing-game route
router.get("/typing-game", (req, res) => {
    res.render("typing-game");
});

// password-generator route
router.get("/password-generator", (req, res) => {
    res.render("password-generator");
});

// Qrcode generator route
router.get("/qrcode-generator", (req, res) => {
    res.render("qr-code");
}); 

// Note keepeer route
router.get("/note-keeper", (req, res) => {
    res.render("note-keeper");
});

// Gpa Calculator route
router.get("/gpa-calculator", (req, res) => {
    res.render("gpa-calculator");
});

// Export the router
export default router;
