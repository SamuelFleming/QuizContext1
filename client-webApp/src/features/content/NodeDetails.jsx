import { useState } from "react";
import ContentSizeSummary from "./ContentSizeSummary.jsx";
import NotesEditor from "./NotesEditor.jsx";
import ScopeStudySummary from "./ScopeStudySummary.jsx";

function Feedback({ message, source }) {
  if (!message.text || message.source !== source) return null;
  return (
    <p
      className={message.type === "error" ? "error-text" : "success-text"}
      role={message.type === "error" ? "alert" : "status"}
    >
      {message.text}
    </p>
  );
}

// Detail panel for the selected subject or topic: rename, notes, add a child topic, delete.
export default function NodeDetails({
  kind,
  node,
  descendantCount,
  subjectId,
  topicId,
  navigate,
  onRename,
  onSaveNotes,
  onDirtyChange,
  onAddTopic,
  onDelete,
  suggestionScope,
  onOpenProfile,
  onGenerateQuiz,
}) {
  const [name, setName] = useState(node.name);
  const [childName, setChildName] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState({ type: "", text: "", source: "" });

  async function run(source, fn, successText) {
    setBusy(source);
    setMessage({ type: "", text: "", source: "" });
    try {
      await fn();
      if (successText) setMessage({ type: "success", text: successText, source });
    } catch (err) {
      if (err.status !== 401) {
        setMessage({ type: "error", text: err.message || "Something went wrong.", source });
      }
    } finally {
      setBusy("");
    }
  }

  function handleRename(event) {
    event.preventDefault();
    run("rename", () => onRename(name), "Name saved.");
  }

  function handleAdd() {
    if (!childName.trim()) return;
    run("add", async () => {
      await onAddTopic(childName);
      setChildName("");
    });
  }

  function handleDelete() {
    const extra = descendantCount
      ? ` and its ${descendantCount} nested topic${descendantCount === 1 ? "" : "s"}`
      : "";
    const what = kind === "subject" ? "this subject, its topics," : `this topic${extra}`;
    if (!window.confirm(`Delete ${what} and attached documents? This cannot be undone.`)) return;
    run("delete", onDelete);
  }

  const subtopicLabel =
    descendantCount === 1 ? "1 nested topic" : `${descendantCount} nested topics`;

  return (
    <section className="detail-panel" aria-live="polite">
      <p className="eyebrow">{kind === "subject" ? "Subject" : "Topic"}</p>
      <h1>{node.name}</h1>
      <ContentSizeSummary
        ownContentChars={node.ownContentChars}
        subtreeContentChars={node.subtreeContentChars}
        hasSubtree={descendantCount > 0}
      />

      <form className="inline-form" onSubmit={handleRename} noValidate>
        <label className="field grow">
          <span>{kind === "subject" ? "Subject name" : "Topic name"}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            required
          />
        </label>
        <button type="submit" disabled={busy === "rename"}>
          {busy === "rename" ? "Saving…" : "Rename"}
        </button>
      </form>
      <Feedback message={message} source="rename" />

      <NotesEditor
        node={node}
        onSave={onSaveNotes}
        onDirtyChange={onDirtyChange}
        suggestionScope={suggestionScope}
        onOpenProfile={onOpenProfile}
        midContent={
          <section className="subtopics-block" aria-label="Subtopics">
            <div className="section-head">
              <h2>Subtopics</h2>
              <p className="usage-meta">{subtopicLabel}</p>
            </div>
            <div className="inline-form">
              <label className="field grow">
                <span>{kind === "subject" ? "New topic" : "New nested topic"}</span>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  maxLength={120}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAdd();
                    }
                  }}
                />
              </label>
              <button type="button" disabled={busy === "add" || !childName.trim()} onClick={handleAdd}>
                {busy === "add" ? "Adding…" : "Add topic"}
              </button>
            </div>
            <Feedback message={message} source="add" />
          </section>
        }
        extraActions={
          onGenerateQuiz ? (
            <button type="button" className="secondary" onClick={onGenerateQuiz}>
              Generate quiz
            </button>
          ) : null
        }
      />

      <section className="quiz-history-scaffold" aria-label="Study history">
        <ScopeStudySummary
          key={topicId || `subject:${subjectId}`}
          subjectId={subjectId}
          topicId={topicId}
          navigate={navigate}
        />
      </section>

      <div className="danger-row">
        <button
          type="button"
          className="link danger"
          onClick={handleDelete}
          disabled={busy === "delete"}
        >
          {kind === "subject" ? "Delete subject" : "Delete topic"}
        </button>
        <Feedback message={message} source="delete" />
      </div>
    </section>
  );
}
