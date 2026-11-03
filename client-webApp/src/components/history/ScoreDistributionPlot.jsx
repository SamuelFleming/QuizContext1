const MARKS = [
  { key: "min", label: "Min" },
  { key: "max", label: "Max" },
  { key: "mean", label: "Mean" },
  { key: "last", label: "Last" },
];

function clampPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Math.min(100, Math.max(0, Number(value)));
}

function formatPercent(value) {
  const clamped = clampPercent(value);
  return clamped == null ? "—" : `${Math.round(clamped)}%`;
}

function captionFor(values) {
  if (MARKS.every(({ key }) => values[key] == null)) return "No score distribution.";
  return MARKS.map(({ key, label }) => `${label} ${formatPercent(values[key])}`).join(". ");
}

// Min | Max | Mean | Last on a 0–100 scale. Missing marks are omitted, not zeroed.
export default function ScoreDistributionPlot({ min, max, mean, last }) {
  const values = {
    min: clampPercent(min),
    max: clampPercent(max),
    mean: clampPercent(mean),
    last: clampPercent(last),
  };

  return (
    <figure className="score-distribution" aria-label="Score distribution">
      <div className="score-distribution-scale">
        <div className="score-distribution-track" />
        {MARKS.map(({ key, label }) =>
          values[key] == null ? null : (
            <span
              key={key}
              className={`score-distribution-marker ${key}`}
              style={{ left: `${values[key]}%` }}
              title={`${label} ${formatPercent(values[key])}`}
            />
          ),
        )}
      </div>
      <ul className="score-distribution-legend">
        {MARKS.map(({ key, label }) => (
          <li key={key}>
            <span>{label}</span>
            <strong>{formatPercent(values[key])}</strong>
          </li>
        ))}
      </ul>
      <figcaption className="visually-hidden">{captionFor(values)}</figcaption>
    </figure>
  );
}
