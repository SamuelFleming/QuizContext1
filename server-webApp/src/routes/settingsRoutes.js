import { Router } from "express";
import * as settingsController from "../controllers/settingsController.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const settingsRoutes = Router();

settingsRoutes.use(requireAuth);

settingsRoutes.get("/ai", settingsController.getAiStatus);
settingsRoutes.get("/ai/usage", settingsController.getAiUsage);
settingsRoutes.put("/ai/mode", settingsController.setAiMode);
settingsRoutes.put("/ai/key", settingsController.saveAiKey);
settingsRoutes.delete("/ai/key", settingsController.removeAiKey);
settingsRoutes.post("/ai/check", settingsController.checkAi);
