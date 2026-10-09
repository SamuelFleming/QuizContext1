import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { requireInternalKey, requireUserId } from "../middleware/internalAuth.js";

export const userRoutes = Router();

// Every user route requires the internal API key. These routes are not browser-reachable.
userRoutes.use(requireInternalKey);

userRoutes.post("/", userController.create);
userRoutes.get("/by-email", userController.getByEmail);
userRoutes.get("/me", requireUserId, userController.getMe);
userRoutes.patch("/me", requireUserId, userController.updateMe);
userRoutes.get("/me/ai-settings", requireUserId, userController.getAiSettings);
userRoutes.put("/me/ai-settings/mode", requireUserId, userController.updateAiAccessMode);
userRoutes.get("/me/ai-key", requireUserId, userController.getAiKey);
userRoutes.put("/me/ai-key", requireUserId, userController.putAiKey);
userRoutes.delete("/me/ai-key", requireUserId, userController.deleteAiKey);
