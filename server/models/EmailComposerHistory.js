// models/EmailComposerHistory.js
import mongoose from "mongoose";

const EmailComposerHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  subject: String,
  body: String,
  aiSuggestion: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("EmailComposerHistory", EmailComposerHistorySchema);
