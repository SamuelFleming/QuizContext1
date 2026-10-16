import { Router } from "express";
import * as diagnosticsController from "../controllers/diagnosticsController.js";

export const diagnosticsRoutes = Router();

diagnosticsRoutes.get("/health", diagnosticsController.getHealth);
diagnosticsRoutes.get("/diagnostics/connectivity", diagnosticsController.getConnectivity);
