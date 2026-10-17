import { components } from "./components.js";
import { aiUsagePaths } from "./paths/aiUsage.js";
import { attemptPaths } from "./paths/attempts.js";
import { documentPaths } from "./paths/documents.js";
import { quizPaths } from "./paths/quizzes.js";
import { studyHistoryPaths } from "./paths/studyHistory.js";
import { subjectPaths } from "./paths/subjects.js";
import { systemPaths } from "./paths/system.js";
import { topicPaths } from "./paths/topics.js";
import { userPaths } from "./paths/users.js";

const METHODS = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);

const TAGS = [
  "HEALTH",
  "DIAGNOSTICS",
  "USERS",
  "SETTINGS",
  "AI USAGE",
  "SUBJECTS",
  "TOPICS",
  "DOCUMENTS",
  "QUIZZES",
  "ATTEMPTS",
  "STUDY HISTORY",
];

function tagForPath(path) {
  if (path === "/health") return "HEALTH";
  if (path.startsWith("/diagnostics")) return "DIAGNOSTICS";
  if (path.startsWith("/users/me/ai-")) return "SETTINGS";
  if (path.startsWith("/users")) return "USERS";
  if (path.startsWith("/ai-usage")) return "AI USAGE";
  if (path.includes("/topics")) return "TOPICS";
  if (path.includes("/documents") || path.includes("/context-sources")) return "DOCUMENTS";
  if (path.startsWith("/subjects")) return "SUBJECTS";
  if (path.startsWith("/quizzes")) return "QUIZZES";
  if (path.startsWith("/attempts")) return "ATTEMPTS";
  if (path.startsWith("/study-history")) return "STUDY HISTORY";
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
    title: "QuizContext data API",
    version: "0.1.0",
    description: "Persistence API. Documents implemented routes only.",
  },
  tags: TAGS.map((name) => ({ name })),
  paths: tagPaths({
    ...systemPaths,
    ...userPaths,
    ...aiUsagePaths,
    ...subjectPaths,
    ...topicPaths,
    ...documentPaths,
    ...quizPaths,
    ...attemptPaths,
    ...studyHistoryPaths,
  }),
  components,
};
