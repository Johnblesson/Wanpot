import Algebrite from "algebrite";
import Tesseract from "tesseract.js";
import fetch from "node-fetch";
import translate from "@vitalets/google-translate-api";
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

// Folder to save temporary uploads and processed files
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

export const renderPDFTools = (req, res) => {
  res.render('pdf-tools', { pageTitle: 'Wanpot | PDF Tools' });
};

// POST /pdf-tools/process
export const processPDF = async (req, res) => {
  try {
    const files = req.files;
    const { action, pages } = req.body;

    if (!files || files.length === 0) return res.json({ success: false, error: 'No PDF uploaded' });

    const outputPath = path.join(uploadDir, `pdf-tools-${Date.now()}.pdf`);

    if (action === 'merge') {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const data = fs.readFileSync(file.path);
        const pdf = await PDFDocument.load(data);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();
      fs.writeFileSync(outputPath, mergedBytes);

    } else if (action === 'split') {
      const splitPdf = await PDFDocument.create();
      const pageRanges = pages ? pages.split(',') : ['all'];

      const data = fs.readFileSync(files[0].path);
      const pdf = await PDFDocument.load(data);
      const totalPages = pdf.getPageCount();

      const pagesToAdd = [];

      if (pageRanges[0] === 'all') {
        pagesToAdd.push(...Array.from({ length: totalPages }, (_, i) => i));
      } else {
        pageRanges.forEach(range => {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            for (let i = start - 1; i <= end - 1; i++) pagesToAdd.push(i);
          } else {
            pagesToAdd.push(Number(range) - 1);
          }
        });
      }

      const copiedPages = await splitPdf.copyPages(pdf, pagesToAdd);
      copiedPages.forEach(p => splitPdf.addPage(p));

      const splitBytes = await splitPdf.save();
      fs.writeFileSync(outputPath, splitBytes);

    } else if (action === 'compress') {
      // Simple compress by re-saving the PDF
      const pdf = await PDFDocument.load(fs.readFileSync(files[0].path));
      const compressedBytes = await pdf.save({ useObjectStreams: false, addDefaultEncoding: true });
      fs.writeFileSync(outputPath, compressedBytes);
    } else {
      return res.json({ success: false, error: 'Invalid action' });
    }

    // Cleanup uploaded files
    files.forEach(f => fs.unlinkSync(f.path));

    res.json({ success: true, url: `/uploads/${path.basename(outputPath)}` });

  } catch (err) {
    console.error(err);
    res.json({ success: false, error: 'Error processing PDF' });
  }
};



export const getSolverPage = (req, res) => {
  res.render("equation-solver", { result: null, equation: "", error: null });
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
    return res.render("equation-solver", { result: null, equation: "", error: "Please enter an equation.", steps: [] });
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

    res.render("equation-solver", { result, equation, error: null, steps });
  } catch (err) {
    res.render("equation-solver", { result: null, equation, error: "Error solving equation. Check syntax.", steps: [] });
  }
};


export const scanEquation = async (req, res) => {
  if (!req.file) {
    return res.render("equation-solver", {
      result: null,
      equation: "",
      error: "No image uploaded.",
    });
  }

  try {
    const { data } = await Tesseract.recognize(req.file.path, "eng");
    const text = data.text.trim();

    fs.unlinkSync(req.file.path); // remove uploaded file

    res.render("equation-solver", { result: null, equation: text, error: null });
  } catch (err) {
    res.render("equation-solver", {
      result: null,
      equation: "",
      error: "Failed to extract text from image.",
    });
  }
};



// GET Translator Page
export const getTranslatorPage = (req, res) => {
  res.render("translator");
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
  // You can pass default values, themes, or template options
  const templates = ["classic", "modern", "minimal"];
  const colors = ["#3b82f6", "#06b6d4", "#ef4444", "#f59e0b"]; // blue, cyan, red, yellow
  res.render("resume", { templates, colors, pageTitle: "Wanpot | Resume Builder" });
};
