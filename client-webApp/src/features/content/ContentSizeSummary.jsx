function formatChars(value) {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return n.toLocaleString();
}

// Compact size line under the detail header (own vs with-subtopics when a subtree exists).
export default function ContentSizeSummary({ ownContentChars, subtreeContentChars, hasSubtree }) {
  const own = formatChars(ownContentChars);
  const subtree = formatChars(subtreeContentChars);

  return (
    <p className="content-size-summary usage-meta">
      {hasSubtree ? `${own} own · ${subtree} with subtopics` : `${own} characters`}
    </p>
  );
}
