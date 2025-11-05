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

// Dictionary route
router.get("/dictionary", (req, res) => {
    res.render("dictionary");
});

// Unit Converter route
router.get("/unit-converter", (req, res) => {
    res.render("unit-converter");
});

// flashcards route
router.get("/flashcards", (req, res) => {
    res.render("flashcards");
});

// equation-solver route
router.get("/equation-solver", (req, res) => {
    res.render("equation-solver");
});

// Pomodoro Timer
router.get("/pomodoro", (req, res) => {
    res.render("pomodoro");
});

// Export the router
export default router;
