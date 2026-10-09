import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { fetchDatabaseDiagnostic } from "./dataClient.js";
import { errorHandler, notFound, sendData } from "./http.js";
import { openApiSpec } from "./openapi.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    sendData(res, { service: "server-webApp", status: "ok" });
  });

  app.get("/diagnostics/connectivity", async (_req, res, next) => {
    try {
      const downstream = await fetchDatabaseDiagnostic();
      sendData(res, { webApp: "ok", ...downstream });
    } catch (err) {
      next(err);
    }
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
