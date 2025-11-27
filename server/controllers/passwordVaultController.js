// controllers/passwordVaultController.js
import PasswordVault from "../models/PasswordVault.js";

export const renderPasswordGeneratorPage = async (req, res) => {
  try {
    const user = req.isAuthenticated() ? req.user : null;

    // If not logged in, render page without vault items
    if (!user) {
      return res.render("features/password-generator", {
        user: null,
        vaultItems: []
      });
    }

    // Load user’s saved passwords
    const vaultItems = await PasswordVault.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.render("features/password-generator", {
      user,
      vaultItems
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


export const savePassword = async (req, res) => {
  try {
    const { url, usernameOrEmail, password } = req.body;

    if (!password) {
      return res.status(400).json({ msg: "Password is required." });
    }

    const saved = await PasswordVault.create({
      userId: req.user._id,
      url: url || "",
      usernameOrEmail: usernameOrEmail || "",
      password,
    });

    res.status(201).json({ msg: "Password saved successfully", data: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getUserPasswords = async (req, res) => {
  try {
    const items = await PasswordVault.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const deletePassword = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await PasswordVault.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ msg: "Password not found" });
    }

    res.status(200).json({ msg: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
