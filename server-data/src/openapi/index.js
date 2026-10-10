import { components } from "./components.js";
import { aiUsagePaths } from "./paths/aiUsage.js";
import { attemptPaths } from "./paths/attempts.js";
import { documentPaths } from "./paths/documents.js";
import { quizPaths } from "./paths/quizzes.js";
import { subjectPaths } from "./paths/subjects.js";
import { systemPaths } from "./paths/system.js";
import { topicPaths } from "./paths/topics.js";
import { userPaths } from "./paths/users.js";

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "QuizContext data API",
    version: "0.1.0",
    description: "Persistence API. Documents implemented routes only.",
  },
  paths: {
    ...systemPaths,
    ...userPaths,
    ...aiUsagePaths,
    ...subjectPaths,
    ...topicPaths,
    ...documentPaths,
    ...quizPaths,
    ...attemptPaths,
  },
  components,
};
