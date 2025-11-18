import mongoose from "mongoose";

const BrainstormRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: false },
    prompt: { type: String, required: true },
    aiResponse: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("BrainstormRequest", BrainstormRequestSchema);
