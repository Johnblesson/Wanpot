import mongoose from "mongoose";

const CodeRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  prompt: { type: String, required: true },
  aiResponse: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("CodeRequest", CodeRequestSchema);
