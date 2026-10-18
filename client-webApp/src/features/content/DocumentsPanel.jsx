import { useEffect, useRef, useState } from "react";
import MarkdownEditor from "../../components/markdown/MarkdownEditor.jsx";
import {
  createDocument,
  deleteDocument,
  extractDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from "../../services/documentService.js";

const TITLE_MAX = 200;
const CONTENT_MAX = 200000;
const ACCEPT = ".md,.markdown,.txt,.pdf,.docx,.pptx,.py,.ipynb";

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

// Documents attached to the selected subject (topicId null) or topic.
// guard wraps API calls so a 401 ends the session.
export default function DocumentsPanel({ subjectId, topicId, guard }) {
  const fileInput = useRef(null);
  const dialogRef = useRef(null);
  const [documents, setDocuments] = useState(null);
  const [view, setView] = useState({ mode: "list" });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const dialogOpen = view.mode === "open" || view.mode === "edit" || view.mode === "review";

  useEffect(() => {
    let active = true;
    guard(() => listDocuments(subjectId, topicId))
      .then((data) => active && setDocuments(data))
      .catch((err) => active && err.status !== 401 && setError(err.message));
    return () => {
      active = false;
    };
  }, [subjectId, topicId, guard]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    if (dialogOpen && !dialog.open) dialog.showModal();
    return undefined;
  }, [dialogOpen, view.mode]);

  function closeDialog() {
    setError("");
    setView({ mode: "list" });
    if (dialogRef.current?.open) dialogRef.current.close();
  }

  function handleDialogClose() {
    setError("");
    setView((current) => (current.mode === "list" ? current : { mode: "list" }));
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy("extract");
    setError("");
    try {
      const extracted = await guard(() => extractDocument(file));
      setView({ mode: "review", draft: extracted });
    } catch (err) {
      if (err.status !== 401) setError(err.message || "Could not read the file.");
    } finally {
      setBusy("");
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setBusy("save");
    setError("");
    try {
      const saved = await guard(() =>
        createDocument({ ...view.draft, subjectId, topicId: topicId ?? null }),
      );
      setDocuments((current) => [...(current || []), saved]);
      closeDialog();
    } catch (err) {
      if (err.status !== 401) setError(err.message || "Could not save the document.");
    } finally {
      setBusy("");
    }
  }

  async function openDocument(documentId) {
    setBusy("open");
    setError("");
    try {
      setView({ mode: "open", document: await guard(() => getDocument(documentId)) });
    } catch (err) {
      if (err.status !== 401) setError(err.message || "Could not open the document.");
    } finally {
      setBusy("");
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    setBusy("save");
    setError("");
    try {
      const { title, content } = view.draft;
      const updated = await guard(() => updateDocument(view.document.id, { title, content }));
      setDocuments((current) =>
        current.map((d) => (d.id === updated.id ? { ...d, title: updated.title } : d)),
      );
      setView({ mode: "open", document: updated });
    } catch (err) {
      if (err.status !== 401) setError(err.message || "Could not save the document.");
    } finally {
      setBusy("");
    }
  }

  async function handleDelete() {
    const doc = view.document;
    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    setBusy("delete");
    setError("");
    try {
      await guard(() => deleteDocument(doc.id));
      setDocuments((current) => current.filter((d) => d.id !== doc.id));
      closeDialog();
    } catch (err) {
      if (err.status !== 401) setError(err.message || "Could not delete the document.");
    } finally {
      setBusy("");
    }
  }

  const updateDraft = (changes) =>
    setView((current) => ({ ...current, draft: { ...current.draft, ...changes } }));

  const errorLine = error ? (
    <p className="error-text" role="alert">
      {error}
    </p>
  ) : null;

  let dialogBody = null;
  if (view.mode === "review" || view.mode === "edit") {
    const { draft } = view;
    const editing = view.mode === "edit";
    dialogBody = (
      <>
        <div className="dialog-head">
          <h2 id="document-dialog-title">{editing ? "Edit document" : "Review extracted text"}</h2>
          <button type="button" className="secondary" aria-label="Close document dialog" onClick={closeDialog}>
            Close
          </button>
        </div>
        <p className="usage-meta">
          {editing
            ? `From ${draft.originalFileName || "no file"}.`
            : `From ${draft.originalFileName} (${formatSize(draft.sizeBytes)}). Check and correct the text before saving; only this reviewed text is stored.`}
        </p>
        <form className="form" onSubmit={editing ? handleUpdate : handleSave} noValidate>
          <label className="field">
            <span>Title</span>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              maxLength={TITLE_MAX}
              required
            />
          </label>
          <MarkdownEditor
            label="Document text"
            value={draft.content}
            onChange={(content) => updateDraft({ content })}
            maxLength={CONTENT_MAX}
            rows={14}
          />
          {errorLine}
          <div className="button-row">
            <button type="submit" disabled={busy === "save"}>
              {busy === "save" ? "Saving…" : "Save document"}
            </button>
            <button
              type="button"
              className="link"
              onClick={() => {
                setError("");
                if (editing) setView({ mode: "open", document: view.document });
                else closeDialog();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </>
    );
  } else if (view.mode === "open") {
    const doc = view.document;
    dialogBody = (
      <>
        <div className="dialog-head">
          <h2 id="document-dialog-title">{doc.title}</h2>
          <button type="button" className="secondary" aria-label="Close document dialog" onClick={closeDialog}>
            Close
          </button>
        </div>
        <p className="usage-meta">
          {doc.originalFileName || "No file"} · {formatSize(doc.sizeBytes)} · Added{" "}
          {new Date(doc.createdAt).toLocaleDateString()}
        </p>
        <pre className="doc-text">{doc.content}</pre>
        {errorLine}
        <div className="button-row doc-actions">
          <button
            type="button"
            onClick={() =>
              setView({
                mode: "edit",
                document: doc,
                draft: {
                  title: doc.title,
                  content: doc.content,
                  originalFileName: doc.originalFileName,
                },
              })
            }
          >
            Edit document
          </button>
          <button
            type="button"
            className="link danger"
            onClick={handleDelete}
            disabled={busy === "delete"}
          >
            Delete document
          </button>
        </div>
      </>
    );
  }

  return (
    <section className="documents" aria-label="Documents">
      <div className="section-head">
        <h2>Documents</h2>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy === "extract"}
        >
          {busy === "extract" ? "Extracting…" : "Add document"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT}
          className="visually-hidden"
          aria-label="Choose a Markdown, text, PDF, Word, PowerPoint, Python, or notebook file"
          onChange={handleFile}
        />
      </div>
      <p className="usage-meta">
        Markdown, text, PDFs with selectable text, Word (.docx), PowerPoint (.pptx), Python (.py), or Jupyter
        (.ipynb), up to 25 MB.
      </p>
      {!dialogOpen ? errorLine : null}
      {documents === null ? (
        error && !dialogOpen ? null : <p className="status-line">Loading…</p>
      ) : documents.length === 0 ? (
        <p className="status-line">No documents here yet.</p>
      ) : (
        <ul className="item-list compact-item-list">
          {documents.map((doc) => (
            <li key={doc.id}>
              <button
                type="button"
                className="item-link"
                onClick={() => openDocument(doc.id)}
                disabled={busy === "open"}
              >
                <span className="usage-meta">
                  {doc.originalFileName || "No file"} · {formatSize(doc.sizeBytes)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        className="document-dialog"
        aria-labelledby="document-dialog-title"
        onClose={handleDialogClose}
      >
        {dialogBody}
      </dialog>
    </section>
  );
}
