// server/models/CoverLetter.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const coverLetterSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null }, // optional if user not logged in
    jobDescription: { type: String, required: true },
    promptSent: { type: String, required: true },
    generated: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

export default model("CoverLetter", coverLetterSchema);
