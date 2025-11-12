// models/Typist.js
import mongoose from "mongoose";

const TypistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mode: { type: String, required: true },
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  time: { type: Number, required: true },
}, { timestamps: true });

const Typist = mongoose.model("Typist", TypistSchema);
export default Typist;
