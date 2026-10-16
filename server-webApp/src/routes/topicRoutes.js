import { Router } from "express";
import * as topicController from "../controllers/topicController.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const topicRoutes = Router();

topicRoutes.use(requireAuth);

topicRoutes.get("/:topicId", topicController.get);
topicRoutes.patch("/:topicId", topicController.update);
topicRoutes.delete("/:topicId", topicController.remove);
