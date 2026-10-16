import { Router } from "express";
import * as aiUsageController from "../controllers/aiUsageController.js";
import { requireInternalKey, requireUserId } from "../middleware/internalAuth.js";

export const aiUsageRoutes = Router();

aiUsageRoutes.use(requireInternalKey, requireUserId);

aiUsageRoutes.post("/", aiUsageController.create);
aiUsageRoutes.get("/summary", aiUsageController.getSummary);
