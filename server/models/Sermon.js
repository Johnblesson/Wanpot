import mongoose from "mongoose";

const SermonSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  topic: { type: String, required: true },
  promptSent: { type: String },
  generated: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Sermon", SermonSchema);
