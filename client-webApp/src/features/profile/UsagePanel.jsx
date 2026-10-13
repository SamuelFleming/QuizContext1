import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { getAiUsage } from "../../services/settingsService.js";
import { aiFailureLabel } from "../../utils/aiFailures.js";

const formatCost = (value) => `$${(value ?? 0).toFixed(4)}`;
const formatNumber = (value) => (value ?? 0).toLocaleString();
const formatMetric = (value) => (value == null ? "—" : value.toLocaleString());

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

function ValidationDetails({ item }) {
  const failures = Array.isArray(item.failures) ? item.failures : [];
  if (failures.length > 0) {
    return (
      <ul className="failure-list">
        {failures.map((failure) => (
          <li key={failure}>{aiFailureLabel(failure)}</li>
        ))}
      </ul>
    );
  }
  return item.status === "succeeded" ? (
    <p className="usage-detail-text">The call passed validation.</p>
  ) : (
    <p className="usage-detail-text">No validation failure code was recorded.</p>
  );
}

function ScopeDetails({ scope }) {
  const manifest = Array.isArray(scope?.manifest) ? scope.manifest : [];
  return (
    <>
      <dl className="usage-facts">
        <div>
          <dt>Selection</dt>
          <dd>{scope?.selectionName || "—"}</dd>
        </div>
      </dl>
      {manifest.length > 0 ? (
        <ul className="manifest-list">
          {manifest.map((entry, index) => (
            <li key={`${entry.type || "source"}-${entry.id || index}`}>
              <div className="manifest-head">
                <strong>{entry.title || "Untitled source"}</strong>
                <span className={`manifest-status ${entry.status || ""}`}>
                  {entry.status || "unknown"}
                </span>
              </div>
              <span className="manifest-path">{entry.path || "Path unavailable"}</span>
              <span className="usage-meta">{formatMetric(entry.chars)} characters</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="usage-detail-text">No source manifest recorded for this operation.</p>
      )}
    </>
  );
}

function UsageItem({ item }) {
  const statusText = item.status === "succeeded" ? "OK" : item.errorCode || "Failed";
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
              {item.model || "Model unavailable"} · Input {formatMetric(item.inputTokens)} tokens · Output{" "}
              {formatMetric(item.outputTokens)} tokens
              {item.inputChars == null ? "" : ` · ${formatMetric(item.inputChars)} input characters`} · Cost{" "}
              {item.estimatedCostUsd == null ? "—" : formatCost(item.estimatedCostUsd)} ·{" "}
              {formatTime(item.createdAt)}
            </span>
          </span>
        </summary>
        <div className="usage-details">
          <section>
            <h4>Validation</h4>
            <ValidationDetails item={item} />
          </section>
          <section>
            <h4>Limits</h4>
            <dl className="usage-facts">
              <div>
                <dt>Maximum output tokens</dt>
                <dd>{formatMetric(item.maxOutputTokens)}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h4>Scope</h4>
            <ScopeDetails scope={item.scope} />
          </section>
        </div>
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

      <h3 className="subheading">Recent activity</h3>
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
      {totalPages > 1 ? (
        <nav className="pagination" aria-label="Recent AI activity pages">
          <button type="button" onClick={() => setPage((current) => current - 1)} disabled={loading || page <= 1}>
            Previous
          </button>
          <p>
            Page {page} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={loading || page >= totalPages}
          >
            Next
          </button>
        </nav>
      ) : null}
      <p className="detail">Costs are estimates. Your own key's usage is shown but not limited.</p>
    </section>
  );
}
