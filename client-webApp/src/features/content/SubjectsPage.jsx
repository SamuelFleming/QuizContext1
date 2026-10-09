import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { createSubject, deleteSubject, listSubjects } from "../../services/subjectService.js";

export default function SubjectsPage({ navigate }) {
  const { signOut } = useAuth();
  const [subjects, setSubjects] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

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

  async function handleCreate(event) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const created = await createSubject({ name });
      setSubjects((current) => [created, ...(current || [])]);
      setName("");
      setStatus("idle");
    } catch (err) {
      if (err.status === 401) {
        signOut();
        return;
      }
      setStatus("error");
      setMessage(err.message || "Could not create the subject.");
    }
  }

  async function handleDelete(subject) {
    const confirmed = window.confirm(
      `Delete "${subject.name}"? Its topics and documents are deleted too. This cannot be undone.`,
    );
    if (!confirmed) return;
    try {
      await deleteSubject(subject.id);
      setSubjects((current) => current.filter((s) => s.id !== subject.id));
    } catch (err) {
      if (err.status === 401) {
        signOut();
        return;
      }
      setStatus("error");
      setMessage(err.message || "Could not delete the subject.");
    }
  }

  return (
    <section className="card" aria-live="polite">
      <p className="eyebrow">Subjects</p>
      <h1>Your subjects</h1>
      <form className="inline-form" onSubmit={handleCreate} noValidate>
        <label className="field grow">
          <span>New subject name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            required
          />
        </label>
        <button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Creating…" : "Create subject"}
        </button>
      </form>
      {message ? (
        <p className="error-text" role="alert">
          {message}
        </p>
      ) : null}

      {loadError ? (
        <p className="error-text" role="alert">
          {loadError}
        </p>
      ) : subjects === null ? (
        <p className="status-line">Loading…</p>
      ) : subjects.length === 0 ? (
        <p className="status-line">No subjects yet. Create one to start organising your material.</p>
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
              <button type="button" className="link danger" onClick={() => handleDelete(subject)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
