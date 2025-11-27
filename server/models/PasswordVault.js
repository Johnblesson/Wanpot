// models/PasswordVault.js
import mongoose from "mongoose";

const PasswordVaultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      default: "",
    },
    usernameOrEmail: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("PasswordVault", PasswordVaultSchema);
