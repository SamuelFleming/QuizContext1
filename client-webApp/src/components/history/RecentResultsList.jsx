import PaginatingQueryList from "./PaginatingQueryList.jsx";

const formatDate = (value) => new Date(value).toLocaleDateString();

function renderRecentResultRow(result) {
  return (
    <>
      <span>{result.title}</span>
      <span className="usage-meta">{result.topicPath || result.subjectName}</span>
      <span className="usage-meta">
        {formatDate(result.submittedAt)} · {result.score} / {result.maxScore} ({result.percent}%)
      </span>
    </>
  );
}

// Presentational latest-per-quiz rows. Features own fetch and navigation.
export default function RecentResultsList({
  items,
  pagination,
  onPageChange,
  onSelectRow,
  loading = false,
  emptyMessage = "No evaluated results in this filter.",
}) {
  return (
    <PaginatingQueryList
      heading={<h3 className="subheading">Recent results</h3>}
      listLabel="Recent results"
      paginationLabel="Recent result pages"
      items={items}
      pagination={pagination}
      loading={loading}
      onPageChange={onPageChange}
      onSelectRow={onSelectRow}
      getRowKey={(item) => item.attemptId}
      emptyMessage={emptyMessage}
      renderRow={renderRecentResultRow}
    />
  );
}
