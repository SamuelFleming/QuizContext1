import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import {
  downloadQuiz,
  getQuiz,
  listQuizAttempts,
  renameQuiz,
  startAttempt,
} from "../../services/quizService.js";
import ContextNotice from "./ContextNotice.jsx";
import { modeLabel } from "./contextNotice.js";

export default function QuizDetailPage({ quizId, navigate }) {
  const { signOut } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const [attempts, setAttempts] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    let active = true;
    getQuiz(quizId)
      .then((data) => {
        if (active) setQuiz(data);
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) signOut();
        else setError(err.status === 404 ? "Quiz not found." : err.message || "Could not load the quiz.");
      });
    return () => {
      active = false;
    };
  }, [quizId, signOut]);

  useEffect(() => {
    let active = true;
    listQuizAttempts(quizId)
      .then((data) => active && setAttempts(data))
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) signOut();
      });
    return () => {
      active = false;
    };
  }, [quizId, signOut]);

  if (error) {
    return (
      <section className="card">
        <p className="error-text" role="alert">
          {error}
        </p>
        <button type="button" className="link" onClick={() => navigate("/quizzes")}>
          Back to quizzes
        </button>
      </section>
    );
  }

  if (!quiz) {
    return (
      <section className="card">
        <p className="status-line">Loading…</p>
      </section>
    );
  }

  async function handleExport() {
    setExporting(true);
    setStartError("");
    try {
      await downloadQuiz(quiz.id);
    } catch (err) {
      if (err.status === 401) signOut();
      else setStartError(err.message || "Could not export the quiz.");
    } finally {
      setExporting(false);
    }
  }

  function startRename() {
    setTitleDraft(quiz.title);
    setTitleError("");
    setEditingTitle(true);
  }

  async function saveTitle(event) {
    event.preventDefault();
    const title = titleDraft.trim();
    if (!title || title.length > 120) {
      setTitleError("Use 1 to 120 characters.");
      return;
    }
    setSavingTitle(true);
    setTitleError("");
    try {
      const updated = await renameQuiz(quiz.id, title);
      setQuiz(updated);
      setEditingTitle(false);
    } catch (err) {
      if (err.status === 401) signOut();
      else setTitleError(err.message || "Could not rename the quiz.");
    } finally {
      setSavingTitle(false);
    }
  }

  async function handleStart() {
    setStarting(true);
    setStartError("");
    try {
      const result = await startAttempt(quiz.id);
      navigate(`/attempts/${result.attempt.id}`);
    } catch (err) {
      if (err.status === 401) signOut();
      else setStartError(err.message || "Could not start the attempt.");
    } finally {
      setStarting(false);
    }
  }

  const scope = quiz.topicPath || quiz.subjectName;

  return (
    <div className="stack">
      <section className="card">
        <p className="eyebrow">Saved quiz</p>
        {editingTitle ? (
          <form className="stack" onSubmit={saveTitle}>
            <label className="field">
              <span>Quiz title</span>
              <input
                type="text"
                value={titleDraft}
                maxLength={120}
                onChange={(event) => setTitleDraft(event.target.value)}
                disabled={savingTitle}
                required
              />
            </label>
            {titleError ? (
              <p className="error-text" role="alert">
                {titleError}
              </p>
            ) : null}
            <div className="button-row">
              <button type="submit" disabled={savingTitle}>
                {savingTitle ? "Saving…" : "Save title"}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setEditingTitle(false)}
                disabled={savingTitle}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1>{quiz.title}</h1>
            <button type="button" className="link" onClick={startRename}>
              Rename
            </button>
          </>
        )}
        <p className="lede">{scope}</p>
        <ul className="meta-list">
          <li>Mode: {modeLabel(quiz.contextMode)}</li>
          <li>Difficulty: {quiz.difficulty}</li>
          <li>
            {quiz.multipleChoiceCount} multiple choice, {quiz.shortAnswerCount} short answer
          </li>
          <li>Created {new Date(quiz.createdAt).toLocaleString()}</li>
        </ul>
        <ContextNotice context={quiz.context} />
        {startError ? (
          <p className="error-text" role="alert">
            {startError}
          </p>
        ) : null}
        <div className="button-row">
          <button type="button" onClick={handleStart} disabled={starting}>
            {starting ? "Starting…" : "Start attempt"}
          </button>
          <button type="button" className="secondary" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting…" : "Export"}
          </button>
          <button type="button" className="link" onClick={() => navigate("/quizzes")}>
            Back to quizzes
          </button>
        </div>
      </section>
      <section className="card">
        <h2>Attempts</h2>
        {attempts === null ? (
          <p className="status-line">Loading…</p>
        ) : attempts.length === 0 ? (
          <p className="status-line">No attempts yet.</p>
        ) : (
          <ul className="item-list">
            {attempts.map((attempt) => (
              <li key={attempt.id}>
                <button type="button" className="item-link" onClick={() => navigate(`/attempts/${attempt.id}`)}>
                  <span>{attempt.status === "in_progress" ? "Resume" : "View results"}</span>
                  <span className="usage-meta">
                    {attempt.status.replaceAll("_", " ")}
                    {attempt.score === null ? "" : ` · ${attempt.score} / ${attempt.maxScore}`}
                    {" · "}
                    {new Date(attempt.startedAt).toLocaleString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card">
        <h2>Questions</h2>
        <ol className="question-list">
          {quiz.questions.map((question, index) => (
            <li key={question.id}>
              <p>
                <span className="usage-meta">
                  {question.type === "multiple_choice" ? "Multiple choice" : "Short answer"}
                </span>
                <br />
                {index + 1}. {question.prompt}
              </p>
              {question.options ? (
                <ul>
                  {question.options.map((option) => (
                    <li key={option}>{option}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
