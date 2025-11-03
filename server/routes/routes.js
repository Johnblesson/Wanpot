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

export default router;
