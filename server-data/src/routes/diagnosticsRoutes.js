import { Router } from "express";
import * as diagnosticsController from "../controllers/diagnosticsController.js";
import { requireInternalKey } from "../middleware/internalAuth.js";

export const diagnosticsRoutes = Router();

diagnosticsRoutes.get("/health", diagnosticsController.getHealth);
diagnosticsRoutes.get("/diagnostics/database", requireInternalKey, diagnosticsController.getDatabaseStatus);
