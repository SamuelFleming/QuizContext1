import { Router } from "express";
import * as topicController from "../controllers/topicController.js";
import { requireInternalKey, requireUserId } from "../middleware/internalAuth.js";

export const topicRoutes = Router();

topicRoutes.use(requireInternalKey, requireUserId);

topicRoutes.get("/:topicId", topicController.get);
topicRoutes.patch("/:topicId", topicController.update);
topicRoutes.delete("/:topicId", topicController.remove);
