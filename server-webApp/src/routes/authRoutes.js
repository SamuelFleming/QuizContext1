import { Router } from "express";
import * as authController from "../controllers/authController.js";

export const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
