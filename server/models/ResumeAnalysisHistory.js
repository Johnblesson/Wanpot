// models/ResumeAnalysisHistory.js
import mongoose from "mongoose";

const ResumeAnalysisHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

  originalText: { type: String, required: true },
  aiSuggestions: { type: String, required: true },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ResumeAnalysisHistory", ResumeAnalysisHistorySchema);
