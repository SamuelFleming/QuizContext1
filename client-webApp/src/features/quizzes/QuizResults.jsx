import { useState } from "react";
import MarkdownPreview from "../../components/markdown/MarkdownPreview.jsx";
import { startAttempt } from "../../services/quizService.js";

const RESULT_LABEL = {
  correct: "Correct",
  partial: "Partial",
  incorrect: "Incorrect",
};

function learnerText(row) {
  if (row.type === "multiple_choice") {
    const selected = row.response?.selectedOptionIndex;
    if (!Number.isInteger(selected)) return "No answer was submitted.";
    return row.options?.[selected] || "No answer was submitted.";
  }
  return row.response?.text || "";
}

export default function QuizResults({ payload, navigate }) {
  const { attempt, quiz } = payload;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { evaluation, results } = attempt;

  async function tryAgain() {
    setBusy(true);
    setError("");
    try {
      const next = await startAttempt(quiz.id);
      navigate(`/attempts/${next.attempt.id}`);
    } catch (err) {
      setError(err.message || "Could not start another attempt.");
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <p className="eyebrow">Results</p>
      <h1>{quiz.title}</h1>
      <p className="score-line">
        {evaluation.score} / {evaluation.maxScore} ({evaluation.percent}%)
      </p>
      <p>{evaluation.summary}</p>
      <p className="usage-meta">This feedback is AI-assisted study help, not official grading.</p>
      <ol className="result-list">
        {results.map((row, position) => (
          <li key={row.questionId}>
            <div className="result-head">
              <h2>Question {position + 1}</h2>
              <span className={`result-badge ${row.result}`}>{RESULT_LABEL[row.result] || row.result}</span>
            </div>
            <p>{row.prompt}</p>
            <h3 className="subheading">Your answer</h3>
            {row.type === "multiple_choice" ? (
              <p>{learnerText(row)}</p>
            ) : (
              <MarkdownPreview source={learnerText(row)} emptyText="No answer was submitted." />
            )}
            <h3 className="subheading">{row.type === "multiple_choice" ? "Correct option" : "Expected answer"}</h3>
            <p>{row.type === "multiple_choice" ? row.correctOption : row.expectedAnswer}</p>
            {row.type === "short_answer" && row.markingCriteria?.length ? (
              <>
                <h3 className="subheading">Marking criteria</h3>
                <ul className="meta-list">
                  {row.markingCriteria.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
            <h3 className="subheading">Feedback</h3>
            <MarkdownPreview source={row.explanation} emptyText="No feedback was returned." />
            {row.missingConcepts?.length ? (
              <>
                <h3 className="subheading">Missing concepts</h3>
                <ul className="meta-list">
                  {row.missingConcepts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {row.sources?.length ? (
              <p className="usage-meta">Sources: {row.sources.map((source) => source.title).join(", ")}</p>
            ) : null}
          </li>
        ))}
      </ol>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      <div className="button-row">
        <button type="button" className="secondary" onClick={() => navigate(`/quizzes/${quiz.id}`)} disabled={busy}>
          Back to quiz
        </button>
        <button type="button" onClick={tryAgain} disabled={busy}>
          {busy ? "Starting…" : "Try again"}
        </button>
      </div>
    </section>
  );
}
