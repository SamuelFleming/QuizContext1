import { useEffect, useState } from "react";
import AiRunDetails from "../../components/ai/AiRunDetails.jsx";
import { useAuth } from "../../context/useAuth.js";
import { getAiUsage } from "../../services/settingsService.js";
import { formatQuestionTypeCounts } from "../../utils/questionTypeCounts.js";

const formatCost = (value) => `$${(value ?? 0).toFixed(4)}`;
const formatNumber = (value) => (value ?? 0).toLocaleString();
const formatAiMetric = (value) => (value == null ? "—" : value.toLocaleString());

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Time unavailable" : date.toLocaleString();
}

function TotalsRow({ label, totals }) {
  return (
    <li>
      <span>{label}</span>
      <span>
        {formatNumber(totals.calls)} {totals.calls === 1 ? "call" : "calls"} ·{" "}
        {formatNumber(totals.inputTokens + totals.outputTokens)} tokens ·{" "}
        {formatCost(totals.estimatedCostUsd)}
      </span>
    </li>
  );
}

function UsageItem({ item }) {
  const statusText = item.status === "succeeded" ? "OK" : item.errorCode || "Failed";
  const questionCounts = formatQuestionTypeCounts(item);
  return (
    <li>
      <details className="usage-disclosure">
        <summary>
          <span className="usage-summary">
            <span className="usage-title">
              <span>{item.operation}</span>
              <span className={`pill ${item.status === "succeeded" ? "ok" : "failed"}`}>
                {statusText}
              </span>
            </span>
            <span className="usage-meta">
              {item.model || "Model unavailable"} · Input {formatAiMetric(item.inputTokens)} tokens · Output{" "}
              {formatAiMetric(item.outputTokens)} tokens
              {item.inputChars == null ? "" : ` · ${formatAiMetric(item.inputChars)} input characters`}
              {questionCounts ? ` · ${questionCounts}` : ""} · Cost{" "}
              {item.estimatedCostUsd == null ? "—" : formatCost(item.estimatedCostUsd)} ·{" "}
              {formatTime(item.createdAt)}
            </span>
          </span>
        </summary>
        <AiRunDetails run={item} />
      </details>
    </li>
  );
}

export default function UsagePanel({ refreshKey }) {
  const { signOut: onUnauthorized } = useAuth();
  const [page, setPage] = useState(1);
  const [seenRefreshKey, setSeenRefreshKey] = useState(refreshKey);
  const [usage, setUsage] = useState(null);
  const [loadedPage, setLoadedPage] = useState(0);
  const [loadedRefreshKey, setLoadedRefreshKey] = useState(refreshKey);
  const [error, setError] = useState("");
  if (refreshKey !== seenRefreshKey) {
    setSeenRefreshKey(refreshKey);
    setPage(1);
  }
  const loading = loadedPage !== page || loadedRefreshKey !== refreshKey;

  useEffect(() => {
    let cancelled = false;
    getAiUsage(page)
      .then((next) => {
        if (cancelled) return;
        setUsage(next);
        setLoadedPage(page);
        setLoadedRefreshKey(refreshKey);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) onUnauthorized();
        else setError(err.message || "Could not load usage.");
      });
    return () => {
      cancelled = true;
    };
  }, [page, refreshKey, onUnauthorized]);

  if (error) {
    return (
      <section className="card">
        <p className="eyebrow">Usage this month</p>
        <p className="error-text" role="alert">{error}</p>
      </section>
    );
  }

  if (!usage && loading) {
    return (
      <section className="card">
        <p className="eyebrow">Usage this month</p>
        <p className="status-line">Loading…</p>
      </section>
    );
  }

  const { totals, applicationLimit, recent } = usage;
  const pagination = usage.pagination || { page, limit: 5, totalItems: recent.length, totalPages: recent.length ? 1 : 0 };
  const totalPages = pagination.totalPages || 0;

  return (
    <section className="card" aria-live="polite">
      <p className="eyebrow">Usage this month</p>
      <h2>AI usage</h2>
      <ul className="detail-list">
        <TotalsRow label="Application key" totals={totals.application} />
        <TotalsRow label="Your key" totals={totals.user} />
        <li>
          <span>Application allowance left</span>
          <span>
            {formatNumber(applicationLimit.remainingTokens)} of {formatNumber(applicationLimit.monthlyTokenLimit)} tokens
          </span>
        </li>
      </ul>

      <div className="usage-activity-head">
        <h3 className="subheading">Recent activity</h3>
        {totalPages > 1 ? (
          <nav className="pagination" aria-label="Recent AI activity pages">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage((current) => current - 1)}
              disabled={loading || page <= 1}
            >
              Prev
            </button>
            <p>
              {page} / {totalPages}
            </p>
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setPage((current) => current + 1)}
              disabled={loading || page >= totalPages}
            >
              Next
            </button>
          </nav>
        ) : null}
      </div>
      {loading ? <p className="status-line">Loading activity…</p> : null}
      {!loading && recent.length === 0 ? (
        <p className="detail">
          {page === 1 ? "No AI activity yet. Run a connection test to try it." : "No AI activity on this page."}
        </p>
      ) : null}
      {recent.length > 0 ? (
        <ul className="usage-list">
          {recent.map((item) => (
            <UsageItem key={item.id} item={item} />
          ))}
        </ul>
      ) : null}
      <p className="detail">Costs are estimates. Your own key's usage is shown but not limited.</p>
    </section>
  );
}
