// controllers/searchController.js
import SearchHistory from '../models/SearchHistory.js';

// Add a search word
export const addSearch = async (req, res) => {
  try {
    const { word } = req.body;
    const userId = req.user._id;

    if (!word) return res.status(400).json({ message: 'Word is required' });

    const normalizedWord = word.toLowerCase();

    // Check if word already exists for user
    const existing = await SearchHistory.findOne({ user: userId, word: normalizedWord });
    if (!existing) {
      await SearchHistory.create({ user: userId, word: normalizedWord });
    }

    // Return updated history sorted from newest to oldest
    const history = await SearchHistory.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Search saved', history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all searches for user (newest first)
export const getSearchHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await SearchHistory.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Clear search history
export const clearSearchHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    await SearchHistory.deleteMany({ user: userId });

    // Return empty history
    res.status(200).json({ message: 'Search history cleared', history: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
