function clampPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Math.min(100, Math.max(0, Number(value)));
}

function formatPercent(value) {
  const clamped = clampPercent(value);
  return clamped == null ? null : `${Math.round(clamped)}%`;
}

// Average-score donut. Null value shows an empty ring, not a fake 0%.
export default function ScoreCompletionCircle({ value, label = "Average score" }) {
  const percent = clampPercent(value);
  const display = formatPercent(value) ?? "—";
  const caption =
    percent == null ? `${label}: no score` : `${label}: ${Math.round(percent)} percent`;

  return (
    <figure className="score-circle">
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle className="score-circle-track" cx="18" cy="18" r="15.5" pathLength="100" />
        {percent != null ? (
          <circle
            className="score-circle-progress"
            cx="18"
            cy="18"
            r="15.5"
            pathLength="100"
            strokeDasharray={`${percent} 100`}
          />
        ) : null}
      </svg>
      <span className="score-circle-value" aria-hidden="true">
        {display}
      </span>
      <figcaption className="visually-hidden">{caption}</figcaption>
    </figure>
  );
}
