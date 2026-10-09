import { Router } from "express";
import * as aiController from "../controllers/aiController.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const aiRoutes = Router();

aiRoutes.use(requireAuth);

aiRoutes.post("/description-suggestions", aiController.suggestDescription);
