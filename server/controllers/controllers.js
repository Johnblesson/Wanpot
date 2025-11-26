import Algebrite from "algebrite";
import Tesseract from "tesseract.js";
import fetch from "node-fetch";
import translate from "@vitalets/google-translate-api";
import path from 'path';
// import { PDFDocument } from 'pdf-lib';
import fs from 'fs';


export const getSolverPage = (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  res.render("features/equation-solver", { result: null, equation: "", error: null, user });
};

// export const solveEquation = (req, res) => {
//   const { equation } = req.body;

//   if (!equation || equation.trim() === "") {
//     return res.render("equation-solver", {
//       result: null,
//       equation: "",
//       error: "Please enter an equation.",
//     });
//   }

//   try {
//     const cleanedEq = equation
//       .replace(/(\d)([a-zA-Z])/g, "$1*$2")
//       .replace(/([a-zA-Z])(\d)/g, "$1*$2")
//       .replace(/[^\d\+\-\*\/\^\=\.\(\)xX]/g, "")
//       .replace(/\s+/g, "");

//     const simplified = Algebrite.run(`simplify(${cleanedEq})`);
//     const roots = Algebrite.run(`roots(${cleanedEq})`);
//     const result = `Equation Simplified:\n${simplified}\n\nRoots / Solutions:\n${roots}`;

//     res.render("equation-solver", { result, equation, error: null });
//   } catch (err) {
//     res.render("equation-solver", {
//       result: null,
//       equation,
//       error: "Unable to solve equation. Check syntax.",
//     });
//   }
// };


export const solveEquation = (req, res) => {
  const { equation } = req.body;
  if (!equation || equation.trim() === "") {
    return res.render("features/equation-solver", { result: null, equation: "", error: "Please enter an equation.", steps: [] });
  }

  try {
    const cleanedEq = equation.replace(/\s+/g, "");
    const simplified = Algebrite.run(`simplify(${cleanedEq})`);
    const factored = Algebrite.run(`factor(${cleanedEq})`);
    const roots = Algebrite.run(`roots(${cleanedEq})`);

    // Simulated step-by-step derivation (Algebrite doesn’t directly output steps)
    const steps = [
      `Start with: ${equation}`,
      `Simplify the equation: ${simplified}`,
      `Factorize where possible: ${factored}`,
      `Solve for x (roots): ${roots}`
    ];

    const result = `Simplified: ${simplified}\nFactored: ${factored}\nRoots: ${roots}`;

    res.render("features/equation-solver", { result, equation, error: null, steps });
  } catch (err) {
    res.render("features/equation-solver", { result: null, equation, error: "Error solving equation. Check syntax.", steps: [] });
  }
};


export const scanEquation = async (req, res) => {
  if (!req.file) {
    return res.render("features/equation-solver", {
      result: null,
      equation: "",
      error: "No image uploaded.",
    });
  }

  try {
    const { data } = await Tesseract.recognize(req.file.path, "eng");
    const text = data.text.trim();

    fs.unlinkSync(req.file.path); // remove uploaded file

    res.render("features/equation-solver", { result: null, equation: text, error: null });
  } catch (err) {
    res.render("features/equation-solver", {
      result: null,
      equation: "",
      error: "Failed to extract text from image.",
    });
  }
};



// GET Translator Page
export const getTranslatorPage = (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  res.render("features/translator", {user});
};

// // POST — Translate Text
// export const translateText = async (req, res) => {
//   const { sourceText, sourceLang, targetLang } = req.body;

//   if (!sourceText || !targetLang) {
//     return res.json({ error: "Missing required fields." });
//   }

//   try {
//     // --- Try LibreTranslate first ---
//     const libreResponse = await fetch("https://libretranslate.de/translate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         q: sourceText,
//         source: sourceLang === "auto" ? null : sourceLang,
//         target: targetLang,
//         format: "text",
//       }),
//     });

//     const libreData = await libreResponse.json();

//     if (libreData && libreData.translatedText) {
//       return res.json({
//         translation: libreData.translatedText,
//         detectedLangName:
//           sourceLang === "auto" ? "Auto-detected" : sourceLang.toUpperCase(),
//       });
//     }

//     throw new Error("LibreTranslate failed or returned invalid data.");
//   } catch (error) {
//     console.warn("⚠️ LibreTranslate failed, switching to Google Translate fallback...");

//     try {
//       // --- Fallback to Google Translate ---
//       const googleResult = await translate(sourceText, {
//         from: sourceLang === "auto" ? "auto" : sourceLang,
//         to: targetLang,
//       });

//       return res.json({
//         translation: googleResult.text,
//         detectedLangName: googleResult.from.language.iso.toUpperCase(),
//       });
//     } catch (fallbackError) {
//       console.error("❌ Both translations failed:", fallbackError);
//       return res.json({
//         error: "Translation failed — please check your internet connection or try again later.",
//       });
//     }
//   }
// };




export const translateText = async (req, res) => {
  const { text, from, to } = req.body;

  try {
    // Call MyMemory Translation API
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${from}|${to}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data?.responseData?.translatedText) {
      return res.json({
        translation: data.responseData.translatedText,
      });
    } else {
      console.error("Translation API returned unexpected data:", data);
      return res
        .status(500)
        .json({ error: "Unexpected API response format." });
    }
  } catch (error) {
    console.error("Translation error:", error);
    return res.status(500).json({ error: "Translation failed. Try again later." });
  }
};





export const renderResumeBuilder = (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  // You can pass default values, themes, or template options
  const templates = ["classic", "modern", "minimal"];
  const colors = ["#3b82f6", "#06b6d4", "#ef4444", "#f59e0b"]; // blue, cyan, red, yellow
  res.render("resume", { templates, colors, pageTitle: "Wanpot | Resume Builder", user });
};



// =============================
// Voice Recorder Controller
// =============================
export const renderVoiceRecorder = (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  res.render("features/voice-recorder", 
    { 
      pageTitle: "Wanpot | Voice Recorder", 
      user 
    });
};
// Would you like me to extend it next so it stores transcriptions in a database (with timestamps and optional titles for each note)?