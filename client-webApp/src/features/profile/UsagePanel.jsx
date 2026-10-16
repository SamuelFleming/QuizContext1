import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { getAiUsage } from "../../services/settingsService.js";

const formatCost = (value) => `$${(value ?? 0).toFixed(4)}`;
const formatNumber = (value) => (value ?? 0).toLocaleString();

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

export default function UsagePanel({ refreshKey }) {
  const { signOut: onUnauthorized } = useAuth();
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAiUsage()
      .then((next) => {
        if (cancelled) return;
        setUsage(next);
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
  }, [refreshKey, onUnauthorized]);

  if (error) {
    return (
      <section className="card">
        <p className="eyebrow">Usage this month</p>
        <p className="error-text" role="alert">{error}</p>
      </section>
    );
  }

  if (!usage) {
    return (
      <section className="card">
        <p className="eyebrow">Usage this month</p>
        <p className="status-line">Loading…</p>
      </section>
    );
  }

  const { totals, applicationLimit, recent } = usage;

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
      {recent.length === 0 ? (
        <p className="detail">No AI activity yet. Run a connection test to try it.</p>
      ) : (
        <ul className="usage-list">
          {recent.map((item) => (
            <li key={item.id}>
              <span>
                {item.operation} · {item.status === "succeeded" ? "OK" : item.errorCode || "Failed"}
              </span>
              <span className="usage-meta">
                {item.model || "—"} · {formatNumber((item.inputTokens ?? 0) + (item.outputTokens ?? 0))} tokens ·{" "}
                {item.estimatedCostUsd == null ? "—" : formatCost(item.estimatedCostUsd)} ·{" "}
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="detail">Costs are estimates. Your own key's usage is shown but not limited.</p>
    </section>
  );
}
