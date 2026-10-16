import express from "express";
import swaggerUi from "swagger-ui-express";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { openApiSpec } from "./openapi/index.js";
import { aiUsageRoutes } from "./routes/aiUsageRoutes.js";
import { diagnosticsRoutes } from "./routes/diagnosticsRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());

  app.use("/", diagnosticsRoutes);
  app.use("/users", userRoutes);
  app.use("/ai-usage", aiUsageRoutes);

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
