import { Router } from "express";
import * as documentController from "../controllers/documentController.js";
import { documentUpload } from "../middleware/documentUpload.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const documentRoutes = Router();

// Auth runs before the upload is buffered.
documentRoutes.use(requireAuth);

documentRoutes.post("/extract", documentUpload, documentController.extract);
documentRoutes.post("/", documentController.create);
documentRoutes.get("/:documentId", documentController.get);
documentRoutes.patch("/:documentId", documentController.update);
documentRoutes.delete("/:documentId", documentController.remove);
