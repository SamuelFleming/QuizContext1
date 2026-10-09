import express from "express";
import swaggerUi from "swagger-ui-express";
import { pingDatabase } from "./db.js";
import { errorHandler, notFound, sendData } from "./http.js";
import { requireInternalKey } from "./internalAuth.js";
import { openApiSpec } from "./openapi.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/health", (_req, res) => {
    sendData(res, { service: "server-data", status: "ok" });
  });

  app.get("/diagnostics/database", requireInternalKey, async (_req, res, next) => {
    try {
      const reachable = await pingDatabase(process.env.MONGODB_URI);
      sendData(res, { database: reachable ? "ok" : "failed" });
    } catch (err) {
      next(err);
    }
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
