function rowKey(item, index, getRowKey) {
  if (getRowKey) return getRowKey(item, index);
  return item?.attemptId ?? item?.id ?? index;
}

// Compact paginated list. Features own fetch; this only renders rows and pager events.
export default function PaginatingQueryList({
  items = [],
  pagination,
  onPageChange,
  onSelectRow,
  renderRow,
  getRowKey,
  heading,
  listLabel = "Results",
  paginationLabel = "Pages",
  loading = false,
  disabled = false,
  emptyMessage = "Nothing to show yet.",
  loadingMessage = "Loading…",
}) {
  const page = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 0;
  const showPager = totalPages > 1;
  const pagerLocked = loading || disabled;
  const rows = Array.isArray(items) ? items : [];

  const headingNode =
    heading == null || heading === ""
      ? null
      : typeof heading === "string"
        ? <h2>{heading}</h2>
        : heading;

  return (
    <section className="query-list" aria-label={listLabel}>
      {headingNode || showPager ? (
        <div className="section-head query-list-head">
          {headingNode}
          {showPager ? (
            <nav className="pagination" aria-label={paginationLabel}>
              <button
                type="button"
                aria-label="Previous page"
                onClick={() => onPageChange?.(page - 1)}
                disabled={pagerLocked || page <= 1}
              >
                Prev
              </button>
              <p>
                {page} / {totalPages}
              </p>
              <button
                type="button"
                aria-label="Next page"
                onClick={() => onPageChange?.(page + 1)}
                disabled={pagerLocked || page >= totalPages}
              >
                Next
              </button>
            </nav>
          ) : null}
        </div>
      ) : null}
      {loading ? (
        <p className="status-line">{loadingMessage}</p>
      ) : rows.length === 0 ? (
        <p className="status-line">{emptyMessage}</p>
      ) : (
        <ul className="item-list compact-item-list">
          {rows.map((item, index) => (
            <li key={rowKey(item, index, getRowKey)}>
              {onSelectRow ? (
                <button
                  type="button"
                  className="item-link"
                  onClick={() => onSelectRow(item)}
                >
                  {renderRow(item)}
                </button>
              ) : (
                <div className="query-list-row">{renderRow(item)}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
