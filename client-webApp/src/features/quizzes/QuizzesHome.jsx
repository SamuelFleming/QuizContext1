import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { deleteQuiz, downloadQuiz, listQuizzes } from "../../services/quizService.js";
import { modeLabel } from "./contextNotice.js";

function resultLabel(quiz) {
  if (!quiz.latestResult) return "No evaluated attempt";
  return `${quiz.latestResult.score} / ${quiz.latestResult.maxScore}`;
}

export default function QuizzesHome({ navigate }) {
  const { signOut } = useAuth();
  const [quizzes, setQuizzes] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;
    listQuizzes()
      .then((data) => active && setQuizzes(data))
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) signOut();
        else setError(err.message || "Could not load quizzes.");
      });
    return () => {
      active = false;
    };
  }, [signOut]);

  async function handleDelete(quiz) {
    if (!window.confirm(`Delete "${quiz.title}" and its attempts? Your notes and documents stay.`)) return;
    setBusyId(quiz.id);
    setError("");
    try {
      await deleteQuiz(quiz.id);
      setQuizzes((current) => current.filter((item) => item.id !== quiz.id));
    } catch (err) {
      if (err.status === 401) signOut();
      else setError(err.message || "Could not delete the quiz.");
    } finally {
      setBusyId("");
    }
  }

  async function handleExport(quizId) {
    setBusyId(quizId);
    setError("");
    try {
      await downloadQuiz(quizId);
    } catch (err) {
      if (err.status === 401) signOut();
      else setError(err.message || "Could not export the quiz.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Quizzes</p>
          <h1>Quiz library</h1>
        </div>
        <button type="button" onClick={() => navigate("/quizzes/new")}>
          Generate quiz
        </button>
      </div>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      {quizzes === null ? (
        <p className="status-line">Loading…</p>
      ) : quizzes.length === 0 ? (
        <p className="status-line">No quizzes yet. Generate one from a subject or topic.</p>
      ) : (
        <ul className="item-list">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="library-item">
              <button type="button" className="item-link" onClick={() => navigate(`/quizzes/${quiz.id}`)}>
                <span>{quiz.title}</span>
                <span className="usage-meta">
                  {quiz.topicPath || quiz.subjectName} · {modeLabel(quiz.contextMode)} · {quiz.questionCount} questions ·{" "}
                  {quiz.attemptCount} attempts · {resultLabel(quiz)}
                </span>
              </button>
              <div className="button-row">
                <button type="button" className="secondary" onClick={() => handleExport(quiz.id)} disabled={busyId === quiz.id}>
                  Export
                </button>
                <button type="button" className="secondary" onClick={() => handleDelete(quiz)} disabled={busyId === quiz.id}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}