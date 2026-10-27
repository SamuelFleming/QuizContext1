import { useEffect, useState } from "react";
import HistoryCounts from "../../components/history/HistoryCounts.jsx";
import RecentResultsList from "../../components/history/RecentResultsList.jsx";
import ScoreCompletionCircle from "../../components/history/ScoreCompletionCircle.jsx";
import ScoreDistributionPlot from "../../components/history/ScoreDistributionPlot.jsx";
import { useAuth } from "../../context/useAuth.js";
import { getSubjectHistory } from "../../services/subjectService.js";

const HISTORY_LIMIT = 3;

// Compact scoped counts, stats, and recent results for the workspace selection.
export default function ScopeStudySummary({ subjectId, topicId, navigate }) {
  const { signOut } = useAuth();
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subjectId) return undefined;
    let active = true;

    getSubjectHistory(subjectId, {
      ...(topicId ? { topicId } : {}),
      page,
      limit: HISTORY_LIMIT,
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
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [subjectId, topicId, page, reloadToken, signOut]);

  function changePage(nextPage) {
    setLoading(true);
    setError("");
    setPage(nextPage);
  }

  function retry() {
    setLoading(true);
    setError("");
    setPage(1);
    setReloadToken((token) => token + 1);
  }

  const stats = summary?.stats || {};

  return (
    <section className="scope-study-summary" aria-label="Study history">
      <h2>Study history</h2>
      {error ? (
        <>
          <p className="error-text" role="alert">
            {error}
          </p>
          <button type="button" className="link" onClick={retry}>
            Try again
          </button>
        </>
      ) : null}
      {!summary && loading ? (
        <p className="status-line">Loading study history…</p>
      ) : summary ? (
        <>
          <HistoryCounts counts={summary.counts} lastStudiedAt={summary.lastStudiedAt} />

          {summary.counts.quizzesSaved === 0 ? (
            <p className="status-line">No quizzes in this scope yet.</p>
          ) : summary.counts.evaluatedAttempts === 0 ? (
            <p className="status-line">
              Quizzes are saved in this scope, but none have an evaluated attempt yet.
            </p>
          ) : (
            <>
              <div className="scope-study-stats">
                <ScoreCompletionCircle value={stats.avgPercent} label="Average score" />
                <ScoreDistributionPlot
                  min={stats.minPercent}
                  max={stats.maxPercent}
                  mean={stats.meanPercent}
                  last={stats.lastPercent}
                />
              </div>
              <RecentResultsList
                items={summary.recentResults}
                pagination={summary.pagination}
                loading={loading}
                emptyMessage="No evaluated results in this scope."
                onPageChange={changePage}
                onSelectRow={(result) => navigate(`/attempts/${result.attemptId}`)}
              />
            </>
          )}
        </>
      ) : null}
    </section>
  );
}
