const WIDTH = 240;
const HEIGHT = 88;
const PAD_X = 8;
const PAD_Y = 10;

function clampPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Math.min(100, Math.max(0, Number(value)));
}

function toPoints(series) {
  return series
    .map((value, index) => {
      const percent = clampPercent(value);
      if (percent == null) return null;
      const x =
        series.length === 1
          ? WIDTH / 2
          : PAD_X + (index / (series.length - 1)) * (WIDTH - PAD_X * 2);
      const y = PAD_Y + (1 - percent / 100) * (HEIGHT - PAD_Y * 2);
      return { x, y, percent };
    })
    .filter(Boolean);
}

function seriesCaption(series, n) {
  const windowLabel = n ? `Last ${n} attempt scores` : "Attempt scores";
  if (series.length === 0) return `No ${windowLabel.toLowerCase()}.`;
  const values = series.map((value) => {
    const percent = clampPercent(value);
    return percent == null ? "—" : `${Math.round(percent)}%`;
  });
  return `${windowLabel}: ${values.join(", ")}.`;
}

// Last-N percents as a simple line. n is the accessible window size, not a padded axis.
export default function AttemptSeriesChart({ series, n }) {
  const values = Array.isArray(series) ? series : [];
  const points = toPoints(values);
  const pointAttr = points.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <figure className="attempt-series">
      {points.length === 0 ? (
        <p className="status-line">No attempt scores yet.</p>
      ) : (
        <svg
          className="attempt-series-svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          aria-hidden="true"
        >
          <line className="attempt-series-baseline" x1={PAD_X} y1={HEIGHT - PAD_Y} x2={WIDTH - PAD_X} y2={HEIGHT - PAD_Y} />
          {points.length > 1 ? (
            <polyline
              className="attempt-series-line"
              pathLength="1"
              points={pointAttr}
            />
          ) : null}
          {points.map(({ x, y }, index) => (
            <circle
              key={`${x}-${y}-${index}`}
              className="attempt-series-point"
              cx={x}
              cy={y}
              r="3"
            />
          ))}
        </svg>
      )}
      <figcaption className="visually-hidden">{seriesCaption(values, n)}</figcaption>
    </figure>
  );
}
