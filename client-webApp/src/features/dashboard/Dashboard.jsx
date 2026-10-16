import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { listSubjects } from "../../services/subjectService.js";

export default function Dashboard({ navigate }) {
  const { user, signOut } = useAuth();
  const [subjects, setSubjects] = useState(null);
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
    return () => {
      active = false;
    };
  }, [signOut]);

  return (
    <div className="stack">
      <section className="card">
        <p className="eyebrow">Dashboard</p>
        <h1>Welcome, {user.displayName}</h1>
        <p className="lede">Pick a subject to keep organising your study material.</p>
      </section>
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
    </div>
  );
}
