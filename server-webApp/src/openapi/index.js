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

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "QuizContext business API",
    version: "0.1.0",
    description: "User-facing business API. Documents implemented routes only.",
  },
  paths: {
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
  },
  components,
};
