export default function ContextNotice({ context }) {
  if (!context) return null;
  const used = (context.manifest || []).filter((entry) => entry.status !== "excluded").length;
  const partial = (context.manifest || []).filter((entry) => entry.status !== "included");
  return (
    <div className="suggestion-context">
      <p className="usage-meta">
        Based on {used} source{used === 1 ? "" : "s"}.
      </p>
      {context.truncated ? (
        <div className="warning-text" role="status">
          <p>Not all of the selected material fit. These sources were cut short or left out:</p>
          <ul>
            {partial.map((entry) => (
              <li key={`${entry.type}:${entry.id || entry.title}`}>
                {entry.title} ({entry.status === "truncated" ? "partly included" : "left out"})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
