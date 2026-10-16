import { useEffect, useState } from "react";
import MarkdownEditor from "../../components/markdown/MarkdownEditor.jsx";
import { suggestDescription } from "../../services/aiService.js";

const DESCRIPTION_MAX = 2000;
const PROFILE_CODES = new Set(["AI_KEY_MISSING", "AI_LIMIT_REACHED", "AI_DISABLED", "AI_AUTH_FAILED"]);

function errorText(err) {
  if (err.code === "CONTEXT_INSUFFICIENT") {
    return "There isn't enough content to describe yet. Add notes or a document first.";
  }
  return err.message || "Could not get a suggestion.";
}

function ContextNotice({ context }) {
  const used = context.manifest.filter((entry) => entry.status !== "excluded").length;
  const partial = context.manifest.filter((entry) => entry.status !== "included");
  return (
    <div className="suggestion-context">
      <p className="usage-meta">
        Based on {used} source{used === 1 ? "" : "s"}.
      </p>
      {context.truncated ? (
        <div className="warning-text" role="status">
          <p>Not all of the selected material fit. These sources were cut short or left out:</p>
          <ul>
            {partial.map((entry) => (
              <li key={`${entry.type}:${entry.id}`}>
                {entry.title} ({entry.status === "truncated" ? "partly included" : "left out"})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// Requests a suggested description, lets the user edit it, and hands it to onAccept.
// Nothing is saved unless the user accepts.
export default function DescriptionSuggestion({
  subjectId,
  topicId,
  hasSubtopics,
  onAccept,
  onPendingChange,
  onOpenProfile,
}) {
  const [includeSubtopics, setIncludeSubtopics] = useState(true);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [text, setText] = useState("");

  useEffect(() => {
    onPendingChange?.(Boolean(suggestion));
  }, [suggestion, onPendingChange]);

  async function handleRequest() {
    setLoading(true);
    setError(null);
    try {
      const result = await suggestDescription({
        subjectId,
        topicId,
        includeDescendants: topicId ? includeSubtopics : true,
      });
      setSuggestion(result);
      setText(result.description);
    } catch (err) {
      if (err.status !== 401) setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      await onAccept(text);
      setSuggestion(null);
      setText("");
    } catch (err) {
      if (err.status !== 401) setError(err);
    } finally {
      setAccepting(false);
    }
  }

  function handleDiscard() {
    setSuggestion(null);
    setText("");
    setError(null);
  }

  const over = text.length > DESCRIPTION_MAX;

  return (
    <div className="suggestion">
      {!suggestion ? (
        <div className="suggestion-request">
          <button type="button" className="secondary" onClick={handleRequest} disabled={loading}>
            {loading ? "Suggesting…" : "Suggest description"}
          </button>
          {topicId && hasSubtopics ? (
            <label className="suggestion-toggle">
              <input
                type="checkbox"
                checked={includeSubtopics}
                onChange={(e) => setIncludeSubtopics(e.target.checked)}
                disabled={loading}
              />
              Include subtopics
            </label>
          ) : null}
        </div>
      ) : (
        <div className="suggestion-review">
          <p className="eyebrow">Suggested description</p>
          <ContextNotice context={suggestion.context} />
          <MarkdownEditor
            label="Review suggestion"
            value={text}
            onChange={setText}
            maxLength={DESCRIPTION_MAX}
            rows={4}
          />
          <p className="hint">AI-generated from your own notes and documents. Check it before saving.</p>
          <div className="button-row">
            <button type="button" onClick={handleAccept} disabled={accepting || over || !text.trim()}>
              {accepting ? "Saving…" : "Accept and save"}
            </button>
            <button type="button" className="link" onClick={handleDiscard} disabled={accepting}>
              Discard
            </button>
          </div>
        </div>
      )}
      {error ? (
        <p className="error-text" role="alert">
          {errorText(error)}{" "}
          {PROFILE_CODES.has(error.code) && onOpenProfile ? (
            <button type="button" className="link" onClick={onOpenProfile}>
              Open Profile
            </button>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
