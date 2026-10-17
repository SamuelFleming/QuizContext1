import { useEffect } from "react";
import MarkdownEditor from "../../components/markdown/MarkdownEditor.jsx";
import { suggestDescription } from "../../services/aiService.js";

const DESCRIPTION_MAX = 2000;
const PROFILE_CODES = new Set(["AI_KEY_MISSING", "AI_LIMIT_REACHED", "AI_DISABLED", "AI_AUTH_FAILED"]);

export const initialSuggestionState = {
  includeSubtopics: true,
  loading: false,
  accepting: false,
  error: null,
  suggestion: null,
  text: "",
};

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

function SparkleIcon() {
  return (
    <svg className="suggest-icon" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 1.2l1.1 3.4L12.5 5.7l-3.4 1.1L8 10.2 6.9 6.8 3.5 5.7l3.4-1.1L8 1.2zm5.2 7.3l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1zM3.5 10.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z"
      />
    </svg>
  );
}

// Requests a suggested description, lets the user edit it, and hands it to onAccept.
// Nothing is saved unless the user accepts.
// State is owned by the parent so the icon trigger and review panel can share it.
export default function DescriptionSuggestion({
  subjectId,
  topicId,
  hasSubtopics,
  onAccept,
  onPendingChange,
  onOpenProfile,
  shared,
  triggerOnly = false,
  panelOnly = false,
}) {
  const [state, setState] = shared;
  const { includeSubtopics, loading, accepting, error, suggestion, text } = state;

  function patch(partial) {
    setState((current) => ({ ...current, ...partial }));
  }

  useEffect(() => {
    onPendingChange?.(Boolean(suggestion));
  }, [suggestion, onPendingChange]);

  async function handleRequest() {
    patch({ loading: true, error: null });
    try {
      const result = await suggestDescription({
        subjectId,
        topicId,
        includeDescendants: topicId ? includeSubtopics : true,
      });
      patch({ suggestion: result, text: result.description, loading: false });
    } catch (err) {
      if (err.status !== 401) patch({ error: err, loading: false });
      else patch({ loading: false });
    }
  }

  async function handleAccept() {
    patch({ accepting: true, error: null });
    try {
      await onAccept(text);
      patch({ suggestion: null, text: "", accepting: false });
    } catch (err) {
      if (err.status !== 401) patch({ error: err, accepting: false });
      else patch({ accepting: false });
    }
  }

  function handleDiscard() {
    patch({ suggestion: null, text: "", error: null });
  }

  const over = text.length > DESCRIPTION_MAX;

  if (triggerOnly) {
    return (
      <button
        type="button"
        className="suggest-icon-btn"
        title="Suggest Description"
        aria-label="Suggest Description"
        onClick={handleRequest}
        disabled={loading || Boolean(suggestion)}
      >
        {loading ? "…" : <SparkleIcon />}
      </button>
    );
  }

  if (panelOnly && !suggestion && !error && !(topicId && hasSubtopics)) {
    return null;
  }

  return (
    <div className="suggestion">
      {!suggestion && topicId && hasSubtopics ? (
        <label className="suggestion-toggle">
          <input
            type="checkbox"
            checked={includeSubtopics}
            onChange={(e) => patch({ includeSubtopics: e.target.checked })}
            disabled={loading}
          />
          Include subtopics
        </label>
      ) : null}
      {suggestion ? (
        <div className="suggestion-review">
          <p className="eyebrow">Suggested description</p>
          <ContextNotice context={suggestion.context} />
          <MarkdownEditor
            label="Review suggestion"
            value={text}
            onChange={(value) => patch({ text: value })}
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
      ) : null}
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
