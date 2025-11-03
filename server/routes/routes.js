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

export default router;
