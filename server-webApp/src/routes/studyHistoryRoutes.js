import { Router } from "express";
import * as studyHistoryController from "../controllers/studyHistoryController.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const studyHistoryRoutes = Router();

studyHistoryRoutes.use(requireAuth);

studyHistoryRoutes.get("/", studyHistoryController.get);
