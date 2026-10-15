import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { listAttempts, listQuizzes } from "../../services/quizService.js";
import { listSubjects } from "../../services/subjectService.js";
import StudyHistorySection from "./StudyHistorySection.jsx";

export default function Dashboard({ navigate }) {
  const { user, signOut } = useAuth();
  const [subjects, setSubjects] = useState(null);
  const [quizzes, setQuizzes] = useState(null);
  const [attempts, setAttempts] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    listSubjects()
      .then((data) => active && setSubjects(data))
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) {
          signOut();
          return;
        }
        setLoadError(err.message || "Could not load subjects.");
      });
    listQuizzes({ page: 1, limit: 5, sort: "newest" })
      .then((data) => active && setQuizzes(data.items))
      .catch((err) => {
        if (active && err.status === 401) signOut();
      });
    listAttempts(5)
      .then((data) => active && setAttempts(data))
      .catch((err) => {
        if (active && err.status === 401) signOut();
      });
    return () => {
      active = false;
    };
  }, [signOut]);

  return (
    <div className="stack">
      <section className="card">
        <p className="eyebrow">Dashboard</p>
        <h1>Welcome, {user.displayName}</h1>
        <p className="lede">Pick a subject to keep organising your study material, or generate a quiz.</p>
        <button type="button" onClick={() => navigate("/quizzes/new")}>
          Generate quiz
        </button>
      </section>
      <StudyHistorySection subjects={subjects} navigate={navigate} />
      <section className="card" aria-live="polite">
        <div className="section-head">
          <h2>Subjects</h2>
          <button type="button" onClick={() => navigate("/subjects")}>
            Create subject
          </button>
        </div>
        {loadError ? (
          <p className="error-text" role="alert">
            {loadError}
          </p>
        ) : subjects === null ? (
          <p className="status-line">Loading…</p>
        ) : subjects.length === 0 ? (
          <p className="status-line">No subjects yet.</p>
        ) : (
          <ul className="item-list">
            {subjects.map((subject) => (
              <li key={subject.id}>
                <button
                  type="button"
                  className="item-link"
                  onClick={() => navigate(`/subjects/${subject.id}`)}
                >
                  <span>{subject.name}</span>
                  <span className="usage-meta">
                    Updated {new Date(subject.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card">
        <div className="section-head">
          <h2>Recent quizzes</h2>
          <button type="button" className="link" onClick={() => navigate("/quizzes")}>
            Quiz library
          </button>
        </div>
        {quizzes === null ? (
          <p className="status-line">Loading…</p>
        ) : quizzes.length === 0 ? (
          <p className="status-line">No quizzes yet.</p>
        ) : (
          <ul className="item-list">
            {quizzes.map((quiz) => (
              <li key={quiz.id}>
                <button type="button" className="item-link" onClick={() => navigate(`/quizzes/${quiz.id}`)}>
                  <span>{quiz.title}</span>
                  <span className="usage-meta">{quiz.topicPath || quiz.subjectName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card">
        <h2>Recent attempts</h2>
        {attempts === null ? (
          <p className="status-line">Loading…</p>
        ) : attempts.length === 0 ? (
          <p className="status-line">No attempts yet.</p>
        ) : (
          <ul className="item-list">
            {attempts.map((attempt) => (
              <li key={attempt.id}>
                <button type="button" className="item-link" onClick={() => navigate(`/attempts/${attempt.id}`)}>
                  <span>{attempt.quizTitle}</span>
                  <span className="usage-meta">
                    {attempt.status.replaceAll("_", " ")}
                    {attempt.score === null ? "" : ` · ${attempt.score} / ${attempt.maxScore}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
