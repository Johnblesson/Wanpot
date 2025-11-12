// models/SearchHistory.js
import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  word: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('SearchHistory', searchHistorySchema);