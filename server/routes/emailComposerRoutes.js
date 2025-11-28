// routes/emailComposerRoutes.js
import express from "express";
import {
  renderEmailComposer,
  composeEmail,
  clearEmailHistory
} from "../controllers/emailComposerController.js";

    import ensureAuthenticated from "../middlewares/auth.js";


const router = express.Router();

router.get("/", ensureAuthenticated, renderEmailComposer);
router.post("/compose", ensureAuthenticated, composeEmail);
router.post("/clear", ensureAuthenticated, clearEmailHistory);

export default router;
