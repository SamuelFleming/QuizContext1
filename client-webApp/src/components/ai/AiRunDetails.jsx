import { aiFailureLabel } from "../../utils/aiFailures.js";

const formatAiMetric = (value) => (value == null ? "—" : value.toLocaleString());
const formatCost = (value) => (value == null ? "—" : `$${value.toFixed(4)}`);

function ValidationDetails({ run }) {
  const failures = Array.isArray(run.failures) ? run.failures : [];
  if (failures.length > 0) {
    return (
      <ul className="failure-list">
        {failures.map((failure) => (
          <li key={failure}>{aiFailureLabel(failure)}</li>
        ))}
      </ul>
    );
  }
  return run.status === "succeeded" ? (
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
              <span className="usage-meta">{formatAiMetric(entry.chars)} characters</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="usage-detail-text">No source manifest recorded for this operation.</p>
      )}
    </>
  );
}

export default function AiRunDetails({ run }) {
  if (!run) return null;
  return (
    <div className="usage-details">
      <section>
        <h4>Run</h4>
        <dl className="usage-facts">
          <div>
            <dt>Operation</dt>
            <dd>{run.operation || "—"}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{run.status === "succeeded" ? "Succeeded" : run.errorCode || "Failed"}</dd>
          </div>
          <div>
            <dt>Access</dt>
            <dd>{run.providerMode || "—"}</dd>
          </div>
          <div>
            <dt>Model</dt>
            <dd>{run.model || "—"}</dd>
          </div>
          <div>
            <dt>Input</dt>
            <dd>{formatAiMetric(run.inputTokens)} tokens</dd>
          </div>
          <div>
            <dt>Output</dt>
            <dd>{formatAiMetric(run.outputTokens)} tokens</dd>
          </div>
          <div>
            <dt>Input characters</dt>
            <dd>{formatAiMetric(run.inputChars)}</dd>
          </div>
          <div>
            <dt>Latency</dt>
            <dd>{run.latencyMs == null ? "—" : `${formatAiMetric(run.latencyMs)} ms`}</dd>
          </div>
          <div>
            <dt>Estimated cost</dt>
            <dd>{formatCost(run.estimatedCostUsd)}</dd>
          </div>
        </dl>
      </section>
      <section>
        <h4>Validation</h4>
        <ValidationDetails run={run} />
      </section>
      <section>
        <h4>Limits</h4>
        <dl className="usage-facts">
          <div>
            <dt>Maximum output tokens</dt>
            <dd>{formatAiMetric(run.maxOutputTokens)}</dd>
          </div>
        </dl>
      </section>
      <section>
        <h4>Scope</h4>
        <ScopeDetails scope={run.scope} />
      </section>
    </div>
  );
}
