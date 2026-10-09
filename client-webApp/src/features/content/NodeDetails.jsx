import { useState } from "react";
import NotesEditor from "./NotesEditor.jsx";

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
  onRename,
  onSaveNotes,
  onDirtyChange,
  onAddTopic,
  onDelete,
  suggestionScope,
  onOpenProfile,
  children,
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

  function handleAdd(event) {
    event.preventDefault();
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

  return (
    <section className="detail-panel" aria-live="polite">
      <p className="eyebrow">{kind === "subject" ? "Subject" : "Topic"}</p>
      <h1>{node.name}</h1>

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
      />

      {children}

      <form className="inline-form" onSubmit={handleAdd} noValidate>
        <label className="field grow">
          <span>{kind === "subject" ? "New topic" : "New nested topic"}</span>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            maxLength={120}
            required
          />
        </label>
        <button type="submit" disabled={busy === "add"}>
          {busy === "add" ? "Adding…" : "Add topic"}
        </button>
      </form>
      <Feedback message={message} source="add" />

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
