import { Router } from "express";
import * as quizController from "../controllers/quizController.js";
import { requireInternalKey, requireUserId } from "../middleware/internalAuth.js";

export const quizRoutes = Router();

quizRoutes.use(requireInternalKey, requireUserId);

quizRoutes.post("/", quizController.create);
quizRoutes.get("/", quizController.list);
quizRoutes.get("/:quizId/attempts", quizController.listAttempts);
quizRoutes.get("/:quizId", quizController.get);
quizRoutes.delete("/:quizId", quizController.remove);
