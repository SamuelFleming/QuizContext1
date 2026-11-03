import { Router } from "express";
import * as attemptController from "../controllers/attemptController.js";
import * as quizController from "../controllers/quizController.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const quizRoutes = Router();

quizRoutes.use(requireAuth);

quizRoutes.post("/", quizController.create);
quizRoutes.post("/preview", quizController.preview);
quizRoutes.get("/", quizController.list);
quizRoutes.post("/:quizId/attempts", attemptController.start);
quizRoutes.get("/:quizId/attempts", quizController.listAttempts);
quizRoutes.get("/:quizId/history", quizController.getHistory);
quizRoutes.get("/:quizId/export", quizController.exportQuiz);
quizRoutes.get("/:quizId", quizController.get);
quizRoutes.patch("/:quizId", quizController.rename);
quizRoutes.delete("/:quizId", quizController.remove);
