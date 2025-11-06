import Algebrite from "algebrite";
import Tesseract from "tesseract.js";
import fs from "fs";

export const getSolverPage = (req, res) => {
  res.render("equation-solver", { result: null, equation: "", error: null });
};

export const solveEquation = (req, res) => {
  const { equation } = req.body;

  if (!equation || equation.trim() === "") {
    return res.render("equation-solver", {
      result: null,
      equation: "",
      error: "Please enter an equation.",
    });
  }

  try {
    const cleanedEq = equation
      .replace(/(\d)([a-zA-Z])/g, "$1*$2")
      .replace(/([a-zA-Z])(\d)/g, "$1*$2")
      .replace(/[^\d\+\-\*\/\^\=\.\(\)xX]/g, "")
      .replace(/\s+/g, "");

    const simplified = Algebrite.run(`simplify(${cleanedEq})`);
    const roots = Algebrite.run(`roots(${cleanedEq})`);
    const result = `Equation Simplified:\n${simplified}\n\nRoots / Solutions:\n${roots}`;

    res.render("equation-solver", { result, equation, error: null });
  } catch (err) {
    res.render("equation-solver", {
      result: null,
      equation,
      error: "Unable to solve equation. Check syntax.",
    });
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
