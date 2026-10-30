const formatDate = (value) => new Date(value).toLocaleDateString();

export default function HistoryCounts({ counts, lastStudiedAt }) {
  return (
    <ul className="history-counts">
      <li>
        <span>Quizzes saved</span>
        <strong>{counts?.quizzesSaved ?? 0}</strong>
      </li>
      <li>
        <span>Quizzes attempted</span>
        <strong>{counts?.quizzesAttempted ?? 0}</strong>
      </li>
      <li>
        <span>Evaluated attempts</span>
        <strong>{counts?.evaluatedAttempts ?? 0}</strong>
      </li>
      <li>
        <span>Last studied</span>
        <strong>{lastStudiedAt ? formatDate(lastStudiedAt) : "No evaluated attempt yet"}</strong>
      </li>
    </ul>
  );
}
