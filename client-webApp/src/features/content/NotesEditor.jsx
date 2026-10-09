import { useEffect, useState } from "react";
import MarkdownEditor from "../../components/markdown/MarkdownEditor.jsx";

const DESCRIPTION_MAX = 2000;
const NOTES_MAX = 50000;

// Description and notes for the selected subject or topic, saved together.
export default function NotesEditor({ node, onSave, onDirtyChange }) {
  const [description, setDescription] = useState(node.description || "");
  const [notes, setNotes] = useState(node.notes || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const dirty = description !== (node.description || "") || notes !== (node.notes || "");

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await onSave({ description, notes });
      setMessage({ type: "success", text: "Notes saved." });
    } catch (err) {
      if (err.status !== 401) {
        setMessage({ type: "error", text: err.message || "Could not save the notes." });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="notes-form" onSubmit={handleSubmit} noValidate>
      <MarkdownEditor
        label="Description"
        value={description}
        onChange={setDescription}
        maxLength={DESCRIPTION_MAX}
        rows={3}
      />
      <MarkdownEditor
        label="Notes"
        value={notes}
        onChange={setNotes}
        maxLength={NOTES_MAX}
        rows={12}
      />
      {message.text ? (
        <p
          className={message.type === "error" ? "error-text" : "success-text"}
          role={message.type === "error" ? "alert" : "status"}
        >
          {message.text}
        </p>
      ) : null}
      <div className="button-row">
        <button type="submit" disabled={saving || !dirty}>
          {saving ? "Saving…" : "Save notes"}
        </button>
        {dirty ? <span className="usage-meta">Unsaved changes</span> : null}
      </div>
    </form>
  );
}
