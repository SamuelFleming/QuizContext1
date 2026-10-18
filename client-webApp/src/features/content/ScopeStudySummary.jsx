import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { getStudyHistory } from "../../services/studyHistoryService.js";

const formatDate = (value) => new Date(value).toLocaleDateString();

// Compact study-history counts and recent results for the workspace selection.
export default function ScopeStudySummary({ subjectId, topicId, navigate }) {
  const { signOut } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subjectId) return undefined;
    let active = true;

    getStudyHistory({
      subjectId,
      ...(topicId ? { topicId } : {}),
      recent: "5",
    })
      .then((data) => {
        if (!active) return;
        setSummary(data);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) signOut();
        else setError(err.message || "Could not load study history.");
      });

    return () => {
      active = false;
    };
  }, [subjectId, topicId, signOut]);

  return (
    <section className="scope-study-summary" aria-label="Study history">
      <h2>Study history</h2>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : summary === null ? (
        <p className="status-line">Loading study history…</p>
      ) : (
        <>
          <ul className="history-counts">
            <li>
              <span>Quizzes saved</span>
              <strong>{summary.counts.quizzesSaved}</strong>
            </li>
            <li>
              <span>Quizzes attempted</span>
              <strong>{summary.counts.quizzesAttempted}</strong>
            </li>
            <li>
              <span>Evaluated attempts</span>
              <strong>{summary.counts.evaluatedAttempts}</strong>
            </li>
            <li>
              <span>Last studied</span>
              <strong>
                {summary.lastStudiedAt
                  ? formatDate(summary.lastStudiedAt)
                  : "No evaluated attempt yet"}
              </strong>
            </li>
          </ul>

          {summary.counts.quizzesSaved === 0 ? (
            <p className="status-line">No quizzes in this scope yet.</p>
          ) : summary.counts.evaluatedAttempts === 0 ? (
            <p className="status-line">
              Quizzes are saved in this scope, but none have an evaluated attempt yet.
            </p>
          ) : (
            <>
              <h3 className="subheading">Recent results</h3>
              {summary.recentResults.length === 0 ? (
                <p className="status-line">No evaluated results in this scope.</p>
              ) : (
                <ul className="item-list">
                  {summary.recentResults.map((result) => (
                    <li key={result.attemptId}>
                      <button
                        type="button"
                        className="item-link"
                        onClick={() => navigate(`/attempts/${result.attemptId}`)}
                      >
                        <span>{result.title}</span>
                        <span className="usage-meta">{result.topicPath || result.subjectName}</span>
                        <span className="usage-meta">
                          {formatDate(result.submittedAt)} · {result.score} / {result.maxScore} (
                          {result.percent}%)
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
