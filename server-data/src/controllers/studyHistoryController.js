import { toAttemptHistorySource } from "../models/attempt.js";
import { toQuizHistorySource } from "../models/quiz.js";
import { listEvaluatedAttempts } from "../repositories/attemptRepository.js";
import { listQuizzesForHistory } from "../repositories/quizRepository.js";
import { sendData } from "../utils/responses.js";

// One owner-scoped read backing the business study-history summary.
// Returns identity, scope names, prompts, and evaluated scores only.
export async function read(req, res, next) {
  try {
    const [quizzes, attempts] = await Promise.all([
      listQuizzesForHistory(req.userId),
      listEvaluatedAttempts(req.userId),
    ]);
    sendData(res, {
      quizzes: quizzes.map(toQuizHistorySource),
      attempts: attempts.map(toAttemptHistorySource),
    });
  } catch (err) {
    next(err);
  }
}
