import { Router } from "express";
import * as studyHistoryController from "../controllers/studyHistoryController.js";
import { requireInternalKey, requireUserId } from "../middleware/internalAuth.js";

export const studyHistoryRoutes = Router();

studyHistoryRoutes.use(requireInternalKey, requireUserId);

studyHistoryRoutes.get("/attempts", studyHistoryController.readAttempts);
studyHistoryRoutes.get("/", studyHistoryController.readResults);
