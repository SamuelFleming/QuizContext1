import { useEffect, useState } from "react";
import AttemptSeriesChart from "../../components/history/AttemptSeriesChart.jsx";
import PaginatingQueryList from "../../components/history/PaginatingQueryList.jsx";
import ScoreCompletionCircle from "../../components/history/ScoreCompletionCircle.jsx";
import ScoreDistributionPlot from "../../components/history/ScoreDistributionPlot.jsx";
import { useAuth } from "../../context/useAuth.js";
import { getQuizHistory } from "../../services/quizService.js";

const HISTORY_LIMIT = 5;
const HISTORY_N = 10;

const formatAverage = (value) =>
  Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });

function formatAttemptRow(item) {
  const parts = [];
  if (item.percent != null && !Number.isNaN(Number(item.percent))) {
    parts.push(`${Math.round(Number(item.percent))}%`);
  }
  if (item.score != null && !Number.isNaN(Number(item.score))) {
    parts.push(String(item.score));
  }
  if (item.submittedAt) {
    parts.push(new Date(item.submittedAt).toLocaleString());
  }
  return parts.join(" · ");
}

function WeakestQuestions({ questions }) {
  const rows = Array.isArray(questions) ? questions : [];
  return (
    <div>
      <h3 className="subheading">Weakest questions</h3>
      {rows.length === 0 ? (
        <p className="status-line">No question weakness data yet.</p>
      ) : (
        <ul className="usage-list">
          {rows.map((question, index) => (
            <li key={`${question.prompt}-${index}`} className="query-list-row">
              <span>{question.prompt}</span>
              <span className="usage-meta">
                Average score {formatAverage(question.averageScore)} · answered{" "}
                {question.timesAnswered} {question.timesAnswered === 1 ? "time" : "times"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function QuizDetailHistory({ quizId, navigate }) {
  const { signOut } = useAuth();
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getQuizHistory(quizId, { page, limit: HISTORY_LIMIT, n: HISTORY_N })
      .then((data) => {
        if (!active) return;
        setHistory(data);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) signOut();
        else setError(err.message || "Could not load quiz history.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [quizId, page, reloadToken, signOut]);

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

  const totalItems = history?.pagination?.totalItems ?? 0;
  const hasEvaluated = totalItems > 0;
  const stats = history?.stats || {};

  return (
    <section className="card" aria-label="Quiz history">
      {error ? (
        <>
          {history ? null : <h2>Attempts</h2>}
          <p className="error-text" role="alert">
            {error}
          </p>
          <button type="button" className="link" onClick={retry}>
            Try again
          </button>
        </>
      ) : null}
      {!history && loading ? (
        <>
          <h2>Attempts</h2>
          <p className="status-line">Loading history…</p>
        </>
      ) : !hasEvaluated && !error ? (
        <>
          <h2>Attempts</h2>
          <p className="status-line">No evaluated attempts yet.</p>
        </>
      ) : hasEvaluated ? (
        <div className="quiz-detail-history">
          <PaginatingQueryList
            heading="Attempts"
            listLabel="Evaluated attempts"
            paginationLabel="Attempt pages"
            items={history.items}
            pagination={history.pagination}
            loading={loading}
            onPageChange={changePage}
            onSelectRow={(item) => navigate(`/attempts/${item.attemptId}`)}
            getRowKey={(item) => item.attemptId}
            emptyMessage="No evaluated attempts yet."
            renderRow={(item) => (
              <>
                <span>View results</span>
                <span className="usage-meta">{formatAttemptRow(item)}</span>
              </>
            )}
          />
          <div className="quiz-detail-history-main">
            <div className="quiz-detail-stats">
              <ScoreCompletionCircle
                value={stats.avgLastNPercent}
                label={`Average of last ${HISTORY_N}`}
              />
              <ScoreDistributionPlot
                min={stats.minPercent}
                max={stats.maxPercent}
                mean={stats.meanPercent}
                last={stats.lastPercent}
              />
              <AttemptSeriesChart series={history.attemptSeries} n={HISTORY_N} />
            </div>
            <WeakestQuestions questions={history.weakestQuestions} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
