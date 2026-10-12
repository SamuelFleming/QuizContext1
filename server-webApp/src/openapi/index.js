import { components } from "./components.js";
import { aiPaths } from "./paths/ai.js";
import { attemptPaths } from "./paths/attempts.js";
import { authPaths } from "./paths/auth.js";
import { documentPaths } from "./paths/documents.js";
import { quizPaths } from "./paths/quizzes.js";
import { settingsPaths } from "./paths/settings.js";
import { subjectPaths } from "./paths/subjects.js";
import { systemPaths } from "./paths/system.js";
import { topicPaths } from "./paths/topics.js";
import { userPaths } from "./paths/users.js";

const METHODS = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);

const TAGS = [
  "HEALTH",
  "DIAGNOSTICS",
  "AUTH",
  "USERS",
  "SETTINGS",
  "SUBJECTS",
  "TOPICS",
  "DOCUMENTS",
  "QUIZZES",
  "ATTEMPTS",
  "AI",
];

function tagForPath(path) {
  if (path === "/health") return "HEALTH";
  if (path.startsWith("/diagnostics")) return "DIAGNOSTICS";
  if (path.startsWith("/auth")) return "AUTH";
  if (path.startsWith("/users")) return "USERS";
  if (path.startsWith("/settings")) return "SETTINGS";
  if (path.includes("/topics")) return "TOPICS";
  if (path.includes("/documents")) return "DOCUMENTS";
  if (path.startsWith("/subjects")) return "SUBJECTS";
  if (path.startsWith("/quizzes")) return "QUIZZES";
  if (path.startsWith("/attempts")) return "ATTEMPTS";
  if (path.startsWith("/ai")) return "AI";
  return "DEFAULT";
}

function tagPaths(paths) {
  return Object.fromEntries(
    Object.entries(paths).map(([path, pathItem]) => [
      path,
      Object.fromEntries(
        Object.entries(pathItem).map(([key, operation]) => [
          key,
          METHODS.has(key) ? { ...operation, tags: [tagForPath(path)] } : operation,
        ]),
      ),
    ]),
  );
}

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "QuizContext business API",
    version: "0.1.0",
    description: "User-facing business API. Documents implemented routes only.",
  },
  tags: TAGS.map((name) => ({ name })),
  paths: tagPaths({
    ...systemPaths,
    ...authPaths,
    ...userPaths,
    ...settingsPaths,
    ...subjectPaths,
    ...topicPaths,
    ...documentPaths,
    ...quizPaths,
    ...attemptPaths,
    ...aiPaths,
  }),
  components,
};
