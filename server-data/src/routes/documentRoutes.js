import { Router } from "express";
import * as documentController from "../controllers/documentController.js";
import { requireInternalKey, requireUserId } from "../middleware/internalAuth.js";

export const documentRoutes = Router();

documentRoutes.use(requireInternalKey, requireUserId);

documentRoutes.post("/", documentController.create);
documentRoutes.get("/:documentId", documentController.get);
documentRoutes.patch("/:documentId", documentController.update);
documentRoutes.delete("/:documentId", documentController.remove);
