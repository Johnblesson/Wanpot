// controllers/typistController.js
import Typist from "../models/Typist.js";

// Get top 5 typists
export const getLeaderboard = async (req, res) => {
  try {
    const records = await Typist.find().sort({ wpm: -1 }).limit(5);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new typist record
export const addTypist = async (req, res) => {
  try {
    const { name, mode, wpm, accuracy, time } = req.body;
    const newRecord = new Typist({ name, mode, wpm, accuracy, time });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getTypingGame = async (req, res) => {
  try {
    const user = req.isAuthenticated() ? req.user : null;

    // Fetch top 5 typists sorted by WPM descending
    const typists = await Typist.find().sort({ wpm: -1 }).limit(5).lean();

    res.render("features/typing-game", { user, typists });
  } catch (err) {
    console.error(err);
    res.render("features/typing-game", { user, typists: [] });
  }
};