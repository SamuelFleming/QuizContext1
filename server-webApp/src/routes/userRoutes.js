import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const userRoutes = Router();

userRoutes.get("/me", requireAuth, userController.getMe);
userRoutes.patch("/me", requireAuth, userController.updateMe);
