import mongoose from "mongoose";

const mentalHealthSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("MentalHealthHistory", mentalHealthSchema);
