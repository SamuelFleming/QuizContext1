import { Router } from "express";
import * as attemptController from "../controllers/attemptController.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const attemptRoutes = Router();

attemptRoutes.use(requireAuth);

attemptRoutes.get("/", attemptController.list);
attemptRoutes.get("/:attemptId", attemptController.get);
attemptRoutes.patch("/:attemptId", attemptController.save);
attemptRoutes.post("/:attemptId/submit", attemptController.submit);
attemptRoutes.post("/:attemptId/evaluate", attemptController.evaluate);
