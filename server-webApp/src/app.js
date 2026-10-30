import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { openApiSpec } from "./openapi/index.js";
import { aiRoutes } from "./routes/aiRoutes.js";
import { attemptRoutes } from "./routes/attemptRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { diagnosticsRoutes } from "./routes/diagnosticsRoutes.js";
import { documentRoutes } from "./routes/documentRoutes.js";
import { quizRoutes } from "./routes/quizRoutes.js";
import { settingsRoutes } from "./routes/settingsRoutes.js";
import { studyHistoryRoutes } from "./routes/studyHistoryRoutes.js";
import { subjectRoutes } from "./routes/subjectRoutes.js";
import { topicRoutes } from "./routes/topicRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";

const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client-webApp/dist");
const spaIndex = path.join(clientDist, "index.html");

const API_HTML_EXCLUSIONS = [
  "/health",
  "/diagnostics",
  "/auth",
  "/users",
  "/settings",
  "/topics",
  "/documents",
  "/study-history",
  "/ai",
  "/api",
];

function wantsBrowserHtml(req) {
  const accept = req.get("accept") || "";
  return accept.includes("text/html");
}

function isApiHtmlExclusion(pathname) {
  return API_HTML_EXCLUSIONS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function sendSpa(res) {
  res.sendFile(spaIndex);
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5017" }));
  app.use(express.json({ limit: "1mb" }));

  const serveSpa = fs.existsSync(spaIndex);

  if (serveSpa) {
    app.use((req, res, next) => {
      if (
        (req.method === "GET" || req.method === "HEAD") &&
        wantsBrowserHtml(req) &&
        !isApiHtmlExclusion(req.path)
      ) {
        sendSpa(res);
        return;
      }
      next();
    });
  }

  app.use("/", diagnosticsRoutes);
  app.use("/auth", authRoutes);
  app.use("/users", userRoutes);
  app.use("/settings", settingsRoutes);
  app.use("/subjects", subjectRoutes);
  app.use("/topics", topicRoutes);
  app.use("/documents", documentRoutes);
  app.use("/quizzes", quizRoutes);
  app.use("/attempts", attemptRoutes);
  app.use("/study-history", studyHistoryRoutes);
  app.use("/ai", aiRoutes);

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  if (serveSpa) {
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if ((req.method === "GET" || req.method === "HEAD") && !isApiHtmlExclusion(req.path)) {
        sendSpa(res);
        return;
      }
      next();
    });
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
