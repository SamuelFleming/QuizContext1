import { Router } from "express";
import * as attemptController from "../controllers/attemptController.js";
import { requireInternalKey, requireUserId } from "../middleware/internalAuth.js";

export const attemptRoutes = Router();

attemptRoutes.use(requireInternalKey, requireUserId);

attemptRoutes.post("/", attemptController.create);
attemptRoutes.get("/", attemptController.list);
attemptRoutes.get("/:attemptId", attemptController.get);
attemptRoutes.patch("/:attemptId", attemptController.updateResponses);
attemptRoutes.post("/:attemptId/submit", attemptController.submit);
attemptRoutes.put("/:attemptId/evaluation", attemptController.saveEvaluation);
