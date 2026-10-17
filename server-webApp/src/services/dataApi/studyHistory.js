import { userScopedRequest } from "./client.js";

export const getStudyHistorySource = (userId) => userScopedRequest(userId, "/study-history");
