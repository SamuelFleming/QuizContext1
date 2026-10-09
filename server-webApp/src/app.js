import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { openApiSpec } from "./openapi/index.js";
import { authRoutes } from "./routes/authRoutes.js";
import { diagnosticsRoutes } from "./routes/diagnosticsRoutes.js";
import { settingsRoutes } from "./routes/settingsRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5017" }));
  app.use(express.json());

  app.use("/", diagnosticsRoutes);
  app.use("/auth", authRoutes);
  app.use("/users", userRoutes);
  app.use("/settings", settingsRoutes);

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
