import mongoose from "mongoose";

const videoScriptSchema = new mongoose.Schema(
  {
    topic: String,
    style: String,
    duration: String,
    aiScript: String,
  },
  { timestamps: true }
);

export default mongoose.model("VideoScript", videoScriptSchema);
