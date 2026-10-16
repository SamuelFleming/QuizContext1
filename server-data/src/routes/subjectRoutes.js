import { Router } from "express";
import * as documentController from "../controllers/documentController.js";
import * as subjectController from "../controllers/subjectController.js";
import * as topicController from "../controllers/topicController.js";
import { requireInternalKey, requireUserId } from "../middleware/internalAuth.js";

export const subjectRoutes = Router();

subjectRoutes.use(requireInternalKey, requireUserId);

subjectRoutes.get("/", subjectController.list);
subjectRoutes.post("/", subjectController.create);
subjectRoutes.get("/:subjectId", subjectController.get);
subjectRoutes.patch("/:subjectId", subjectController.update);
subjectRoutes.delete("/:subjectId", subjectController.remove);
subjectRoutes.get("/:subjectId/topics", topicController.listForSubject);
subjectRoutes.post("/:subjectId/topics", topicController.createForSubject);
subjectRoutes.get("/:subjectId/documents", documentController.listForSubject);
