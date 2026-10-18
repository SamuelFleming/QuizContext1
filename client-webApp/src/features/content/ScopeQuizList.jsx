import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { listQuizzes } from "../../services/quizService.js";

const PAGE_SIZE = 5;

function resultLabel(quiz) {
  if (!quiz.latestResult) return "No evaluated attempt";
  return `${quiz.latestResult.score} / ${quiz.latestResult.maxScore}`;
}

// Paginated quizzes for the selected subject or topic (no library filter chrome).
export default function ScopeQuizList({ subjectId, topicId, navigate }) {
  const { signOut } = useAuth();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [error, setError] = useState("");

  const requestKey = `${topicId || `subject:${subjectId}`}:p${page}`;

  useEffect(() => {
    if (!subjectId) return undefined;
    let active = true;
    const query = topicId
      ? { topicIds: [topicId], page, limit: PAGE_SIZE, sort: "newest" }
      : { subjectId, page, limit: PAGE_SIZE, sort: "newest" };

    listQuizzes(query)
      .then((data) => {
        if (!active) return;
        setResult(data);
        setLoadedKey(requestKey);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setLoadedKey(requestKey);
        if (err.status === 401) signOut();
        else setError(err.message || "Could not load quizzes.");
      });

    return () => {
      active = false;
    };
  }, [subjectId, topicId, page, requestKey, signOut]);

  const loading = loadedKey !== requestKey;
  const scopeLabel = topicId ? "topic" : "subject";

  return (
    <section className="scope-quiz-list" aria-label="Quizzes">
      <h2>Quizzes</h2>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className="status-line">Loading quizzes…</p>
      ) : !result || result.items.length === 0 ? (
        <p className="status-line">No quizzes for this {scopeLabel} yet.</p>
      ) : (
        <>
          <ul className="item-list">
            {result.items.map((quiz) => (
              <li key={quiz.id}>
                <button
                  type="button"
                  className="item-link"
                  onClick={() => navigate(`/quizzes/${quiz.id}`)}
                >
                  <span>{quiz.title}</span>
                  <span className="usage-meta">{quiz.topicPath || quiz.subjectName}</span>
                  <span className="usage-meta">
                    {quiz.questionCount} questions · {quiz.attemptCount}{" "}
                    {quiz.attemptCount === 1 ? "attempt" : "attempts"} · {resultLabel(quiz)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {result.pagination.totalPages > 1 ? (
            <nav className="pagination scope-panel-pagination" aria-label="Scoped quiz pages">
              <button
                type="button"
                onClick={() => setPage((current) => current - 1)}
                disabled={page <= 1}
              >
                Previous
              </button>
              <p>
                Page {result.pagination.page} of {result.pagination.totalPages}
              </p>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= result.pagination.totalPages}
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}
