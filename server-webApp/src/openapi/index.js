import { components } from "./components.js";
import { authPaths } from "./paths/auth.js";
import { settingsPaths } from "./paths/settings.js";
import { systemPaths } from "./paths/system.js";
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
  },
  components,
};
