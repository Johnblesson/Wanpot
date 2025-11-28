// models/CareerCoachHistory.js
import mongoose from "mongoose";

const CareerCoachHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  prompt: String,
  response: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("CareerCoachHistory", CareerCoachHistorySchema);
